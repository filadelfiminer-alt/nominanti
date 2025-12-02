import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/stats-cards";
import { CategoryCard } from "@/components/category-card";
import { Leaderboard } from "@/components/leaderboard";
import { LiveFeed } from "@/components/live-feed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import type { ApiResponse } from "@shared/schema";

const THREAD_URL = "https://lolz.live/threads/9429102/";
const POLL_INTERVAL = 30000; // 30 seconds

export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery<ApiResponse>({
    queryKey: ["/api/nominations"],
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!isFetching) {
      setLastRefresh(new Date());
    }
  }, [isFetching]);

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await fetch("/api/refresh", { method: "POST" });
      await refetch();
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const formatLastUpdate = () => {
    return lastRefresh.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-medium">
                Номинации lolz.live 2024
              </h1>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-2"></span>
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Обновлено: {formatLastUpdate()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching || isManualRefreshing}
                data-testid="button-refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isFetching || isManualRefreshing ? "animate-spin" : ""
                  }`}
                />
                Обновить
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                data-testid="link-thread"
              >
                <a href={THREAD_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Тема
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
        <section aria-label="Статистика">
          <StatsCards stats={data?.stats} isLoading={isLoading} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6" aria-label="Категории">
            <h2 className="text-lg font-medium text-muted-foreground uppercase tracking-wide">
              Категории номинаций
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.categories.map((category) => (
                  <CategoryCard key={category.category} category={category} />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6" aria-label="Боковая панель">
            <Leaderboard
              entries={data?.leaderboard ?? []}
              isLoading={isLoading}
            />
            <LiveFeed votes={data?.recentVotes ?? []} isLoading={isLoading} />
          </aside>
        </div>

        <footer className="text-center text-sm text-muted-foreground py-4 border-t">
          <p>
            Данные обновляются автоматически каждые 30 секунд.
            {data?.stats?.processedPosts && (
              <span className="ml-2">
                Обработано постов: {data.stats.processedPosts} из {data.stats.totalPages} страниц
              </span>
            )}
          </p>
        </footer>
      </main>
    </div>
  );
}
