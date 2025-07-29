// app/api/remove-from-wardrobe/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";

  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "remove-from-wardrobe",
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
    const { log_id } = await req.json();

    if (!log_id) {
      log.warn("log_id is missing in request body");
      return NextResponse.json({ error: "log_id is required" }, { status: 400 });
    }

    log.info("Removing item from wardrobe", { log_id });

    const updatedLog = await prisma.styling_log.updateMany({
      where: {
        id: log_id,
        user_id: userId,
        wardrobe: true,
      },
      data: {
        wardrobe: false,
      },
    });

    if (updatedLog.count === 0) {
      log.warn("No matching wardrobe item found or already removed", { log_id });
      return NextResponse.json({ error: "No matching wardrobe item found or already removed." }, { status: 404 });
    }

    log.info("Wardrobe item successfully removed", { log_id });
    return NextResponse.json({ message: "Item removed from wardrobe." });
  } catch (err) {
    log.error("Failed to remove item from wardrobe", { error: (err as Error).message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
