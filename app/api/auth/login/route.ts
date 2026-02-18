import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, getAuthConfig } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const admin = getAuthConfig();

  const ok = email === admin.email && password === admin.password;
  if (!ok) {
    return NextResponse.json({ error: "Email/password salah" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}


