import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function run() {
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-2.5-pro"];
  const filename = "IMG_0502.jpeg";
  const filePath = path.join(process.cwd(), "public", filename);
  const base64Data = fs.readFileSync(filePath).toString("base64");

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
          "What is the exact name or text displayed in the logo in this image? Provide ONLY the name and nothing else."
        ],
      });
      console.log(`Success with ${model}: ${response.text?.trim()}`);
      break;
    } catch (e: any) {
      console.log(`Failed with ${model}: ${e.message || e}`);
    }
  }
}

run();
