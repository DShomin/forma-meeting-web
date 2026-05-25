"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isStandalone } from "@/lib/pwa";
import { ExternalLink, RefreshCw } from "lucide-react";

export default function SignInPage() {
  const [csrfToken, setCsrfToken] = useState("");
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    setIsPwa(isStandalone());
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

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

          {isPwa ? (
            <>
              <div className="w-full space-y-3">
                <p className="text-sm text-muted-foreground">
                  앱에서는 직접 로그인이 불가합니다.
                  Safari에서 로그인 후 돌아와 주세요.
                </p>
                <Button
                  className="h-12 w-full gap-2 text-sm font-semibold"
                  onClick={() => window.open(window.location.origin + "/auth/signin", "_blank")}
                >
                  <ExternalLink className="size-4" />
                  Safari에서 로그인
                </Button>
              </div>
              <Button
                variant="outline"
                className="h-11 w-full gap-2 text-sm"
                onClick={() => window.location.replace("/")}
              >
                <RefreshCw className="size-4" />
                로그인 완료 — 새로고침
              </Button>
            </>
          ) : (
            <>
              <form
                action="/api/auth/signin/atlassian"
                method="POST"
                className="w-full"
              >
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="callbackUrl" value="/" />
                <Button
                  type="submit"
                  className="h-12 w-full text-sm font-semibold"
                  disabled={!csrfToken}
                >
                  Atlassian으로 로그인
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                모바일에서 Jira 앱이 열리는 경우, 링크를 길게 눌러
                &quot;Safari에서 열기&quot;를 선택하세요
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
