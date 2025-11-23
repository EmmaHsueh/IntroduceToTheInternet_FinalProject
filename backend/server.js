import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/moderation", async (req, res) => {
    try {
        const { text } = req.body;

        const moderationResponse = await client.moderations.create({
            model: "omni-moderation-latest",
            input: text
        });

        const result = moderationResponse.results[0];

        res.json({
            flagged: result.flagged,
            categories: result.categories,
            scores: result.category_scores
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Moderation error" });
    }
});

app.listen(3001, () => {
  console.log("Moderation backend running at http://localhost:3001");
});