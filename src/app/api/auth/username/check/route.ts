import { NextResponse } from "next/server";
import { checkUsernameAvailability } from "@/lib/auth/usernameRegistry.server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") ?? "";
  const email = searchParams.get("email") ?? undefined;

  if (!username.trim()) {
    return NextResponse.json({ available: false, error: "authErrorUsernameInvalid" });
  }

  const result = await checkUsernameAvailability(username, email);
  return NextResponse.json(result);
}
