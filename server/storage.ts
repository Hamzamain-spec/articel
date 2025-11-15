import { randomUUID } from "crypto";
import type { ArticleJob } from "@shared/schema";

export interface IStorage {
  createJob(totalArticles: number): Promise<ArticleJob>;
  getJob(id: string): Promise<ArticleJob | undefined>;
  updateJob(id: string, updates: Partial<ArticleJob>): Promise<void>;
}

export class MemStorage implements IStorage {
  private jobs: Map<string, ArticleJob>;

  constructor() {
    this.jobs = new Map();
  }

  async createJob(totalArticles: number): Promise<ArticleJob> {
    const id = randomUUID();
    const job: ArticleJob = {
      id,
      status: "pending",
      totalArticles,
      completedArticles: 0,
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: string): Promise<ArticleJob | undefined> {
    return this.jobs.get(id);
  }

  async updateJob(id: string, updates: Partial<ArticleJob>): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      this.jobs.set(id, { ...job, ...updates });
    }
  }
}

export const storage = new MemStorage();
