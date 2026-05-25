import { Card, CardContent } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

export default function DeniedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-5 py-10">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="size-9 text-destructive" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              접근이 거부되었습니다
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              이 서비스는 FORMA Confluence 워크스페이스 멤버만
              사용할 수 있습니다. 관리자에게 문의해 주세요.
            </p>
          </div>
          <a
            href="/auth/signin"
            className="text-sm font-medium text-primary hover:underline"
          >
            다른 계정으로 로그인
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
