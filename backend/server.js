import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis"; // 改用官方 googleapis 套件

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------
// 初始化 Perspective API
// ----------------------------------------
const API_KEY = process.env.PERSPECTIVE_API_KEY; // 確保 .env 裡有這個 Key
const DISCOVERY_URL =
  "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";

// 定義違規判定的分數門檻 (0.0 ~ 1.0)
// 建議設在 0.7 或 0.8，太低容易誤判
const THRESHOLD = 0.5;

// 定義要檢查的屬性與對應的中文名稱 (方便前端顯示)
const ATTRIBUTE_MAPPING = {
  TOXICITY: "惡意言論",
  SEVERE_TOXICITY: "嚴重惡意言論",
  IDENTITY_ATTACK: "人身攻擊",
  INSULT: "侮辱性言論",
  PROFANITY: "髒話/不雅字眼",
  THREAT: "威脅恐嚇",
  //SEXUALLY_EXPLICIT: "性暗示/色情內容"
};

// ----------------------------------------
// Moderation endpoint
// ----------------------------------------
app.post("/moderation", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "內容不能為空" });
  }

  console.log("收到 Perspective 審查請求：", content.slice(0, 50));

  try {
    // 建立 Client
    const client = await google.discoverAPI(DISCOVERY_URL);

    // 呼叫 Perspective API
    const analyzeRequest = {
      comment: {
        text: content,
      },
      // 指定語言有助於提高準確度，但也支援自動偵測
      languages: ["zh", "en"], 
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {},
        //SEXUALLY_EXPLICIT: {}
      },
    };

    const response = await client.comments.analyze({
      key: API_KEY,
      resource: analyzeRequest,
    });

const scores = response.data.attributeScores;
    
    let isFlagged = false;
    const flaggedCategories = {};

    console.log("----- 審查分數詳情 -----"); // 加入分隔線方便看

    for (const [key, value] of Object.entries(ATTRIBUTE_MAPPING)) {
      if (scores[key]) {
        const score = scores[key].summaryScore.value;
        
        // 2. 加入這行：強制把所有分數印出來，這樣我們才知道 AI 到底判斷幾分
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

    // 回傳符合前端預期的格式
    // 前端 PostForm.js 使用 checkResult.flagged 和 checkResult.categories
    const result = {
      flagged: isFlagged,
      categories: flaggedCategories
    };

    return res.json(result);

  } catch (error) {
    console.error("Perspective API 錯誤：", error.message);
    // 如果 API 呼叫失敗 (例如配額不足)，可以選擇讓使用者通過，或回傳錯誤
    res.status(500).json({ error: "審查服務暫時無法使用" });
  }
});

// ----------------------------------------
app.listen(3001, () => {
  console.log("Moderation backend (Perspective API) running at http://localhost:3001");
});