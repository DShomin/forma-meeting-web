import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10">
          <div className="flex size-16 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="size-9 text-yellow-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              로그인 오류
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              인증 과정에서 오류가 발생했습니다. 다시 시도해 주세요.
            </p>
          </div>
          <a
            href="/auth/signin"
            className="text-sm font-medium text-primary hover:underline"
          >
            다시 로그인
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
