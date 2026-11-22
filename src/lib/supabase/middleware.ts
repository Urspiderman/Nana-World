
import { type NextRequest } from "next/server";
import { updateSession } from "./proxy";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|mp3|mp4)$).*)",
  ],
};

