import { NextResponse, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { jwtDecode } from "jwt-decode";

// Create Redis instance from env vars
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit: 10 requests per 60 seconds per user
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
});

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ 1. Exclude Kling callback route
  if (pathname === "/api/tryon/callback") {
    return NextResponse.next();
  }

  // 2. Require Bearer token
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  let userId: string | undefined;
  try {
    const decoded: any = jwtDecode(token);
    userId = decoded.sub;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // 3. Rate limit by user ID
  const { success, limit, remaining, reset } = await ratelimit.limit(userId);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  // 4. Allow request and attach rate limit headers
  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", limit.toString());
  res.headers.set("X-RateLimit-Remaining", remaining.toString());
  res.headers.set("X-RateLimit-Reset", reset.toString());
  return res;
}

export const config = {
  matcher: ["/api/:path*"], // Keep matching all API routes
};
