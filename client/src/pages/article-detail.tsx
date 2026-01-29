import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Article } from "@shared/schema";

function ArticleContent({ content }: { content: string }) {
  const paragraphs = content.split('\n\n');
  
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      {paragraphs.map((paragraph, index) => {
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-bold mt-8 mb-4 first:mt-0">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
              {paragraph.replace('### ', '')}
            </h3>
          );
        }
        if (paragraph.includes('\n')) {
          return (
            <div key={index} className="space-y-2">
              {paragraph.split('\n').map((line, lineIndex) => {
                if (line.startsWith('- ') || line.match(/^\d+\./)) {
                  return (
                    <p key={lineIndex} className="pl-4 text-muted-foreground">
                      {line}
                    </p>
                  );
                }
                return (
                  <p key={lineIndex} className="text-muted-foreground leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          );
        }
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

export default function ArticleDetailPage() {
  const [, params] = useRoute("/articles/:id");
  const articleId = params?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ["/api/articles", articleId],
    enabled: !!articleId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container-narrow py-8 space-y-8">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container-narrow py-16 text-center space-y-4">
          <p className="text-muted-foreground">記事が見つかりませんでした</p>
          <Link href="/articles">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              記事一覧に戻る
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const publishedDate = new Date(article.publishedAt);

  return (
    <Layout>
      <div className="container-narrow py-8 space-y-8">
        <Link href="/articles">
          <Button variant="ghost" size="sm" className="gap-2 rounded-xl -ml-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            記事一覧
          </Button>
        </Link>

        <article className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="rounded-lg">
                {article.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(publishedDate, "yyyy年M月d日", { locale: ja })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-lg text-muted-foreground">
              {article.summary}
            </p>

            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-lg">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          <ArticleContent content={article.content} />

          <div className="pt-8 border-t">
            <Link href="/articles">
              <Button variant="outline" className="gap-2 rounded-xl" data-testid="button-back-bottom">
                <ArrowLeft className="h-4 w-4" />
                他の記事を読む
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  );
}
