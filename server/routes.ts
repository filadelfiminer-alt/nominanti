import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { NOMINATION_CATEGORIES, type Vote } from "@shared/schema";

const THREAD_ID = "9429102";
const API_BASE = "https://prod-api.lolz.live";

interface LolzPost {
  post_id: number;
  poster_user_id: number;
  poster_username: string;
  post_body: string;
  post_body_plain_text?: string;
  post_create_date: number;
}

interface LolzResponse {
  posts: LolzPost[];
  thread?: {
    thread_id: number;
    reply_count: number;
  };
  links?: {
    pages?: number;
  };
}

async function fetchThreadPage(page: number = 1): Promise<LolzResponse | null> {
  const apiKey = process.env.LOLZ_API_KEY;
  if (!apiKey) {
    console.error("LOLZ_API_KEY not set");
    return null;
  }

  try {
    const url = `${API_BASE}/posts?thread_id=${THREAD_ID}&page=${page}`;
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`API error: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${text.substring(0, 500)}`);
      return null;
    }

    const data = await response.json();
    console.log(`Got ${data.posts?.length || 0} posts from page ${page}`);
    return data;
  } catch (error) {
    console.error("Failed to fetch thread:", error);
    return null;
  }
}

function parseNominationsFromPost(post: LolzPost): Vote[] {
  const votes: Vote[] = [];
  const text = post.post_body_plain_text || post.post_body || "";

  const lines = text.split(/\n|\r/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    
    const beforeColon = line.substring(0, colonIdx).trim().toLowerCase();
    const afterColon = line.substring(colonIdx + 1).trim();
    
    if (!afterColon) continue;
    
    let matchedCategory: string | null = null;
    
    for (const category of NOMINATION_CATEGORIES) {
      if (beforeColon === category.toLowerCase()) {
        matchedCategory = category;
        break;
      }
    }
    
    if (!matchedCategory) continue;
    
    const nominee = afterColon.replace(/^@/, "").split(/[\s,;|]+/)[0].trim();
    
    if (!nominee || nominee.length < 1 || nominee.length > 50) continue;

    votes.push({
      id: `${post.post_id}-${matchedCategory}-${nominee}`,
      category: matchedCategory,
      nominee: nominee.toLowerCase(),
      voterId: post.poster_user_id,
      voterUsername: post.poster_username,
      postId: post.post_id,
      timestamp: new Date(post.post_create_date * 1000).toISOString(),
    });
  }

  return votes;
}

function normalizeCategory(input: string): string | null {
  const normalized = input.toLowerCase().trim();

  for (const cat of NOMINATION_CATEGORIES) {
    if (cat.toLowerCase() === normalized) {
      return cat;
    }
  }

  for (const cat of NOMINATION_CATEGORIES) {
    const catWords = cat
      .toLowerCase()
      .replace(/[()]/g, "")
      .split(" ")
      .filter((w) => w.length > 2);
    const inputWords = normalized
      .replace(/[()]/g, "")
      .split(" ")
      .filter((w) => w.length > 2);

    const matchCount = catWords.filter((w) =>
      inputWords.some((iw) => iw.includes(w) || w.includes(iw))
    ).length;

    if (matchCount >= Math.max(1, catWords.length - 1)) {
      return cat;
    }
  }

  return null;
}

async function fetchAllPosts(): Promise<void> {
  console.log("Starting to fetch all posts from lolz.live thread...");

  const firstPage = await fetchThreadPage(1);
  if (!firstPage) {
    console.error("Failed to fetch first page");
    return;
  }

  const totalPages = firstPage.links?.pages || 1;
  await storage.setTotalPages(totalPages);
  console.log(`Total pages to process: ${totalPages}`);

  let newPostsCount = 0;
  const processedIds = await storage.getProcessedPostIds();

  for (const post of firstPage.posts) {
    if (processedIds.has(post.post_id)) continue;

    const votes = parseNominationsFromPost(post);
    for (const vote of votes) {
      await storage.addVote(vote);
    }
    await storage.addProcessedPostId(post.post_id);
    processedIds.add(post.post_id);
    newPostsCount++;
  }

  for (let page = 2; page <= totalPages; page++) {
    console.log(`Fetching page ${page}/${totalPages}...`);
    
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pageData = await fetchThreadPage(page);
    if (!pageData) {
      console.error(`Failed to fetch page ${page}`);
      continue;
    }

    for (const post of pageData.posts) {
      if (processedIds.has(post.post_id)) continue;

      const votes = parseNominationsFromPost(post);
      for (const vote of votes) {
        await storage.addVote(vote);
      }
      await storage.addProcessedPostId(post.post_id);
      processedIds.add(post.post_id);
      newPostsCount++;
    }
  }

  console.log(`Finished fetching all posts. New posts processed: ${newPostsCount}`);
}

let isFetching = false;
let initialFetchDone = false;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/nominations", async (_req, res) => {
    try {
      if (!initialFetchDone && !isFetching) {
        isFetching = true;
        fetchAllPosts()
          .then(() => {
            initialFetchDone = true;
            isFetching = false;
          })
          .catch((err) => {
            console.error("Error fetching posts:", err);
            isFetching = false;
          });
      }

      const [stats, categories, leaderboard, recentVotes] = await Promise.all([
        storage.getDashboardStats(),
        storage.getCategoryStats(),
        storage.getLeaderboard(),
        storage.getRecentVotes(20),
      ]);

      res.json({
        stats,
        categories,
        leaderboard,
        recentVotes,
      });
    } catch (error) {
      console.error("Error getting nominations:", error);
      res.status(500).json({ error: "Failed to get nominations" });
    }
  });

  app.post("/api/refresh", async (_req, res) => {
    try {
      if (isFetching) {
        res.json({ message: "Already refreshing", status: "in_progress" });
        return;
      }

      isFetching = true;
      await fetchAllPosts();
      isFetching = false;

      res.json({ message: "Refresh complete", status: "done" });
    } catch (error) {
      isFetching = false;
      console.error("Error refreshing:", error);
      res.status(500).json({ error: "Failed to refresh" });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      isFetching,
      initialFetchDone,
    });
  });

  return httpServer;
}
