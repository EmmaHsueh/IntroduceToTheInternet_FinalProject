import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import multer from "multer";     // 新增: 處理檔案上傳
import axios from "axios";       // 新增: 發送 HTTP 請求
import FormData from "form-data";// 新增: 建構 multipart/form-data
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// 🎯 關鍵檢查點：確認 Key 是否被載入
if (!process.env.GEMINI_API_KEY) {
    console.error("致命錯誤：GEMINI_API_KEY 未載入。請檢查 .env 檔案或環境變數設定。");
    // 您也可以選擇在這裡結束程式，防止後續錯誤
    // process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// 設定 Multer: 使用記憶體儲存，不存入硬碟，直接轉發
const upload = multer({ storage: multer.memoryStorage() });

// ----------------------------------------
// 1. RAG 向量知識庫系統 (新增)
// ----------------------------------------
const fs = require('fs');
const path = require('path');

// 載入知識庫文件
let KNOWLEDGE_BASE = [];
const KNOWLEDGE_FILE = path.join(__dirname, 'knowledge_base.txt');

/**
 * 載入並解析知識庫文件
 */
function loadKnowledgeBase() {
    try {
        if (!fs.existsSync(KNOWLEDGE_FILE)) {
            console.warn('⚠️ 知識庫文件不存在，使用空知識庫');
            return;
        }

        const content = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
        const lines = content.split('\n');

        KNOWLEDGE_BASE = [];

        for (const line of lines) {
            // 跳過註釋和空行
            if (line.trim().startsWith('#') || line.trim() === '') continue;

            // 解析格式: [分類] 問題 | 答案
            const match = line.match(/\[(.+?)\]\s*(.+?)\s*\|\s*(.+)/);
            if (match) {
                const [, category, question, answer] = match;
                KNOWLEDGE_BASE.push({
                    category: category.trim(),
                    question: question.trim(),
                    answer: answer.trim(),
                    text: `${question.trim()} ${answer.trim()}`, // 用於向量化的完整文本
                    vector: null // 將在初始化時計算
                });
            }
        }

        console.log(`✅ 成功載入 ${KNOWLEDGE_BASE.length} 條知識庫條目`);

        // 預計算所有知識庫向量
        for (const item of KNOWLEDGE_BASE) {
            item.vector = textToVector(item.text);
        }

    } catch (error) {
        console.error('❌ 載入知識庫失敗:', error);
    }
}

/**
 * 簡易中文分詞（基於字符）
 */
function simpleTokenize(text) {
    // 移除標點符號，保留中文、英文、數字
    const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ');
    // 分割成詞（中文按字，英文按詞）
    const tokens = [];

    // 處理中文（每個字作為一個 token）
    for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (/[\u4e00-\u9fa5]/.test(char)) {
            tokens.push(char);
        }
    }

    // 處理英文和數字（按空格分詞）
    const words = cleaned.match(/[a-zA-Z0-9]+/g) || [];
    tokens.push(...words.map(w => w.toLowerCase()));

    return tokens;
}

/**
 * 計算詞頻（TF）
 */
function computeTF(tokens) {
    const tf = {};
    const totalTokens = tokens.length;

    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
    }

    // 標準化
    for (const token in tf) {
        tf[token] = tf[token] / totalTokens;
    }

    return tf;
}

/**
 * 文本轉向量（簡化版 TF-IDF）
 */
function textToVector(text) {
    const tokens = simpleTokenize(text);
    const tf = computeTF(tokens);
    return tf;
}

/**
 * 計算餘弦相似度
 */
function cosineSimilarity(vec1, vec2) {
    const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (const key of allKeys) {
        const v1 = vec1[key] || 0;
        const v2 = vec2[key] || 0;

        dotProduct += v1 * v2;
        mag1 += v1 * v1;
        mag2 += v2 * v2;
    }

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * RAG 向量檢索函式：使用向量相似度檢索最相關的知識
 * @param {string} message 使用者訊息
 * @param {string} role 角色ID (可選，用於過濾分類)
 * @param {number} topK 返回前 K 條最相關的結果
 * @returns {Array} 檢索到的相關知識列表
 */
const retrieveFacts = (message, role = null, topK = 3) => {
    if (KNOWLEDGE_BASE.length === 0) {
        console.warn('⚠️ 知識庫為空');
        return [];
    }

    // 1. 將使用者問題轉換為向量
    const queryVector = textToVector(message);

    // 2. 計算與每條知識的相似度
    const results = KNOWLEDGE_BASE.map(item => ({
        ...item,
        similarity: cosineSimilarity(queryVector, item.vector)
    }));

    // 3. 按相似度排序
    results.sort((a, b) => b.similarity - a.similarity);

    // 4. 過濾相似度過低的結果（閾值 0.1）
    const filtered = results.filter(r => r.similarity > 0.1);

    // 5. 取前 topK 條
    const topResults = filtered.slice(0, topK);

    console.log(`🔍 檢索到 ${topResults.length} 條相關知識:`);
    topResults.forEach((r, i) => {
        console.log(`  ${i + 1}. [${r.category}] 相似度: ${r.similarity.toFixed(3)} - ${r.question.substring(0, 20)}...`);
    });

    // 6. 返回答案文本
    return topResults.map(r => r.answer);
};

// 啟動時載入知識庫
loadKnowledgeBase();


// ----------------------------------------
// 環境變數設定
// ----------------------------------------
const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY; // 讀取環境變數中的去背 Key

// Perspective Config
const DISCOVERY_URL = "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";
const THRESHOLD = 0.5;
const ATTRIBUTE_MAPPING = {
  TOXICITY: "惡意言論",
  SEVERE_TOXICITY: "嚴重惡意言論",
  IDENTITY_ATTACK: "人身攻擊",
  INSULT: "侮辱性言論",
  PROFANITY: "髒話/不雅字眼",
  THREAT: "威脅恐嚇",
};

// ----------------------------------------
// 1. 去背 API Endpoint (Proxy)
// ----------------------------------------
app.post("/remove-bg", upload.single("image_file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "未接收到圖片檔案" });
    }

    if (!REMOVE_BG_API_KEY) {
      console.error("Server Error: REMOVE_BG_API_KEY is missing in .env");
      return res.status(500).json({ error: "伺服器未設定 API Key" });
    }

    // 建構轉發給 remove.bg 的 FormData
    const formData = new FormData();
    formData.append("image_file", req.file.buffer, req.file.originalname);
    formData.append("size", "auto");

    console.log(`正在轉發圖片至 remove.bg: ${req.file.originalname}`);

    // 呼叫 remove.bg API
    const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": REMOVE_BG_API_KEY, // 這裡使用後端的 Key
      },
      responseType: "arraybuffer", // 確保接收二進位圖片資料
    });

    // 設定回傳 header 讓前端知道是圖片
    res.set("Content-Type", "image/png");
    res.send(response.data);

  } catch (error) {
    console.error("去背失敗:", error.response?.data ? error.response.data.toString() : error.message);
    
    // 嘗試解析 remove.bg 的錯誤訊息
    let errorMessage = "去背處理失敗";
    if (error.response && error.response.data) {
        try {
            const errJson = JSON.parse(error.response.data.toString());
            errorMessage = errJson.errors?.[0]?.title || errorMessage;
        } catch (e) {
            // ignore json parse error
        }
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// ----------------------------------------
// 2. Moderation Endpoint
// ----------------------------------------
app.post("/moderation", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "內容不能為空" });
  }

  console.log("收到 Perspective 審查請求：", content.slice(0, 50));

  try {
    const client = await google.discoverAPI(DISCOVERY_URL);

    const analyzeRequest = {
      comment: { text: content },
      languages: ["zh", "en"],
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {},
      },
    };

    const response = await client.comments.analyze({
      key: PERSPECTIVE_API_KEY,
      resource: analyzeRequest,
    });

    const scores = response.data.attributeScores;
    let isFlagged = false;
    const flaggedCategories = {};

    console.log("----- 審查分數詳情 -----");
    for (const [key, value] of Object.entries(ATTRIBUTE_MAPPING)) {
      if (scores[key]) {
        const score = scores[key].summaryScore.value;
        console.log(`項目: ${value} (${key}) -> 分數: ${score}`);

        if (score >= THRESHOLD) {
          flaggedCategories[value] = true;
          isFlagged = true;
          console.log(`⚠️ 違規！ ${value} 超過門檻`);
        } else {
          flaggedCategories[value] = false;
        }
      }
    }
    console.log("-----------------------");

    return res.json({
      flagged: isFlagged,
      categories: flaggedCategories
    });

  } catch (error) {
    console.error("Perspective API 錯誤：", error.message);
    res.status(500).json({ error: "審查服務暫時無法使用" });
  }
});

// ----------------------------------------
// 3. Gemini Chat Endpoint (已修改 RAG 邏輯)
// ----------------------------------------
app.post("/chat", async (req, res) => {
  try {
    const { message, role } = req.body;

    if (!message) return res.status(400).json({ reply: "訊息不能為空" });

    // 1. 設定角色人設
    let persona = "";
    switch (role) {
      case "gentle":
        persona = "你是師大的一位溫柔的學姊，說話體貼、有耐心。回答時使用溫柔、鼓勵的語氣，且多用學姊的口吻。";
        break;
      case "funny":
        persona = "你是師大的一位搞笑學長，講話幽默風趣、有點白爛但善良。回答時使用輕鬆、愛開玩笑的語氣，並加入學長的稱謂。";
        break;
      default:
        persona = "你是一隻常待在師大笨笨但可愛的大笨鳥，語氣呆萌。回答時像好朋友一樣提供滿滿的情緒價值，並自稱大笨鳥。";
    }

    // 2. RAG
    const facts = retrieveFacts(message, role);
    let context = "";
    if (facts.length > 0) {
      context = "【檢索到的師大校園資訊 (RAG)】\n" + facts.map(f => `- ${f}`).join('\n');
    } else {
      context = "【檢索到的師大校園資訊 (RAG)】\n無相關資訊。\n";
    }

    // 3. Prompt
    const prompt = `
角色設定：${persona}
${context}

使用者訊息：${message}
請根據角色風格回應：

必要時可以查詢師大網址:https://www.ntnu.edu.tw/進行回應
    `;

    // ✔ 正確 SDK 使用方式
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);

    const aiText = result.response.text();

    res.json({ reply: aiText });

  } catch (err) {
    console.error("Gemini API 錯誤：", err);
    const detailedError = (err.message || '無法連線到 AI 服務').slice(0, 100);
    res.status(500).json({ reply: `AI 服務錯誤：${detailedError}` });
  }
});

// ----------------------------------------
// 4. 翻譯 Endpoint
// ----------------------------------------
app.post("/api/translate", async (req, res) => {
  const { title, content, targetLanguage } = req.body;

  try {
    const fetch = (await import("node-fetch")).default;

    const translateText = async (text) => {
      if (!text) return "";

      const encodedText = encodeURIComponent(text);
      const langPair = `zh-CN|${targetLanguage}`;

      const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

      const response = await fetch(url);
      const data = await response.json();

      // MyMemory 返回結構 data.responseData.translatedText
      return data.responseData.translatedText;
    };

    const translatedTitle = await translateText(title);
    const translatedContent = await translateText(content);

    res.json({ translatedTitle, translatedContent });

  } catch (err) {
    console.error("翻譯失敗:", err);
    res.status(500).json({ error: "翻譯失敗，請稍後再試。" });
  }
});

// ----------------------------------------
// 4. RAG 知識庫測試端點
// ----------------------------------------
app.post("/api/rag-test", async (req, res) => {
  try {
    const { question, topK = 3 } = req.body;

    if (!question) {
      return res.status(400).json({ error: "問題不能為空" });
    }

    console.log(`🔍 RAG 測試查詢: "${question}"`);

    // 調用 RAG 檢索
    const facts = retrieveFacts(question, null, topK);

    // 返回結果
    res.json({
      success: true,
      question: question,
      topK: topK,
      results: facts,
      count: facts.length
    });

  } catch (error) {
    console.error("RAG 檢索失敗:", error);
    res.status(500).json({
      success: false,
      error: "知識庫檢索失敗",
      message: error.message
    });
  }
});

// 健康檢查端點
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    knowledgeBase: {
      loaded: KNOWLEDGE_BASE.length > 0,
      count: KNOWLEDGE_BASE.length
    }
  });
});


const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0'; // 這是關鍵！Render 需要這個才能連線

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});