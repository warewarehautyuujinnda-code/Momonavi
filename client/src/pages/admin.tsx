import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AdminPage() {
  return (
    <Layout>
      <section className="container-narrow py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">管理画面</h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              GitHub Pagesでの公開版では、管理画面は利用できません。
            </p>
          </div>

          <Card className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-amber-900">
                <AlertCircle className="h-5 w-5" />
                ご利用いただけません
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-amber-900">
              <p>
                このサイトは GitHub Pages で公開されている静的版です。
                管理機能が必要な場合は、フルスタック版をご利用ください。
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">掲載依頼・お問い合わせについて：</p>
                <p>
                  <a 
                    href="/#/contact" 
                    className="text-blue-600 hover:underline"
                  >
                    お問い合わせページ
                  </a>
                  {" "}からGoogleフォームにアクセスしてください。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
