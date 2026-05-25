"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignInPage() {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
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
        </CardContent>
      </Card>
    </main>
  );
}
