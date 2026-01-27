import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Users, UserPlus, BookOpen, Mail, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/events", label: "イベント情報", icon: Calendar },
    { href: "/groups", label: "団体紹介", icon: Users },
    { href: "/buddies", label: "仲間を探す", icon: UserPlus },
    { href: "/articles", label: "記事", icon: BookOpen },
    { href: "/contact", label: "お問い合わせ", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-background/95 dark:supports-[backdrop-filter]:bg-background/80 border-b border-border/40">
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-xl px-3 py-2 -mx-3" data-testid="link-home">
            <span className="font-bold text-xl tracking-tight text-primary">HOME</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href || location.startsWith(item.href + "/") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 rounded-xl"
                  data-testid={`nav-${item.href.slice(1)}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href || location.startsWith(item.href + "/") ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.href.slice(1)}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
