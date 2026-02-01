import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/layout";
import { ArrowRight, Users, MessageCircle, MapPin } from "lucide-react";
import heroImage from "@/assets/images/hero-students.jpg";

const reasons = [
  {
    icon: Users,
    title: "1人でも行きやすい新歓が見つかる",
    description: "「1人参加しやすさ」で安心度がひと目でわかります",
  },
  {
    icon: MessageCircle,
    title: "実際に行った人の声が見られる",
    description: "経験者たちのリアルな体験談を参考にできます",
  },
  {
    icon: MapPin,
    title: "岡山ローカルに絞って迷わない",
    description: "岡山大学・岡山理科大学・ノートルダム清心女子大学に特化",
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
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              新しい出会いがあなたの可能性を広げる
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-lg">
              1人でも安心して参加できる新歓イベントを探して、
              大学生活の第一歩を踏み出そう。
            </p>
            
            <div className="pt-4">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="gap-3 text-lg px-8 py-6 rounded-2xl shadow-lg"
                  data-testid="button-search-events"
                >
                  イベント情報を見る
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
              安心の3要素
            </h2>
            <p className="text-muted-foreground">
              新歓ナビだからできること
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            {reasons.map((reason, index) => (
              <div key={reason.title} className="text-left space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 flex shrink-0">
                    <reason.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-4xl font-bold text-primary/20">{index + 1}</span>
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
              だからこそ、経験者たちの声を参考に、
              <br className="hidden sm:block" />
              自分に合ったイベントを見つけてみませんか？
            </p>
            
            <div className="pt-4">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="gap-2 rounded-2xl px-8"
                  data-testid="button-find-events-cta"
                >
                  イベント情報を見る
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
