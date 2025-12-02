import { z } from "zod";

export const NOMINATION_CATEGORIES = [
  "Самый популярный пользователь форума года",
  "Камбек года",
  "Самый обсуждаемый пользователь года",
  "Самый активный участник форума года",
  "Чаттер года",
  "Бастер года",
  "Куратор года",
  "Модератор года",
  "Арбитр года",
  "Кодер года",
  "Селлер года (маркет)",
  "Селлер года (не маркет)",
  "Новостник года",
  "Оффтопер года",
  "Благодетель года",
  "Дизайнер года",
  "Сливщик года",
  "Нарушитель года",
  "Паста года",
  "Статья года",
  "Турнир года",
  "Завоз года",
  "Обновление года",
  "Бан года",
  "Скам года",
  "Розыгрыш года",
] as const;

export type NominationCategory = typeof NOMINATION_CATEGORIES[number];

export const voteSchema = z.object({
  id: z.string(),
  category: z.string(),
  nominee: z.string(),
  voterId: z.number(),
  voterUsername: z.string(),
  postId: z.number(),
  timestamp: z.string(),
});

export type Vote = z.infer<typeof voteSchema>;

export const nomineeStatsSchema = z.object({
  nominee: z.string(),
  category: z.string(),
  voteCount: z.number(),
  voters: z.array(z.string()),
});

export type NomineeStats = z.infer<typeof nomineeStatsSchema>;

export const categoryStatsSchema = z.object({
  category: z.string(),
  nominees: z.array(nomineeStatsSchema),
  totalVotes: z.number(),
});

export type CategoryStats = z.infer<typeof categoryStatsSchema>;

export const leaderboardEntrySchema = z.object({
  username: z.string(),
  totalVotes: z.number(),
  categories: z.array(z.object({
    name: z.string(),
    votes: z.number(),
  })),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const dashboardStatsSchema = z.object({
  totalVotes: z.number(),
  totalNominees: z.number(),
  totalCategories: z.number(),
  mostNominatedUser: z.string().nullable(),
  lastUpdated: z.string(),
  processedPosts: z.number(),
  totalPages: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const recentVoteSchema = z.object({
  voter: z.string(),
  nominee: z.string(),
  category: z.string(),
  timestamp: z.string(),
});

export type RecentVote = z.infer<typeof recentVoteSchema>;

export const apiResponseSchema = z.object({
  stats: dashboardStatsSchema,
  categories: z.array(categoryStatsSchema),
  leaderboard: z.array(leaderboardEntrySchema),
  recentVotes: z.array(recentVoteSchema),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;
