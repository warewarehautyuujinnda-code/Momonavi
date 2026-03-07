import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Mail, Menu, X } from "lucide-react";
import { useState } from "react";
import logoImg from "@assets/4_mk2U1SpZkwBOZcgYevdA1q_1771742587946_na1fn_L2hvbWUvdWJ1bnR1L_1772850885926.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "イベント情報", icon: Calendar },
    { href: "/groups", label: "団体紹介", icon: Users },
    { href: "/contact", label: "お問い合わせ＆掲載依頼", icon: Mail },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-100/60 backdrop-blur-md"
      style={{
        background: "linear-gradient(135deg, rgba(255,235,240,0.92) 0%, rgba(240,235,255,0.92) 50%, rgba(220,235,255,0.92) 100%)",
      }}
    >
      <div className="container-narrow">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-xl px-1 py-1 -mx-1" data-testid="link-home">
            <img src={logoImg} alt="MOMONAVI" className="h-14 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-xl transition-colors font-medium ${
                    isActive(item.href)
                      ? "bg-pink-100/80 text-pink-700 hover:bg-pink-200/80"
                      : "text-rose-900/70 hover:bg-pink-50/80 hover:text-pink-700"
                  }`}
                  data-testid={`nav-${item.href === "/" ? "events" : item.href.slice(1)}`}
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
            className="lg:hidden rounded-xl text-rose-900/70 hover:bg-pink-50/80 hover:text-pink-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-pink-100/60 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 rounded-xl font-medium ${
                    isActive(item.href)
                      ? "bg-pink-100/80 text-pink-700"
                      : "text-rose-900/70 hover:bg-pink-50/80 hover:text-pink-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.href === "/" ? "events" : item.href.slice(1)}`}
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
