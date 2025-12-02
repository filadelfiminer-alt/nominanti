import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Vote } from "lucide-react";
import type { RecentVote } from "@shared/schema";

interface LiveFeedProps {
  votes: RecentVote[];
  isLoading: boolean;
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LiveFeed({ votes, isLoading }: LiveFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-chart-5" />
            Последние голоса
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-4 w-12 shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentVotes = votes.slice(0, 20);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-chart-5" />
          Последние голоса
          {recentVotes.length > 0 && (
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-5 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-5"></span>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {recentVotes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            Пока нет голосов
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {recentVotes.map((vote, index) => (
                <div
                  key={`${vote.voter}-${vote.nominee}-${vote.category}-${index}`}
                  className="flex items-start gap-2 text-sm"
                  data-testid={`vote-feed-${index}`}
                >
                  <span className="text-muted-foreground font-mono text-xs shrink-0 w-12">
                    {formatTime(vote.timestamp)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{vote.voter}</span>
                      {" "}
                      <Vote className="inline h-3 w-3 text-chart-2" />
                      {" "}
                      <span className="font-medium text-foreground">{vote.nominee}</span>
                    </span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {vote.category.length > 25 
                        ? vote.category.slice(0, 22) + "..." 
                        : vote.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
