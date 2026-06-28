import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log("Analyzing last 2 images (IMG_0513, IMG_0514)...");
  const filenames = ["IMG_0513.jpeg", "IMG_0514.jpeg"];

  const results: Record<string, string> = {};
  if (fs.existsSync("brand_names_real.json")) {
    try {
      Object.assign(results, JSON.parse(fs.readFileSync("brand_names_real.json", "utf8")));
    } catch (e) {}
  }

  for (const filename of filenames) {
    const filePath = path.join(process.cwd(), "public", filename);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    const base64Data = fs.readFileSync(filePath).toString("base64");

    try {
      console.log(`Analyzing ${filename}...`);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
          "What is the exact brand name or main text displayed in the logo/graphic in this image? Provide only the actual brand name itself. Be highly accurate about spelling, spacing, and casing! e.g. 'ZENITHEDGE CONSULTING' or 'AURA' or 'ELEVATE'. Keep it super short, e.g. 1-3 words. Reply with ONLY that name and absolutely nothing else."
        ],
      });

      const brandName = response.text?.trim() || "";
      console.log(`${filename} -> ${brandName}`);
      results[filename] = brandName;
      fs.writeFileSync("brand_names_real.json", JSON.stringify(results, null, 2));
    } catch (error: any) {
      console.error(`Error analyzing ${filename}:`, error.message || error);
    }

    await sleep(13000); // 13 seconds delay
  }

  console.log("Chunk 4 finished!");
}

run();
