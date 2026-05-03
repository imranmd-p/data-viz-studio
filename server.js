import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ai", async (req, res) => {
  const { prompt, data } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a data analyst. Analyze the given data clearly.",
          },
          {
            role: "user",
            content: `Data: ${JSON.stringify(data)} \n\nQuestion: ${prompt}`,
          },
        ],
      }),
    });

    const result = await response.json();
    console.log("AI RESULT:", result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "AI error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
console.log(process.env.OPENAI_API_KEY);
console.log("KEY:", process.env.OPENAI_API_KEY);
