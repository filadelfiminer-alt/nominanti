import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trophy, Medal, Award } from "lucide-react";
import { useState } from "react";
import type { CategoryStats } from "@shared/schema";

interface CategoryCardProps {
  category: CategoryStats;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
  return null;
}

function getRankBg(rank: number) {
  if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20";
  if (rank === 2) return "bg-gray-400/10 border-gray-400/20";
  if (rank === 3) return "bg-amber-600/10 border-amber-600/20";
  return "";
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const nominees = category.nominees.slice().sort((a, b) => b.voteCount - a.voteCount);
  const displayedNominees = expanded ? nominees : nominees.slice(0, 5);
  const hasMore = nominees.length > 5;

  return (
    <Card className="hover-elevate flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium leading-tight">
            {category.category}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0 font-mono">
            {category.totalVotes}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {nominees.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Пока нет номинантов
          </p>
        ) : (
          <div className="space-y-2">
            {displayedNominees.map((nominee, index) => {
              const rank = index + 1;
              const icon = getRankIcon(rank);
              const rankBg = getRankBg(rank);
              
              return (
                <div
                  key={nominee.nominee}
                  className={`flex items-center justify-between gap-2 p-2 rounded-md ${
                    rank <= 3 ? `border ${rankBg}` : "hover:bg-muted/50"
                  }`}
                  data-testid={`nominee-${category.category}-${nominee.nominee}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {icon && <span className="shrink-0">{icon}</span>}
                    <span className="text-sm font-medium truncate">
                      {nominee.nominee}
                    </span>
                  </div>
                  <Badge
                    variant={rank === 1 ? "default" : "secondary"}
                    className="shrink-0 font-mono text-xs"
                  >
                    {nominee.voteCount}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-expand-${category.category}`}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Свернуть
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Показать все ({nominees.length})
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
