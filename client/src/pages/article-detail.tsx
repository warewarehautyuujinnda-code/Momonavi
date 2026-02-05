import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/layout/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Article } from "@shared/schema";
import ReactMarkdown from "react-markdown";

function ArticleContent({ content }: { content: string }) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:underline hover:prose-a:no-underline first:prose-headings:mt-0">
      <ReactMarkdown>{content}</ReactMarkdown>
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
