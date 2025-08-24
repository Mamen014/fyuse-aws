// app/api/tryon/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const logId = searchParams.get("log_id");

  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader);

  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "tryon-status",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.warn("Authorization header missing or malformed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    log.error("Failed to decode user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!logId) {
    log.warn("Missing log_id in query parameters");
    return NextResponse.json({ error: "Missing log_id" }, { status: 400 });
  }

  try {
    const record = await prisma.styling_log.findFirst({
      where: {
        id: logId,
        user_id: userId,
      },
      select: {
        status: true,
        styling_image_url: true,
        updated_at: true,
      },
    });

    if (!record) {
      log.warn("Task not found or unauthorized access attempt", { logId });
      return NextResponse.json({ error: "Task not found or not authorized" }, { status: 404 });
    }

    log.info("Status successfully retrieved", { status: record.status });
    return NextResponse.json({
      status: record.status,
      styling_image_url: record.styling_image_url,
      updated_at: record.updated_at,
    });
  } catch (err) {
    log.error("Error fetching try-on status", { error: err instanceof Error ? err.message : err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
