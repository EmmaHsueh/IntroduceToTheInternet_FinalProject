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
// 1. RAG 知識庫定義 (新增)
// ----------------------------------------
const KNOWLEDGE_BASE = [
  // 🎓 選課規範與流程
  {
    keywords: ['選課', '階段', '初選', '加退選', '授權碼'],
    fact: "師大選課主要分「初選」和「加退選」兩階段。初選多採志願或登記後分發，加退選則是即時選課。若因額滿使用**授權碼**加選，該課程原則上不得退選，僅能申請期中停修。",
    tags: ['Academic', 'BigStupidBird']
  },
  {
    keywords: ['衝堂', '學分上限', '停修', '學則'],
    fact: "選課最重要的是**嚴禁衝堂**（上課時間衝突），衝堂科目將以零分計算。學生每學期有學分上、下限規定，若要超修需依學則規定另行申請。另外，每學期通常可申請**期中停修**一門課（限3學分）。",
    tags: ['Academic', 'BigStupidBird']
  },
  {
    keywords: ['通識', '體育', '分發', '校際', '確認選課'],
    fact: "**通識**和**體育**課程多採**志願分發制**，選課時間早晚不影響分發結果。所有學生都應在選課結束前自行上網查詢並**確認選課結果**，若有疑義須立即向課務組反應。",
    tags: ['Academic', 'BigStupidBird', 'GentleSeniorSister']
  },
  // 🏆 社團與課外活動概況
  {
    keywords: ['社團', '課外活動', '玩中學', '軟實力', '競爭力'],
    fact: "課外活動是大學學習生活中非常重要的一環，臺師大秉持『玩中學、學中玩』的精神，鼓勵同學在社團中探索自我、開拓人際關係，並能藉此『玩出人才軟實力，提升就業競爭力』。",
    tags: ['HumorousSeniorBrother', 'GentleSeniorSister', 'Lifestyle']
  },
  {
    keywords: ['社團分類', '七大類', '學術', '藝文', '康樂', '體能', '服務', '聯誼'],
    fact: "師大社團種類繁多，共可分為七大類：**學術性**、**藝文性**、**康樂性**、**體能性**、**服務性**、**聯誼性**社團，以及**綜合性社團暨學生會**，種類多元，活力充沛。",
    tags: ['HumorousSeniorBrother', 'GentleSeniorSister']
  },
  {
    keywords: ['社團活動', '迎新', '社團評鑑', '社團人學程', '領導力'],
    fact: "課外活動指導組會辦理多項大型活動，例如：**社團迎新系列活動**、**黃金雨季社團評鑑**，更首創了『**社團人專業領導培力學分學程**』，讓同學透過實務結合學習組織經營管理。",
    tags: ['HumorousSeniorBrother', 'Academic']
  },
  // 🍔 師大周邊美食推薦
  {
    keywords: ['師園', '鹽酥雞', '鹹酥雞', '必修學分', '宵夜'],
    fact: "師大商圈最具代表性的宵夜是**師園鹽酥雞**，這家老店被許多師大學生戲稱為「必修學分」。它不僅提供外帶，也有內用座位。",
    tags: ['HumorousSeniorBrother', 'Lifestyle']
  },
  {
    keywords: ['燈籠滷味', '可麗餅', '阿諾', '甜點', '創始店'],
    fact: "師大美食的兩大經典地標：**燈籠滷味創始老店**和**阿諾可麗餅**總店。阿諾可麗餅口味豐富，甜鹹都有，是吃完正餐後的最佳甜點選擇。",
    tags: ['GentleSeniorSister', 'Lifestyle']
  },
  {
    keywords: ['蘿蔔絲餅', '菠蘿油', '好好味', '溫州街', '平價小吃'],
    fact: "推薦兩大平價點心：**溫州街蘿蔔絲餅達人**和**好好味冰火菠蘿油**。蘿蔔絲餅酥脆內餡飽滿；冰火菠蘿油則是下午茶或飯後甜點的最佳港式選擇。",
    tags: ['GentleSeniorSister', 'Lifestyle']
  },
];

/**
 * RAG 檢索函式：根據訊息內容和角色標籤進行檢索
 * @param {string} message 使用者訊息
 * @param {string} role 角色ID ('big', 'gentle', 'funny')
 * @returns {string[]} 檢索到的相關事實列表
 */
const retrieveFacts = (message, role) => {
    // 1. 根據角色 ID 決定對應的 tag
    let roleTag = '';
    if (role === 'gentle') roleTag = 'GentleSeniorSister';
    else if (role === 'funny') roleTag = 'HumorousSeniorBrother';
    else roleTag = 'BigStupidBird';

    const lowerCaseMessage = message.toLowerCase();
    const relevantFacts = [];

    // 2. 遍歷知識庫，進行關鍵詞匹配和角色標籤過濾
    for (const item of KNOWLEDGE_BASE) {
        const keywordMatch = item.keywords.some(keyword => lowerCaseMessage.includes(keyword));
        const roleMatch = item.tags.includes(roleTag); // 確保檢索到的事實與當前角色相關

        if (keywordMatch && roleMatch) {
            relevantFacts.push(item.fact);
        }
    }

    // 3. 避免重複，並限制數量
    return Array.from(new Set(relevantFacts)).slice(0, 3);
};


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
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "text 與 targetLang 為必填" });
  }

  try {
    // 這裡使用 Gemini 生成翻譯
    const prompt = `
將以下中文翻譯成 ${targetLang}：
${text}

請保留原文意思，保持簡潔明瞭。
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const translatedText = result.response.text();

    res.json({ translatedText });

  } catch (err) {
    console.error("翻譯 API 錯誤：", err.message);
    res.status(500).json({ error: "翻譯服務暫時無法使用" });
  }
});



const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0'; // 這是關鍵！Render 需要這個才能連線

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});