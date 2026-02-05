import { useEffect } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { initRevealAnimations, observeNewRevealElements } from "@/lib/reveal";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  useEffect(() => {
    initRevealAnimations();
    const observer = observeNewRevealElements();
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
