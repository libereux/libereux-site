import { sessionCookie } from "@/lib/esign/auth";

export async function POST() {
  return new Response(null, { status: 204, headers: { "Set-Cookie": sessionCookie("", 0) } });
}
