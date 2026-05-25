"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SignInPage() {
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
            onClick={() => signIn("atlassian", { callbackUrl: "/" })}
          >
            Atlassian으로 로그인
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
