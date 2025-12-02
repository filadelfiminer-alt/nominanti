import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award } from "lucide-react";
import type { LeaderboardEntry } from "@shared/schema";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
}

function getRankDisplay(rank: number) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20">
        <Trophy className="h-4 w-4 text-yellow-500" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/20">
        <Medal className="h-4 w-4 text-gray-400" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/20">
        <Award className="h-4 w-4 text-amber-600" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 text-muted-foreground font-mono text-sm">
      {rank}
    </div>
  );
}

export function Leaderboard({ entries, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Общий рейтинг
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topEntries = entries.slice(0, 15);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Общий рейтинг
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            Пока нет данных
          </p>
        ) : (
          <div className="space-y-2">
            {topEntries.map((entry, index) => {
              const rank = index + 1;
              return (
                <div
                  key={entry.username}
                  className={`flex items-center gap-3 p-2 rounded-md ${
                    rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                  data-testid={`leaderboard-entry-${entry.username}`}
                >
                  {getRankDisplay(rank)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.categories.length} категори{entry.categories.length === 1 ? "я" : entry.categories.length < 5 ? "и" : "й"}
                    </p>
                  </div>
                  <Badge className="font-mono shrink-0">
                    {entry.totalVotes}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
