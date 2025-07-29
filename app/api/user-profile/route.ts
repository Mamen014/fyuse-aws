import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const sessionId = request.headers.get("x-session-id") || "unknown";

  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "user-profile",
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
    let profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: { user_id: userId },
      });
      log.info("Created new user profile");
    } else {
      log.info("Fetched existing user profile");
    }

    return NextResponse.json({
      gender: profile.gender,
      skin_tone: profile.skin_tone,
      body_shape: profile.body_shape,
      occupation: profile.occupation,
      city: profile.city,
      nickname: profile.nickname,
      user_image_url: profile.user_image_url,
    });
  } catch (err) {
    log.error("Unexpected error fetching or creating user profile");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
