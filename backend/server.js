import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "./prompt.js";
import { extractJson, validateResult } from "./validation.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_CHARS = 12000;
export function createApp({ generate, expressFactory = express } = {}) {
  const app = expressFactory();
  app.use(express.json({ limit: "100kb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.post("/api/corrigir", async (req, res) => {
    const tema = typeof req.body?.tema === "string" ? req.body.tema.trim() : "";
    const redacao =
      typeof req.body?.redacao === "string" ? req.body.redacao.trim() : "";
    if (!redacao)
      return res
        .status(400)
        .json({ success: false, error: "Digite sua redação antes de enviar." });
    if (redacao.length < 120)
      return res
        .status(400)
        .json({
          success: false,
          error:
            "A redação está muito curta para uma correção pedagógica confiável.",
        });
    if (redacao.length > MAX_CHARS || tema.length > 500)
      return res
        .status(400)
        .json({ success: false, error: "O texto excede o limite permitido." });
    try {
      let raw;
      if (generate) raw = await generate({ tema, redacao });
      else {
        if (!process.env.GEMINI_API_KEY)
          return res
            .status(503)
            .json({
              success: false,
              error:
                "A correção ainda não foi configurada. Adicione a chave Gemini no servidor.",
            });
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await client.models.generateContent({
          model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
          contents: buildPrompt(tema, redacao),
          config: { responseMimeType: "application/json", temperature: 0.2 },
        });
        raw = response.text;
      }
      return res.json({
        success: true,
        resultado: validateResult(extractJson(raw)),
      });
    } catch (error) {
      console.error("Falha na correção:", error.message);
      return res
        .status(502)
        .json({
          success: false,
          error:
            "Não foi possível concluir a correção agora. Tente novamente em alguns instantes.",
        });
    }
  });
  app.use(express.static(path.join(__dirname, "..", "frontend")));
  return app;
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  createApp().listen(process.env.PORT || 3000, () =>
    console.log(`Redação IA em http://localhost:${process.env.PORT || 3000}`),
  );
