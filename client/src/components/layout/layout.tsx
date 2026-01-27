import { Header } from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>新歓ナビ - 岡山の大学新入生を応援するサービス</p>
          <p className="mt-1">岡山大学 / 岡山理科大学 / ノートルダム清心女子大学</p>
        </div>
      </footer>
    </div>
  );
}
