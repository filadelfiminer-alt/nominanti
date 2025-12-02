import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, LayoutGrid, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@shared/schema";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: "Всего голосов",
      value: stats?.totalVotes ?? 0,
      icon: TrendingUp,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Номинантов",
      value: stats?.totalNominees ?? 0,
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Категорий",
      value: stats?.totalCategories ?? 0,
      icon: LayoutGrid,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Лидер",
      value: stats?.mostNominatedUser ?? "—",
      icon: Trophy,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      isText: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover-elevate">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-md ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {card.title}
                </p>
                <p
                  className={`text-2xl font-bold font-mono ${card.isText ? "text-base" : ""}`}
                  data-testid={`stats-${card.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {card.isText ? card.value : card.value.toLocaleString("ru-RU")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
