import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout/layout";
import { 
  Sparkles, 
  Search, 
  Users, 
  Calendar, 
  Heart, 
  ArrowRight,
  Star,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "かんたん検索",
    description: "大学・ジャンル・1人参加しやすさで絞り込み",
  },
  {
    icon: Star,
    title: "リアルな口コミ",
    description: "先輩たちの体験談で雰囲気がわかる",
  },
  {
    icon: Users,
    title: "1人でも安心",
    description: "1人参加しやすさ指標で不安を解消",
  },
  {
    icon: Heart,
    title: "初心者歓迎",
    description: "未経験OKのイベントがひと目でわかる",
  },
];

const universities = [
  "岡山大学",
  "岡山理科大学", 
  "ノートルダム清心女子大学",
];

export default function HomePage() {
  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>岡山の大学新入生を応援</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              新しい出会いが、
              <br />
              <span className="gradient-text">あなたの新しい可能性</span>の
              <br />
              扉を開く
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              部活やサークルの新歓イベントを探して、
              大学生活を最高にスタートしよう！
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/events">
                <Button size="lg" className="gap-2 text-base w-full sm:w-auto" data-testid="button-search-events">
                  <Calendar className="h-5 w-5" />
                  イベントを探す
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/groups">
                <Button size="lg" variant="outline" className="gap-2 text-base w-full sm:w-auto" data-testid="button-search-groups">
                  <Users className="h-5 w-5" />
                  団体を探す
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            新歓ナビの特徴
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            対象大学
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {universities.map((uni) => (
              <Link key={uni} href={`/events?university=${encodeURIComponent(uni)}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer">
                  <CardContent className="py-6 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium">{uni}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold">
            不安を感じているあなたへ
          </h2>
          <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
            <p>
              「1人で行くのは不安...」「初心者でも大丈夫かな...」
            </p>
            <p>
              そんな気持ち、よくわかります。
              新歓ナビでは、1人参加しやすさや初心者歓迎の情報、
              先輩たちのリアルな口コミを見て、安心して参加できるイベントを探せます。
            </p>
            <p className="font-medium text-foreground">
              最初の一歩を踏み出すお手伝いをします。
            </p>
          </div>
          <Link href="/events">
            <Button size="lg" className="gap-2 mt-4" data-testid="button-find-events-cta">
              イベントを探してみる
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
