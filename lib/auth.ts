import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "mimi_session";

export function getAuthConfig() {
  const email = process.env.ADMIN_EMAIL || "mimi@kopikita.test";
  const password = process.env.ADMIN_PASSWORD || "kopikita";
  return { email, password };
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return value === "authenticated";
}


