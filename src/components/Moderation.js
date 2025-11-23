import express from "express";
import openai from "./openai.js";  // ← 路徑要對
const router = express.Router();

router.post("/check", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];

    res.json({
      flagged: result.flagged,
      categories: result.categories,
      scores: result.category_scores
    });

  } catch (error) {
    console.error("Moderation error:", error);
    res.status(500).json({ error: "Moderation failed" });
  }
});

export default router;
