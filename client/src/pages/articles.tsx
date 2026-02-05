import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Article } from "@shared/schema";

function ArticleCard({ article }: { article: Article }) {
  const publishedDate = new Date(article.publishedAt);
  
  return (
    <Link href={`/articles/${article.id}`}>
      <Card 
        className="rounded-2xl border-0 shadow-sm hover-elevate active-elevate-2 cursor-pointer h-full"
        data-testid={`article-card-${article.id}`}
      >
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-2xl flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-primary/50" />
        </div>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            {article.category && (
              <Badge variant="secondary" className="rounded-lg text-xs">
                {article.category}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(publishedDate, "M月d日", { locale: ja })}
            </span>
          </div>
          
          <h3 className="font-bold text-lg leading-snug line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {article.summary}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-lg text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center text-sm text-primary font-medium pt-2">
            続きを読む
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ArticleSkeleton() {
  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <Skeleton className="aspect-[16/9] rounded-t-2xl" />
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export default function ArticlesPage() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16 space-y-12">
        <div className="text-center space-y-4 pb-6 border-b">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">記事</h1>
          <p className="text-lg text-muted-foreground">
            新入生に役立つ情報や、運営者の想いをお届けします
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            記事はまだありません
          </div>
        )}
      </div>
    </Layout>
  );
}
