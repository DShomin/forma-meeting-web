import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "https://record-meet.fastapicloud.dev";
const API_BEARER_TOKEN = process.env.API_BEARER_TOKEN ?? "";

export async function POST(request: NextRequest) {
  if (!API_BEARER_TOKEN) {
    return NextResponse.json(
      { error: "서버 인증 토큰이 설정되지 않았습니다" },
      { status: 500 },
    );
  }

  try {
    const incoming = await request.formData();

    const audio = incoming.get("audio");
    const title = incoming.get("title");
    const meetingDate = incoming.get("meeting_date");
    const attendees = incoming.getAll("attendees");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "오디오 파일이 필요합니다" },
        { status: 400 },
      );
    }

    if (typeof title !== "string" || !title) {
      return NextResponse.json(
        { error: "회의 제목이 필요합니다" },
        { status: 400 },
      );
    }

    if (typeof meetingDate !== "string" || !meetingDate) {
      return NextResponse.json(
        { error: "회의 날짜가 필요합니다" },
        { status: 400 },
      );
    }

    const body = new FormData();
    body.append("audio", audio, audio.name);
    body.append("title", title);
    body.append("meeting_date", meetingDate);
    for (const attendee of attendees) {
      body.append("attendees", attendee as string);
    }

    const res = await fetch(`${BACKEND_URL}/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `회의 생성에 실패했습니다 (${res.status})`, detail: text },
        { status: res.status },
      );
    }

    const data: { title: string; meeting_date: string; confluence_url: string } =
      await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `백엔드 연결 실패: ${message}` },
      { status: 502 },
    );
  }
}
