import Groq from "groq-sdk";

export async function generateArticleWithGroq(
  keyword: string,
  url: string,
  apiKey: string
): Promise<string> {
  const groq = new Groq({ apiKey });
  
  const prompt = `Write 900 to 1000 words article on these keywords "${keyword}". I am creating this article for link building, this is the website url for helping "${url}". Also give me the title of the article, do not use headings, do not use bullet points, do not mention or add website URL, do not use curved apostrophes, article and keywords must be in english.`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error: any) {
    throw new Error(`Groq API error: ${error.message || "Failed to generate article"}`);
  }
}
