import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { articleGenerationRequestSchema } from "@shared/schema";
import { generateArticleWithGemini } from "./lib/gemini";
import { generateArticleWithGroq } from "./lib/groq";
import { cleanArticleText } from "./lib/textCleaner";
import { FileManager } from "./lib/fileManager";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/generate", async (req, res) => {
    try {
      const data = articleGenerationRequestSchema.parse(req.body);
      
      const totalArticles = data.keywords.length * data.articlesPerKeyword;
      const job = await storage.createJob(totalArticles);
      
      res.json(job);
      
      processArticleGeneration(
        job.id,
        data.keywords,
        data.apiProvider,
        data.apiKey,
        data.articlesPerKeyword
      ).catch(console.error);
      
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid request" });
    }
  });

  app.get("/api/job/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get job status" });
    }
  });

  app.get("/api/download/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      if (job.status !== "completed" || !job.zipPath) {
        return res.status(400).json({ error: "Articles not ready for download" });
      }
      
      if (!fs.existsSync(job.zipPath)) {
        return res.status(404).json({ error: "ZIP file not found" });
      }
      
      res.download(job.zipPath, "articles.zip", (err) => {
        if (err) {
          console.error("Download error:", err);
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Download failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processArticleGeneration(
  jobId: string,
  keywords: Array<{ keyword: string; url: string }>,
  apiProvider: "groq" | "gemini",
  apiKey: string,
  articlesPerKeyword: number
): Promise<void> {
  const fileManager = new FileManager(jobId);
  let articleNumber = 0;

  try {
    await storage.updateJob(jobId, { status: "processing" });

    for (const { keyword, url } of keywords) {
      for (let i = 0; i < articlesPerKeyword; i++) {
        articleNumber++;
        
        let article: string;
        if (apiProvider === "gemini") {
          article = await generateArticleWithGemini(keyword, url, apiKey);
        } else {
          article = await generateArticleWithGroq(keyword, url, apiKey);
        }
        
        const cleanedArticle = cleanArticleText(article);
        
        fileManager.saveArticle(articleNumber, {
          keyword,
          url,
          article: cleanedArticle,
        });
        
        await storage.updateJob(jobId, {
          completedArticles: articleNumber,
        });
      }
    }
    
    const zipPath = await fileManager.createZipArchive();
    
    await storage.updateJob(jobId, {
      status: "completed",
      zipPath,
    });
    
  } catch (error: any) {
    console.error("Article generation error:", error);
    await storage.updateJob(jobId, {
      status: "failed",
      error: error.message || "Failed to generate articles",
    });
  }
}
