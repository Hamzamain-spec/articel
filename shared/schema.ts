import { z } from "zod";

export const articleGenerationRequestSchema = z.object({
  keywords: z.array(z.object({
    keyword: z.string(),
    url: z.string().url(),
  })),
  apiProvider: z.enum(["groq", "gemini"]),
  apiKey: z.string().min(1),
  articlesPerKeyword: z.number().int().min(1).max(10),
});

export type ArticleGenerationRequest = z.infer<typeof articleGenerationRequestSchema>;

export const logEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  message: z.string(),
  type: z.enum(["info", "success", "error", "progress"]),
});

export type LogEntry = z.infer<typeof logEntrySchema>;

export const articleJobSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  totalArticles: z.number(),
  completedArticles: z.number(),
  zipPath: z.string().optional(),
  error: z.string().optional(),
});

export type ArticleJob = z.infer<typeof articleJobSchema>;
