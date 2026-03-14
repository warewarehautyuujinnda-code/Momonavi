import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail } from "lucide-react";

const CONTACT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdLEiiExA-lh_m6XCbr2kfBeOgL1MLOJ6Lut7n_flk-1hHd4Q/viewform?usp=dialog";

export default function ContactPage() {
  return (
    <Layout>
      <section className="container-narrow py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
              お問い合わせ＆掲載依頼
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Googleフォームからご連絡ください</h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              MOMONAVIではサイトを静的構成に変更したため、
              お問い合わせ・掲載依頼の受付はGoogleフォームに一本化しています。
            </p>
          </div>

          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-5 w-5 text-primary" />
                受付フォーム
              </CardTitle>
              <CardDescription>
                下のボタンからGoogleフォームを開き、必要事項をご入力ください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full rounded-xl" data-testid="button-open-google-form">
                <a href={CONTACT_FORM_URL} target="_blank" rel="noopener noreferrer">
                  お問い合わせ＆掲載依頼フォームを開く
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
