import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";

  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "style-preference",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.error("Missing or malformed Authorization header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    log.error("Failed to decode user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const latestPreference = await prisma.style_preference.findFirst({
      where: { user_id: userId },
      orderBy: {
        timestamp: "desc",
      },
      select: {
        clothing_category: true,
        fashion_type: true,
      },
    });

    if (!latestPreference) {
      log.warn("No style preference found for user");
      return NextResponse.json({ message: "No preference found" }, { status: 404 });
    }

    log.info("Fetched latest style preference");
    return NextResponse.json(latestPreference);
  } catch (error) {
    log.error("Error retrieving style preference", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
