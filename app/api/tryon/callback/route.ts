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

    const taskId = body?.task_id;
    const taskStatus = body?.task_status;
    const imageUrl = body?.task_result?.images?.[0]?.url;

    if (!taskId || !taskStatus) {
      console.error("❌ Missing task_id or task_status");
      return NextResponse.json({ error: "Missing task_id or task_status" }, { status: 400 });
    }

    // Handle failed status
    if (taskStatus === "failed") {
      await prisma.styling_log.updateMany({
        where: { kling_task_id: taskId },
        data: {
          status: "failed",
          updated_at: new Date(),
        },
      });

      console.warn(`❌ Task ${taskId} failed`);
      return NextResponse.json({ message: `Task ${taskId} marked as failed.` });
    }

    // Handle succeed status
    if (taskStatus === "succeed") {
      if (!imageUrl) {
        console.error("❌ No image URL found in callback data");
        return NextResponse.json({ error: "No image URL found in callback" }, { status: 400 });
      }

      console.log(`🖼️ Image URL from Kling: ${imageUrl}`);
      const s3Key = `tryon-image/${uuidv4()}.jpg`;

      // Concurrently fetch image and prepare upload buffer
      const [imageRes] = await Promise.all([
        fetch(imageUrl)
      ]);

      if (!imageRes.ok) {
        throw new Error("❌ Failed to download image from Kling");
      }

      const buffer = await imageRes.arrayBuffer();

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

      // Increment user's survey_prompt_stage
      try {
        const stylingEntry = await prisma.styling_log.findFirst({
          where: { kling_task_id: taskId },
          select: { user_id: true },
        });

        if (stylingEntry?.user_id) {
          await prisma.profile.update({
            where: { user_id: stylingEntry.user_id },
            data: {
              survey_prompt_stage: {
                increment: 1,
              },
            },
          });
          console.log(`📈 Incremented survey_prompt_stage for user: ${stylingEntry.user_id}`);
        } else {
          console.warn("⚠️ No user found for this styling_log. Skipped survey_prompt_stage increment.");
        }
      } catch (error) {
        console.error("❌ Error incrementing survey_prompt_stage:", error);
        return NextResponse.json({ error: "Failed to update survey prompt stage" }, { status: 500 });
      }

      return NextResponse.json({ message: "Try-on result processed successfully" });
    }

    // If task status is not 'succeed' or 'failed', return 202
    console.warn(`⚠️ Task ${taskId} is in status: ${taskStatus}`);
    return NextResponse.json({ message: `Task ${taskId} is in progress or unrecognized.` }, { status: 202 });
  } catch (err) {
    console.error("❌ Error in tryon callback handler:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
