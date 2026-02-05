import { SiInstagram } from "react-icons/si";
import { BookOpen, ExternalLink } from "lucide-react";
import logoImg from "@/assets/images/momonavi-logo.png";

export function Footer() {
  const siteLinks = [
    { 
      href: "https://instagram.com/shinkan_navi", 
      label: "Instagram", 
      icon: SiInstagram,
      description: "最新情報をチェック"
    },
    { 
      href: "https://notion.so/shinkan-navi", 
      label: "Notion", 
      icon: BookOpen,
      description: "運営情報・更新ログ"
    },
  ];

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container-narrow py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="space-y-3">
            <img src={logoImg} alt="MOMONAVI" className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground max-w-xs">
              岡山の大学新入生向け新歓イベント検索サービス。
              新しい出会いへの一歩を応援します。
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">サイト公式リンク</h4>
            <div className="flex flex-col gap-2">
              {siteLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm hover-elevate rounded-xl px-3 py-2 -mx-3"
                  data-testid={`footer-link-${link.label.toLowerCase()}`}
                >
                  <link.icon className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-medium">{link.label}</span>
                    <span className="text-muted-foreground ml-2">{link.description}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© 2026 新歓ナビ. Some rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
