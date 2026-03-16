import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, MessageCircle } from "lucide-react";

// ===== URL設定 =====
// 掲載依頼フォームのURL
const SUBMISSION_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdLEiiExA-lh_m6XCbr2kfBeOgL1MLOJ6Lut7n_flk-1hHd4Q/viewform?usp=dialog";

// 問い合わせフォームのURL（作成後にこちらに設定してください）
const INQUIRY_FORM_URL = ""; // ← ここにGoogleフォームのURLを貼り付けてください
// ====================

export default function ContactPage() {
  return (
    <Layout>
      <section className="container-narrow py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
              お問い合わせ＆掲載依頼
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              ご連絡はこちらから
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              団体・イベントの掲載依頼や、サービスに関するお問い合わせは
              それぞれのフォームからお願いいたします。
            </p>
          </div>

          {/* 掲載依頼フォーム */}
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-primary" />
                掲載依頼フォーム
              </CardTitle>
              <CardDescription>
                新規掲載・イベント追加・情報更新のご依頼はこちらから。
                申請タイプを選択してご入力ください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full rounded-xl" data-testid="button-open-submission-form">
                <a href={SUBMISSION_FORM_URL} target="_blank" rel="noopener noreferrer">
                  掲載依頼フォームを開く
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* 問い合わせフォーム */}
          <Card className="rounded-2xl border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                お問い合わせフォーム
              </CardTitle>
              <CardDescription>
                サービスに関するご質問・ご意見はこちらから。
              </CardDescription>
            </CardHeader>
            <CardContent>
              {INQUIRY_FORM_URL ? (
                <Button asChild size="lg" variant="outline" className="w-full rounded-xl" data-testid="button-open-inquiry-form">
                  <a href={INQUIRY_FORM_URL} target="_blank" rel="noopener noreferrer">
                    お問い合わせフォームを開く
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="w-full rounded-xl" disabled>
                  お問い合わせフォームは準備中です
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
