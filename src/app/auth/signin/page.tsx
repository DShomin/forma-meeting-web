"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignInPage() {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const csrfRes = await fetch("/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();

    const form = new FormData();
    form.append("csrfToken", csrfToken);
    form.append("callbackUrl", "/");

    const res = await fetch("/api/auth/signin/atlassian", {
      method: "POST",
      body: new URLSearchParams(form as any),
      redirect: "manual",
    });

    if (res.type === "opaqueredirect" || res.status === 302) {
      const location = res.headers.get("location");
      if (location) {
        setAuthUrl(location);
        setLoading(false);
        return;
      }
    }

    const redirectUrl = res.url || res.headers.get("location");
    if (redirectUrl && redirectUrl.includes("auth.atlassian.com")) {
      setAuthUrl(redirectUrl);
      setLoading(false);
      return;
    }

    window.location.href = "/api/auth/signin/atlassian";
  }

  if (authUrl) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="flex flex-col items-center gap-6 py-10">
            <Image
              src="/logo-icon.svg"
              alt="FORMA"
              width={64}
              height={64}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Atlassian 로그인
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                아래 버튼을 눌러 Atlassian 로그인 페이지로 이동하세요.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Jira 앱이 열리는 경우, 링크를 길게 눌러 &quot;Safari에서 열기&quot;를 선택하세요.
              </p>
            </div>
            <a
              href={authUrl}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Atlassian으로 계속하기
            </a>
            <button
              onClick={() => setAuthUrl(null)}
              className="text-sm text-muted-foreground hover:underline"
            >
              돌아가기
            </button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <Image
            src="/logo-icon.svg"
            alt="FORMA"
            width={64}
            height={64}
            className="rounded-xl"
          />
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              FORMA 회의록
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Confluence 워크스페이스 멤버만 사용할 수 있습니다
            </p>
          </div>
          <Button
            className="h-12 w-full text-sm font-semibold"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "준비 중..." : "Atlassian으로 로그인"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
