import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  deleteRegisteredUser,
  listAllRegisteredUsers,
} from "@/lib/auth/usernameRegistry.server";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "adminDenied" }, { status: 403 });
}

function adminEmailFrom(request: Request) {
  return request.headers.get("x-admin-email");
}

export async function GET(request: Request) {
  if (!isAdminEmail(adminEmailFrom(request))) return unauthorized();

  try {
    const accounts = await listAllRegisteredUsers();
    return NextResponse.json({
      accounts: accounts.map((entry) => ({
        userId: entry.userId,
        username: entry.username,
        slug: entry.slug,
        email: entry.email,
        createdAt: entry.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ accounts: [] });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminEmail(adminEmailFrom(request))) return unauthorized();

  let body: { userId?: string };
  try {
    body = (await request.json()) as { userId?: string };
  } catch {
    return NextResponse.json({ error: "authErrorInvalid" }, { status: 400 });
  }

  const userId = body.userId?.trim();
  if (!userId) {
    return NextResponse.json({ error: "authErrorInvalid" }, { status: 400 });
  }

  const deleted = await deleteRegisteredUser(userId);
  return NextResponse.json({ ok: deleted });
}
