// app/api/tryon/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: "ap-southeast-2" });
const BUCKET_NAME = "fyuse-images";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Kling callback received:", JSON.stringify(body));

    const taskId = body?.task_id;
    const taskStatus = body?.task_status;
    const imageUrl = body?.task_result?.images?.[0]?.url;

    if (!taskId || !taskStatus) {
      console.error("❌ Missing task_id or task_status");
      return NextResponse.json({ error: "Missing task_id or task_status" }, { status: 400 });
    }

    if (taskStatus !== "succeed") {
      console.warn(`⚠️ Task ${taskId} is not successful yet: ${taskStatus}`);
      return NextResponse.json({ message: `Task ${taskId} is not ready yet.` }, { status: 202 });
    }

    if (!imageUrl) {
      console.error("❌ No image URL found in callback data");
      return NextResponse.json({ error: "No image URL found in callback" }, { status: 400 });
    }

    console.log(`🖼️ Image URL from Kling: ${imageUrl}`);

    // Download image from Kling
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      throw new Error("Failed to download image from Kling");
    }

    const buffer = await imageRes.arrayBuffer();
    const s3Key = `tryon-image/${uuidv4()}.jpg`;

    // Upload image to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: Buffer.from(buffer),
        ContentType: "image/jpeg",
        ACL: "public-read",
      })
    );

    const s3Url = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${s3Key}`;
    console.log("✅ Uploaded image to S3:", s3Url);

    // Update styling_log
    await prisma.styling_log.updateMany({
      where: { kling_task_id: taskId },
      data: {
        styling_image_url: s3Url,
        status: "succeed",
        wardrobe: true,
        updated_at: new Date(),
      },
    });

    console.log("✅ styling_log updated for task:", taskId);
    return NextResponse.json({ message: "Try-on result processed successfully" });
  } catch (err) {
    console.error("❌ Error in tryon callback handler:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
