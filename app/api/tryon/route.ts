// app/api/tryon/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { prisma } from "@/lib/prisma";
import { getSecrets } from "@/lib/secrets";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  let secrets;
  try {
    secrets = await getSecrets();
  } catch (error) {
    console.error("❌ Failed to fetch secrets:", error);
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

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let user_id: string;
  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    user_id = decoded.sub;
  } catch (err) {
    console.error("⚠️ Failed to decode JWT token:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const existingTask = await prisma.styling_log.findFirst({
      where: { user_id, status: "processing" },
    });

    if (existingTask) {
      return NextResponse.json({ error: "Previous task still processing" }, { status: 429 });
    }

    const profile = await prisma.profile.findUnique({
      where: { user_id },
      select: { user_image_url: true },
    });

    if (!profile?.user_image_url) {
      return NextResponse.json({ error: "User image not found" }, { status: 400 });
    }

    const { item_id } = await req.json();
    if (!item_id) {
      return NextResponse.json({ error: "Missing item_id in request" }, { status: 400 });
    }

    const product = await prisma.product_data.findUnique({
      where: { item_id },
      select: { product_image_url: true },
    });

    if (!product?.product_image_url) {
      return NextResponse.json({ error: "Cloth image not found" }, { status: 404 });
    }

    const payload = {
      model_name: MODEL_NAME,
      human_image: profile.user_image_url,
      cloth_image: product.product_image_url,
      callback_url: TESTING_CALLBACK_URL,
    };

    const kolorsToken = generateKolorsToken();
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
      console.error("❌ Kling API error:", tryonData.message);
      return NextResponse.json(
        { error: `Kling API error: ${tryonData.message}` },
        { status: 500 }
      );
    }

    const taskId = tryonData?.data?.task_id;
    if (!taskId) {
      console.error("❌ task_id missing in Kling response");
      return NextResponse.json({ error: "Missing task_id in Kling response" }, { status: 500 });
    }

  const createdLog = await prisma.styling_log.create({
    data: {
      user_id,
      item_id,
      kling_task_id: taskId,
      user_image_url: profile.user_image_url,
      status: "processing",
    },
  });

  return NextResponse.json({
    message: "Try-on task submitted",
    log_id: createdLog.id, // ✅ Return internal UUID instead of Kling ID
  });

  } catch (err) {
    console.error("❌ Unhandled error in try-on flow:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
