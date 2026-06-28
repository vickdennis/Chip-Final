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
  const filename = process.argv[2];
  if (!filename) {
    console.log("Please provide a filename");
    return;
  }
  const filePath = path.join(process.cwd(), "public", filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const base64Data = fs.readFileSync(filePath).toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      "What is the exact name or main text displayed in the logo/graphic in this image? Provide only the brand name, exactly as it is spelled and cased. If it contains symbols, ignore them. E.g. 'Rhythms' or 'Luxe'. Be extremely concise. Reply with ONLY that name."
    ],
  });

  console.log(`RESULT:${filename}:${response.text?.trim()}`);
}

run().catch(err => {
  console.error(err);
});
