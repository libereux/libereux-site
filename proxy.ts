import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The old site used /Procurement. Redirect rules in next.config.ts match case-insensitively,
// which would also catch the new /procurement and loop, so this exact-case redirect lives here.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/Procurement") {
    return NextResponse.redirect(new URL("/procurement", request.url), 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/Procurement"],
};
