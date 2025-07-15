// app/api/tryon/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { prisma } from "@/lib/prisma";
import { getSecrets } from "@/lib/secrets";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  console.log("📩 Received try-on POST request");

  let secrets;
  try {
    secrets = await getSecrets();
    console.log("✅ Secrets fetched:", secrets);
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
    const token = jwt.sign(
      { iss: KOLORS_ACCESS_KEY_ID, exp: now + 1800, nbf: now - 5 },
      KOLORS_ACCESS_KEY_SECRET
    );
    console.log("🔐 Generated Kolors token:", token.slice(0, 10) + "...");
    return token;
  }

  const authHeader = req.headers.get("authorization");
  console.log("🔍 Authorization header:", authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    console.warn("⚠️ Missing or invalid Authorization header");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let user_id: string;
  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    user_id = decoded.sub;
    console.log("👤 Decoded user_id:", user_id);
  } catch (err) {
    console.warn("⚠️ Failed to decode JWT token:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    console.log("📸 Fetching profile for user_id:", user_id);
    const profile = await prisma.profile.findUnique({
      where: { user_id },
      select: { user_image_url: true },
    });

    if (!profile?.user_image_url) {
      console.warn("⚠️ User image not found for user_id:", user_id);
      return NextResponse.json({ error: "User image not found" }, { status: 400 });
    }

    console.log("✅ Found user image URL:", profile.user_image_url);

    console.log("🕑 Fetching latest styling_log for user_id:", user_id);
    const latestLog = await prisma.styling_log.findFirst({
      where: { user_id },
      orderBy: { created_at: "desc" },
    });

    if (!latestLog || !latestLog.item_id) {
      console.warn("⚠️ No styling log found for user_id:", user_id);
      return NextResponse.json({ error: "No styling log found" }, { status: 404 });
    }

    console.log("✅ Found styling log:", latestLog);

    console.log("🛍️ Fetching product with item_id:", latestLog.item_id);
    const product = await prisma.product_data.findUnique({
      where: { item_id: latestLog.item_id },
      select: { product_image_url: true },
    });

    if (!product?.product_image_url) {
      console.warn("⚠️ Cloth image not found for item_id:", latestLog.item_id);
      return NextResponse.json({ error: "Cloth image not found" }, { status: 404 });
    }

    console.log("✅ Found product image URL:", product.product_image_url);

    const payload = {
      model_name: MODEL_NAME,
      human_image: decodeURIComponent(profile.user_image_url),
      cloth_image: product.product_image_url,
      callback_url: TESTING_CALLBACK_URL,
    };

    console.log("📦 Try-on request payload:", payload);

    const kolorsToken = generateKolorsToken();
    console.log("📤 Sending request to Kling:", KOLORS_API_URL);

    const tryonRes = await fetch(KOLORS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${kolorsToken}`,
      },
      body: JSON.stringify(payload),
    });

    const tryonData = await tryonRes.json();
    console.log("📥 Kling response:", tryonData);

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

    console.log(`📝 Updating styling_log: task_id = ${taskId}`);

    await prisma.styling_log.update({
      where: { task_id: latestLog.task_id },
      data: {
        kling_task_id: taskId,
        user_image_url: profile.user_image_url,
      },
    });

    console.log("✅ Styling log updated");

    return NextResponse.json({
      message: "Try-on task submitted",
      task_id: taskId,
    });
  } catch (err) {
    console.error("❌ Unhandled error in try-on flow:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
