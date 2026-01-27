import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { ArrowRight, Users, MessageCircle, Sparkles } from "lucide-react";
import heroImage from "@/assets/images/hero-students.jpg";

const reasons = [
  {
    icon: Users,
    title: "1人でも大丈夫",
    description: "「1人参加しやすさ」で安心度がわかる",
  },
  {
    icon: MessageCircle,
    title: "リアルな声",
    description: "先輩たちの体験談が読める",
  },
  {
    icon: Sparkles,
    title: "初心者歓迎",
    description: "未経験OKが一目でわかる",
  },
];

export default function HomePage() {
  return (
    <Layout>
      <section className="relative min-h-[85vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        <div className="relative z-10 container-narrow py-20">
          <div className="max-w-2xl space-y-8">
            <p className="text-white/80 text-sm font-medium tracking-wide">
              岡山の大学新入生へ
            </p>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              最初の一歩を、
              <br />
              ここから。
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed max-w-lg">
              気になるサークル、見つけよう。
              <br className="hidden sm:block" />
              1人でも安心して参加できるイベントを探せます。
            </p>
            
            <div className="pt-4">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="gap-3 text-lg px-8 py-6 rounded-2xl shadow-lg"
                  data-testid="button-search-events"
                >
                  イベントを探す
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              新歓ナビでできること
            </h2>
            <p className="text-muted-foreground">
              不安を安心に変える3つの特徴
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {reasons.map((reason) => (
              <div key={reason.title} className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <reason.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{reason.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-muted/40">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              迷っているあなたへ
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              「1人で行くのは不安」「知らない人ばかりで緊張する」
              <br className="hidden sm:block" />
              その気持ち、みんな同じです。
            </p>
            <p className="text-foreground font-medium text-lg">
              だからこそ、先輩たちの声を参考に、
              <br className="hidden sm:block" />
              自分に合ったイベントを見つけてみませんか？
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="gap-2 rounded-2xl px-8"
                  data-testid="button-find-events-cta"
                >
                  イベントを探す
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/groups">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 rounded-2xl px-8"
                  data-testid="button-search-groups"
                >
                  団体を探す
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
