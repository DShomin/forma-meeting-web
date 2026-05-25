import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "https://record-meet.fastapicloud.dev";
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN ?? "";

export async function GET() {
  if (!API_BEARER_TOKEN) {
    return NextResponse.json(
      { error: "서버 인증 토큰이 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/users`, {
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `사용자 목록을 불러오지 못했습니다 (${res.status})`, detail: text },
        { status: res.status },
      );
    }

    const users: string[] = await res.json();
    return NextResponse.json(users);
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `백엔드 연결 실패: ${message}` },
      { status: 502 },
    );
  }
}
