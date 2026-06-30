import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/gemini", async (req, res) => {
    try {
      const { userPrompt, systemInstruction, tools, toolConfig } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is missing. Please set it in the Settings panel." });
      }

      if (!userPrompt && !req.body.contents) {
        return res.status(400).json({ error: "userPrompt or contents is required" });
      }

      const reqBody: any = {
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction,
        },
      };

      if (req.body.contents) {
         reqBody.contents = req.body.contents;
      } else {
         reqBody.contents = userPrompt;
      }

      if (tools) reqBody.config.tools = tools;
      if (toolConfig) reqBody.config.toolConfig = toolConfig;
      
      // Remove JSON response format if we are using tools, as it might interfere
      if (!tools) {
        reqBody.config.responseMimeType = "application/json";
      }

      const response = await ai.models.generateContent(reqBody);

      if (response.functionCalls && response.functionCalls.length > 0) {
        return res.json({ functionCalls: response.functionCalls });
      }

      const rawText = response.text || "";
      if (tools) {
        return res.json({ text: rawText });
      }
      
      const cleanText = rawText.replace(/```json\n?|```\n?/g, "").trim();
      const parsedJson = JSON.parse(cleanText);

      res.json(parsedJson);
    } catch (error: any) {
      let isRateLimit = false;
      let msg = error.message || "Internal server error";

      if (
        error.status === 429 ||
        msg.includes("429") ||
        msg.includes("Quota exceeded") ||
        msg.includes("RESOURCE_EXHAUSTED")
      ) {
        isRateLimit = true;
        msg =
          "Google Gemini API Rate Limit Exceeded. Please wait a few seconds and try again.";
        console.warn("Gemini API Rate Limit:", msg);
      } else {
        console.error("Gemini API Error:", error);
      }

      res.status(isRateLimit ? 429 : 500).json({ error: msg });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
