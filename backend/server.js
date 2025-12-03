import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import multer from "multer";     // 新增: 處理檔案上傳
import axios from "axios";       // 新增: 發送 HTTP 請求
import FormData from "form-data";// 新增: 建構 multipart/form-data

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 設定 Multer: 使用記憶體儲存，不存入硬碟，直接轉發
const upload = multer({ storage: multer.memoryStorage() });

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});