import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateArticleWithGemini(
  keyword: string,
  url: string,
  apiKey: string
): Promise<string> {
  const customAi = new GoogleGenAI({ apiKey });
  
  const prompt = `Write 900 to 1000 words article on these keywords "${keyword}". I am creating this article for link building, this is the website url for helping "${url}". Also give me the title of the article, do not use headings, do not use bullet points, do not mention or add website URL, do not use curved apostrophes, article and keywords must be in english.`;

  try {
    const response = await customAi.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    return response.text || "";
  } catch (error: any) {
    throw new Error(`Gemini API error: ${error.message || "Failed to generate article"}`);
  }
}
