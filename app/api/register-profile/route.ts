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
    routeName: "register-profile",
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

    const {
      gender,
      body_shape,
      skin_tone,
      user_image_url,
      nickname,
      birthdate,
      country,
      city,
      phone_number,
      occupation,
    } = body;

    log.info("Received profile registration data");

    const profile = await prisma.profile.upsert({
      where: { user_id: userId },
      update: {
        gender,
        body_shape,
        skin_tone,
        user_image_url,
        nickname,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        country,
        city,
        phone_number,
        occupation,
      },
      create: {
        user_id: userId,
        gender,
        body_shape,
        skin_tone,
        user_image_url,
        nickname,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        country,
        city,
        phone_number,
        occupation,
      },
    });

    log.info("User profile registered or updated");

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    log.error("Failed to register or update profile");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
