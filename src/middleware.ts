import { NextRequest, NextResponse } from "next/server";

//Default middleware
export function middleware(request: NextRequest) {
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/image|_next/static|favicon.ico).*)"],
};
