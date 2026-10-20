import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  if (!request.auth?.user) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};