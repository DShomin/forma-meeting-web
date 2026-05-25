"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function Step({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {step}
        </div>
        <div className="mt-1 w-px flex-1 bg-border" />
      </div>
      <div className="pb-6">
        <h3 className="text-sm font-semibold text-foreground leading-7">{title}</h3>
        <div className="mt-1 space-y-1.5 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-foreground pt-2 pb-1">{children}</h2>
  );
}

export default function GuidePage() {
  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-start px-4 py-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Link href="/">
            <Button variant="ghost" size="sm" className="-ml-2 gap-1 text-muted-foreground">
              <ArrowLeft className="size-4" />
              돌아가기
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">음성 메모 업로드 가이드</h1>
          <CardDescription>
            iPhone 음성 메모로 녹음한 회의 파일을 FORMA에 업로드하는 방법
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">

          <SectionTitle>1단계: 음성 메모를 파일 앱으로 내보내기</SectionTitle>

          <Step step={1} title="음성 메모 앱을 엽니다">
            <p>iPhone 홈 화면에서 <strong>음성 메모</strong> 앱을 실행합니다.</p>
          </Step>

          <Step step={2} title="녹음을 탭한 뒤 ⋯ 버튼을 탭합니다">
            <p>업로드할 녹음을 탭하고, 펼쳐진 녹음의 오른쪽 위 <strong>⋯</strong> (점 세 개) 버튼을 탭합니다.</p>
          </Step>

          <Step step={3} title="Share (공유)를 탭합니다">
            <p>메뉴 맨 위의 <strong>&ldquo;Share&rdquo;</strong> (공유) 버튼을 탭합니다.</p>
            <p>iOS 공유 시트가 나타납니다.</p>
          </Step>

          <Step step={4} title="&ldquo;파일에 저장&rdquo;을 선택합니다">
            <p>공유 시트에서 <strong>&ldquo;파일에 저장&rdquo;</strong> (Save to Files)을 탭합니다.</p>
            <p>파일 앱 화면이 열리면 저장할 위치를 선택합니다.</p>
            <p><strong>&ldquo;나의 iPhone&rdquo;</strong> 또는 <strong>&ldquo;iCloud Drive&rdquo;</strong> 어디든 괜찮습니다.</p>
            <p>오른쪽 상단의 <strong>&ldquo;저장&rdquo;</strong> 버튼을 탭합니다.</p>
            <div className="rounded-lg bg-muted/50 p-3 text-xs mt-2">
              <strong>Tip:</strong> &ldquo;회의 녹음&rdquo; 같은 전용 폴더를 만들어두면 나중에 찾기 쉽습니다.
            </div>
          </Step>

          <SectionTitle>2단계: FORMA에서 업로드하기</SectionTitle>

          <Step step={5} title="FORMA 회의록 웹 앱을 엽니다">
            <p>Safari에서 FORMA 회의록 페이지에 접속합니다.</p>
          </Step>

          <Step step={6} title="파일 업로드 영역을 탭합니다">
            <p><strong>&ldquo;파일을 드래그하거나 탭하여 선택&rdquo;</strong> 영역을 탭합니다.</p>
            <p>화면 하단에 <strong>&ldquo;파일 선택&rdquo;</strong> 메뉴가 나타납니다.</p>
          </Step>

          <Step step={7} title="저장한 녹음 파일을 선택합니다">
            <p><strong>&ldquo;파일 선택&rdquo;</strong>을 탭하면 파일 앱이 열립니다.</p>
            <p>아까 저장한 위치로 이동해서 녹음 파일(.m4a)을 탭하면 자동으로 첨부됩니다.</p>
          </Step>

          <Step step={8} title="회의 정보를 입력하고 생성합니다">
            <p>회의 제목, 참석자, 날짜를 입력한 뒤 <strong>&ldquo;회의록 생성&rdquo;</strong> 버튼을 누르면 완료됩니다.</p>
          </Step>

          <div className="rounded-lg border border-border bg-muted/30 p-4 mt-2">
            <h3 className="text-sm font-semibold text-foreground">지원 파일 형식</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              M4A, WAV, MP3 — 음성 메모 기본 형식(M4A)이 그대로 지원됩니다.
            </p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button className="h-12 w-full text-sm font-semibold">
                회의록 업로드하러 가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
