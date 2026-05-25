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

  return NextResponse.json({
    backendUrl: BACKEND_URL,
    token: API_BEARER_TOKEN,
  });
}
