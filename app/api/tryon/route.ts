// app/api/tryon/route.ts

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSecrets } from "@/lib/secrets";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader);

  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "tryon",
  });

  let secrets;
  try {
    secrets = await getSecrets();
    log.info("Secrets fetched successfully");
  } catch (error) {
    log.error("Failed to fetch secrets", { error });
    return NextResponse.json({ error: "Secrets unavailable" }, { status: 500 });
  }

  const {
    KOLORS_ACCESS_KEY_ID,
    KOLORS_ACCESS_KEY_SECRET,
    KOLORS_API_URL,
    TESTING_CALLBACK_URL,
  } = secrets;

  const MODEL_NAME = "kolors-virtual-try-on-v1-5";

  function generateKolorsToken() {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign(
      { iss: KOLORS_ACCESS_KEY_ID, exp: now + 1800, nbf: now - 5 },
      KOLORS_ACCESS_KEY_SECRET
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    log.warn("Authorization header missing or malformed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    log.error("Failed to decode user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const existingTask = await prisma.styling_log.findFirst({
      where: { user_id: userId, status: "processing" },
    });

    if (existingTask) {
      log.warn("Previous task still processing", { taskId: existingTask.kling_task_id });
      return NextResponse.json({ error: "Previous task still processing" }, { status: 429 });
    }

    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      select: { user_image_url: true },
    });

    if (!profile?.user_image_url) {
      log.warn("User image not found in profile");
      return NextResponse.json({ error: "User image not found" }, { status: 400 });
    }

    const { item_id } = await req.json();
    if (!item_id) {
      log.warn("Missing item_id in request body");
      return NextResponse.json({ error: "Missing item_id in request" }, { status: 400 });
    }

    const product = await prisma.product_data.findUnique({
      where: { item_id },
      select: { product_image_url: true },
    });

    if (!product?.product_image_url) {
      log.warn("Product image not found for item_id", { item_id });
      return NextResponse.json({ error: "Cloth image not found" }, { status: 404 });
    }

    const payload = {
      model_name: MODEL_NAME,
      human_image: profile.user_image_url,
      cloth_image: product.product_image_url,
      callback_url: TESTING_CALLBACK_URL,
    };

    const kolorsToken = generateKolorsToken();

    log.info("Sending try-on request to Kling", {
      payload: { ...payload, cloth_image: "masked", human_image: "masked" }, // avoid logging real URLs
    });

    const tryonRes = await fetch(KOLORS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${kolorsToken}`,
      },
      body: JSON.stringify(payload),
    });

    const tryonData = await tryonRes.json();

    if (tryonData.code !== 0) {
      log.error("Kling API returned error", { klingError: tryonData.message });
      return NextResponse.json(
        { error: `Kling API error: ${tryonData.message}` },
        { status: 500 }
      );
    }

    const taskId = tryonData?.data?.task_id;
    if (!taskId) {
      log.error("task_id missing in Kling response");
      return NextResponse.json({ error: "Missing task_id in Kling response" }, { status: 500 });
    }

    const createdLog = await prisma.styling_log.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        item_id,
        kling_task_id: taskId,
        user_image_url: profile.user_image_url,
        status: "processing",
        wardrobe: true,
        created_at: new Date(),
      },
    });

    log.info("Try-on task successfully submitted", {
      logId: createdLog.id,
      taskId,
    });

    return NextResponse.json({
      message: "Try-on task submitted",
      log_id: createdLog.id,
    });

  } catch (err) {
    log.error("Unhandled error in try-on flow", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
