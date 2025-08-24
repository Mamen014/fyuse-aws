// app/api/save-style-preference/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";

  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "save-style-preference",
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
    const body = await req.json();
    const { clothing_category, fashion_type } = body;

    // Normalize inputs if present
    const updateData: Partial<{ clothing_category: string; fashion_type: string }> = {};
    if (clothing_category) updateData.clothing_category = clothing_category.toLowerCase();
    if (fashion_type) updateData.fashion_type = fashion_type.toLowerCase();

    await prisma.profile.upsert({
      where: { user_id: userId },
      update: {
        ...updateData,
      },
      create: {
        user_id: userId,
        ...updateData,
      },
    });

    log.info("Style preference saved", {
      clothing_category,
      fashion_type,
      id: userId,
    });

    return NextResponse.json("Saved style successful", { status: 201 });
  } catch (err) {
    log.error("Error saving style preference", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
