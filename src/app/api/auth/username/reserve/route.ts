import { NextResponse } from "next/server";
import { reserveUsername } from "@/lib/auth/usernameRegistry.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { userId?: string; username?: string; email?: string };
  try {
    body = (await request.json()) as { userId?: string; username?: string; email?: string };
  } catch {
    return NextResponse.json({ error: "authErrorInvalid" }, { status: 400 });
  }

  const userId = body.userId?.trim();
  const username = body.username?.trim();
  const email = body.email?.trim();

  if (!userId || !username || !email) {
    return NextResponse.json({ error: "authErrorInvalid" }, { status: 400 });
  }

  const result = await reserveUsername({ userId, username, email });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
