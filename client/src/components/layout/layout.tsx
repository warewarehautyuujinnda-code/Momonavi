import { Header } from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-12 bg-muted/30">
        <div className="container-narrow text-center space-y-3">
          <p className="font-medium text-foreground">新歓ナビ</p>
          <p className="text-sm text-muted-foreground">
            岡山大学 / 岡山理科大学 / ノートルダム清心女子大学
          </p>
          <p className="text-xs text-muted-foreground/70">
            新入生の「最初の一歩」を応援します
          </p>
        </div>
      </footer>
    </div>
  );
}
