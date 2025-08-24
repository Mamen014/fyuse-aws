// app/api/save-style-preference/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";

<<<<<<< HEAD
<<<<<<< Updated upstream
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let user_id: string;

  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    user_id = decoded.sub;
  } catch {
=======
  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "save-style-preference",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.error("Unauthorized: missing or malformed Authorization header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

=======
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

>>>>>>> main
  if (!userId) {
    log.error("Failed to decode user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { clothing_category, fashion_type } = body;

    if (!clothing_category || !fashion_type) {
      log.warn("Missing required fields in request body", {
        bodyKeys: Object.keys(body),
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stylePreference = await prisma.style_preference.create({
      data: {
        user_id: userId,
        clothing_category: clothing_category.toLowerCase(),
        fashion_type: fashion_type.toLowerCase(),
        timestamp: new Date(),
      },
    });

    log.info("Style preference saved", {
      clothing_category,
      fashion_type,
      id: stylePreference.id,
    });

    return NextResponse.json(stylePreference, { status: 201 });
  } catch (err) {
    log.error("Error saving style preference", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
