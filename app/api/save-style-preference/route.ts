// api/save-style-preference/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

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

  if (!userId) {
    log.error("Unauthorized: failed to decode user ID from token");
>>>>>>> Stashed changes
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { clothing_category, fashion_type } = body;

<<<<<<< Updated upstream
    if (!clothing_category || !fashion_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create style preference
    const stylePreference = await prisma.style_preference.create({
      data: {
        user_id,
        clothing_category: clothing_category.toLowerCase(),
        fashion_type: fashion_type.toLowerCase(),
        timestamp: new Date(),
      },
    });

    return NextResponse.json(stylePreference, { status: 201 });
  } catch (err) {
    console.error("Error saving style preference:", err);
=======
    if (!clothing_category && !fashion_type) {
      log.warn("Bad Request: no valid fields provided", { bodyKeys: Object.keys(body) });
      return NextResponse.json(
        { error: "At least one of 'clothing_category' or 'fashion_type' must be provided" },
        { status: 400 }
      );
    }

    // Normalize inputs if present
    const updateData: Record<string, any> = {};
    if (clothing_category) updateData.clothing_category = clothing_category.toLowerCase();
    if (fashion_type) updateData.fashion_type = fashion_type.toLowerCase();

    // Defensive upsert
    const profile = await prisma.profile.upsert({
      where: { user_id: userId },
      update: {
        ...updateData,
      },
      create: {
        user_id: userId,
        ...updateData,
      },
    });

    log.info("Profile style preference updated", {
      userId,
      updatedFields: Object.keys(updateData),
      profileId: profile.user_id,
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (err: any) {
    log.error("Internal server error while saving style preference", {
      error: err?.message || err,
      stack: err?.stack,
    });
>>>>>>> Stashed changes
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
