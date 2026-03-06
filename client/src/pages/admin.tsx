import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, LogOut, RefreshCw, Mail, Calendar, MapPin, Tag, Users, Link as LinkIcon } from "lucide-react";
import type { Submission } from "@shared/schema";

type Tab = "pending" | "approved" | "rejected" | "all";

async function adminFetch(url: string, adminKey: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "エラーが発生しました");
  }
  return res.json();
}

function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminFetch("/api/submissions", key);
      onLogin(key);
    } catch {
      setError("管理者キーが正しくありません");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold">管理者ログイン</CardTitle>
          <p className="text-sm text-gray-500">新歓ナビ 管理画面</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="管理者キーを入力"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                data-testid="input-admin-key"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={!key || loading} data-testid="button-login">
              {loading ? "確認中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") return <Badge className="bg-amber-100 text-amber-700 border-amber-200">未処理</Badge>;
  if (status === "approved") return <Badge className="bg-green-100 text-green-700 border-green-200">承認済み</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200">却下</Badge>;
}

function SubmissionCard({
  sub,
  adminKey,
  onAction,
}: {
  sub: Submission;
  adminKey: string;
  onAction: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => adminFetch(`/api/submissions/${sub.id}/approve`, adminKey, { method: "POST" }),
    onSuccess: () => {
      toast({ title: "承認しました", description: `${sub.groupName} をサイトに掲載しました。` });
      qc.invalidateQueries({ queryKey: ["/api/submissions"] });
      onAction();
    },
    onError: (e: Error) => toast({ title: "エラー", description: e.message, variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminFetch(`/api/submissions/${sub.id}/reject`, adminKey, { method: "POST" }),
    onSuccess: () => {
      toast({ title: "却下しました" });
      qc.invalidateQueries({ queryKey: ["/api/submissions"] });
      onAction();
    },
    onError: (e: Error) => toast({ title: "エラー", description: e.message, variant: "destructive" }),
  });

  const isPending = sub.status === "pending";
  const createdAt = new Date(sub.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Card className="border border-gray-200 shadow-sm" data-testid={`card-submission-${sub.id}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-lg" data-testid={`text-group-name-${sub.id}`}>{sub.groupName}</h2>
              <StatusBadge status={sub.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{sub.groupUniversity} · {sub.groupCategory} · {sub.groupGenre}</p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{createdAt}</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{sub.groupDescription}</p>

        <div className="flex flex-wrap gap-1.5">
          {sub.groupAtmosphereTags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate" data-testid={`text-requester-email-${sub.id}`}>{sub.requesterEmail}</span>
          </div>
          {sub.requesterName && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{sub.requesterName}</span>
            </div>
          )}
          {sub.groupContactInfo && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{sub.groupContactInfo}</span>
            </div>
          )}
          {(sub.groupInstagramUrl || sub.groupTwitterUrl || sub.groupLineUrl) && (
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="flex gap-2">
                {sub.groupInstagramUrl && <a href={sub.groupInstagramUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Instagram</a>}
                {sub.groupTwitterUrl && <a href={sub.groupTwitterUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">X/Twitter</a>}
                {sub.groupLineUrl && <a href={sub.groupLineUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">LINE</a>}
              </span>
            </div>
          )}
        </div>

        {sub.eventTitle && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">イベント情報</p>
            <p className="font-medium text-sm">{sub.eventTitle}</p>
            {sub.eventDescription && <p className="text-sm text-gray-600">{sub.eventDescription}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {sub.eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(sub.eventDate).toLocaleDateString("ja-JP")}
                </span>
              )}
              {sub.eventLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {sub.eventLocation}
                </span>
              )}
            </div>
          </div>
        )}

        {sub.message && (
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-500 mb-1">メッセージ</p>
            <p>{sub.message}</p>
          </div>
        )}

        {isPending && (
          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              data-testid={`button-approve-${sub.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {approveMutation.isPending ? "承認中..." : "承認してサイトに掲載"}
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => rejectMutation.mutate()}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              data-testid={`button-reject-${sub.id}`}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              {rejectMutation.isPending ? "却下中..." : "却下"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("admin_key") ?? "");
  const [tab, setTab] = useState<Tab>("pending");
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleLogin = (key: string) => {
    sessionStorage.setItem("admin_key", key);
    setAdminKey(key);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_key");
    setAdminKey("");
  };

  const { data: submissions = [], isLoading, isError, refetch } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    queryFn: () => adminFetch("/api/submissions", adminKey),
    enabled: !!adminKey,
    retry: false,
  });

  if (!adminKey) return <LoginScreen onLogin={handleLogin} />;

  if (isError) {
    sessionStorage.removeItem("admin_key");
    setAdminKey("");
    return <LoginScreen onLogin={handleLogin} />;
  }

  const filtered = tab === "all" ? submissions : submissions.filter((s) => s.status === tab);
  const counts = {
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    all: submissions.length,
  };

  const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: "pending", label: "未処理", icon: Clock },
    { key: "approved", label: "承認済み", icon: CheckCircle },
    { key: "rejected", label: "却下", icon: XCircle },
    { key: "all", label: "すべて", icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">管理画面</h1>
            <p className="text-xs text-gray-500">新歓ナビ 掲載依頼管理</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { refetch(); toast({ title: "更新しました" }); }}
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-1" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              data-testid={`tab-${key}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`text-xs rounded-full px-1.5 ${tab === key ? "bg-purple-500" : "bg-gray-100 text-gray-500"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {tab === "pending" ? "未処理の申請はありません" : "該当する申請はありません"}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((sub) => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                adminKey={adminKey}
                onAction={() => qc.invalidateQueries({ queryKey: ["/api/submissions"] })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
