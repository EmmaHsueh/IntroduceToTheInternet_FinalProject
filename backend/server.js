import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/moderation", async (req, res) => {
  const { content } = req.body;
  console.log("收到 moderation 請求：", content?.slice(0,50));

  try {
    let response;
    for (let i = 0; i < 3; i++) {
      try {
        response = await client.moderations.create({
          model: "omni-moderation-latest",
          input: content
        });
        break; // 成功就跳出
      } catch (err) {
        if (err.status === 429) {
          console.log("被 rate limit，重試中...");
          await new Promise(r => setTimeout(r, 1000)); // 延遲再試
          continue;
        }
        throw err; // 其他錯誤直接丟
      }
    }

    res.json({ 
      flagged: response.results[0].flagged,
      categories: response.results[0].categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Moderation backend running at http://localhost:3001");
});
