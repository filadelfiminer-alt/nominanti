import { NOMINATION_CATEGORIES, type Vote, type CategoryStats, type LeaderboardEntry, type DashboardStats, type RecentVote } from "@shared/schema";

export interface IStorage {
  addVote(vote: Vote): Promise<void>;
  getVotes(): Promise<Vote[]>;
  getCategoryStats(): Promise<CategoryStats[]>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getDashboardStats(): Promise<DashboardStats>;
  getRecentVotes(limit?: number): Promise<RecentVote[]>;
  getProcessedPostIds(): Promise<Set<number>>;
  addProcessedPostId(postId: number): Promise<void>;
  setTotalPages(pages: number): Promise<void>;
  getTotalPages(): Promise<number>;
  clear(): Promise<void>;
}

export class MemStorage implements IStorage {
  private votes: Map<string, Vote>;
  private processedPostIds: Set<number>;
  private totalPages: number;
  private lastUpdated: Date;

  constructor() {
    this.votes = new Map();
    this.processedPostIds = new Set();
    this.totalPages = 0;
    this.lastUpdated = new Date();
  }

  async addVote(vote: Vote): Promise<void> {
    const key = `${vote.voterId}-${vote.category}-${vote.nominee}`;
    if (!this.votes.has(key)) {
      this.votes.set(key, vote);
      this.lastUpdated = new Date();
    }
  }

  async getVotes(): Promise<Vote[]> {
    return Array.from(this.votes.values());
  }

  async getCategoryStats(): Promise<CategoryStats[]> {
    const votes = await this.getVotes();
    const categoryMap = new Map<string, Map<string, { count: number; voters: string[] }>>();

    for (const category of NOMINATION_CATEGORIES) {
      categoryMap.set(category, new Map());
    }

    for (const vote of votes) {
      const normalizedCategory = this.normalizeCategory(vote.category);
      if (!normalizedCategory) continue;

      if (!categoryMap.has(normalizedCategory)) {
        categoryMap.set(normalizedCategory, new Map());
      }

      const nominees = categoryMap.get(normalizedCategory)!;
      const nominee = vote.nominee.toLowerCase();
      
      if (!nominees.has(nominee)) {
        nominees.set(nominee, { count: 0, voters: [] });
      }
      
      const nomineeData = nominees.get(nominee)!;
      nomineeData.count++;
      if (!nomineeData.voters.includes(vote.voterUsername)) {
        nomineeData.voters.push(vote.voterUsername);
      }
    }

    const result: CategoryStats[] = [];
    
    for (const [category, nominees] of categoryMap) {
      const nomineeStats = Array.from(nominees.entries())
        .map(([nominee, data]) => ({
          nominee: this.formatUsername(nominee),
          category,
          voteCount: data.count,
          voters: data.voters,
        }))
        .sort((a, b) => b.voteCount - a.voteCount);

      result.push({
        category,
        nominees: nomineeStats,
        totalVotes: nomineeStats.reduce((sum, n) => sum + n.voteCount, 0),
      });
    }

    return result.sort((a, b) => {
      const indexA = NOMINATION_CATEGORIES.indexOf(a.category as any);
      const indexB = NOMINATION_CATEGORIES.indexOf(b.category as any);
      return indexA - indexB;
    });
  }

  private formatUsername(username: string): string {
    return username.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private normalizeCategory(category: string): string | null {
    const normalized = category.toLowerCase().trim();
    
    for (const cat of NOMINATION_CATEGORIES) {
      if (cat.toLowerCase() === normalized) {
        return cat;
      }
    }
    
    for (const cat of NOMINATION_CATEGORIES) {
      if (cat === category) {
        return cat;
      }
    }
    
    return null;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const votes = await this.getVotes();
    const userMap = new Map<string, { totalVotes: number; categories: Map<string, number> }>();

    for (const vote of votes) {
      const nominee = vote.nominee.toLowerCase();
      const normalizedCategory = this.normalizeCategory(vote.category);
      if (!normalizedCategory) continue;

      if (!userMap.has(nominee)) {
        userMap.set(nominee, { totalVotes: 0, categories: new Map() });
      }

      const userData = userMap.get(nominee)!;
      userData.totalVotes++;
      
      const currentCount = userData.categories.get(normalizedCategory) || 0;
      userData.categories.set(normalizedCategory, currentCount + 1);
    }

    return Array.from(userMap.entries())
      .map(([username, data]) => ({
        username: this.formatUsername(username),
        totalVotes: data.totalVotes,
        categories: Array.from(data.categories.entries())
          .map(([name, votes]) => ({ name, votes }))
          .sort((a, b) => b.votes - a.votes),
      }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const votes = await this.getVotes();
    const leaderboard = await this.getLeaderboard();
    const categoryStats = await this.getCategoryStats();

    const categoriesWithVotes = categoryStats.filter(c => c.totalVotes > 0).length;

    return {
      totalVotes: votes.length,
      totalNominees: leaderboard.length,
      totalCategories: categoriesWithVotes,
      mostNominatedUser: leaderboard[0]?.username ?? null,
      lastUpdated: this.lastUpdated.toISOString(),
      processedPosts: this.processedPostIds.size,
      totalPages: this.totalPages,
    };
  }

  async getRecentVotes(limit: number = 20): Promise<RecentVote[]> {
    const votes = await this.getVotes();
    
    return votes
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(v => ({
        voter: v.voterUsername,
        nominee: this.formatUsername(v.nominee),
        category: this.normalizeCategory(v.category) || v.category,
        timestamp: v.timestamp,
      }));
  }

  async getProcessedPostIds(): Promise<Set<number>> {
    return new Set(this.processedPostIds);
  }

  async addProcessedPostId(postId: number): Promise<void> {
    this.processedPostIds.add(postId);
  }

  async setTotalPages(pages: number): Promise<void> {
    this.totalPages = pages;
  }

  async getTotalPages(): Promise<number> {
    return this.totalPages;
  }

  async clear(): Promise<void> {
    this.votes.clear();
    this.processedPostIds.clear();
    this.totalPages = 0;
    this.lastUpdated = new Date();
  }
}

export const storage = new MemStorage();
