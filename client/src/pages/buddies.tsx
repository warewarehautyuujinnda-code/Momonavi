import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Heart, AlertTriangle, MessageCircle, ExternalLink } from "lucide-react";

export default function BuddiesPage() {
  return (
    <Layout>
      <div className="container-narrow py-12 sm:py-16 space-y-12">
        <div className="text-center space-y-4 pb-6 border-b">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            1人が不安なら、仲間を探そう
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            「行きたいイベントがあるけど、1人じゃ心細い...」
            そんな時は、同じ想いを持つ仲間を探してみませんか？
          </p>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 sm:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <MessageCircle className="h-12 w-12 text-primary" />
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">公式LINEで仲間を探す</h2>
                <p className="text-muted-foreground max-w-md">
                  新歓ナビ公式LINEでは、同じイベントに行きたい仲間を募集・探すことができます。
                  気軽にメッセージを送ってみてください。
                </p>
              </div>
              <Button 
                size="lg" 
                className="gap-2 rounded-xl"
                asChild
                data-testid="button-line-cta"
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  公式LINEで仲間を探す
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                ※ 現在準備中です。近日公開予定。
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-center">安全にご利用いただくために</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">個人情報は慎重に</h3>
                <p className="text-sm text-muted-foreground">
                  本名、住所、電話番号などの個人情報は安易に共有しないでください。
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">無理なく参加</h3>
                <p className="text-sm text-muted-foreground">
                  合わないと感じたら無理に一緒にいる必要はありません。自分のペースを大切に。
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">困ったら相談</h3>
                <p className="text-sm text-muted-foreground">
                  トラブルがあったら、すぐに運営や大学の相談窓口に連絡してください。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-muted rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">ご注意ください</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>・ 初対面の人と会う際は、公共の場所で待ち合わせしましょう</li>
                <li>・ 2人きりになる状況は避け、友人に予定を伝えておきましょう</li>
                <li>・ 不審に感じたらすぐにその場を離れてください</li>
                <li>・ 金銭のやり取りは絶対に行わないでください</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
