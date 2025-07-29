// app/api/tryon/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";

const s3 = new S3Client({ region: "ap-southeast-2" });
const BUCKET_NAME = "fyuse-images";

const log = logger.withContext({ routeName: "tryon_callback" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const taskId = body?.task_id;
    const taskStatus = body?.task_status;
    const imageUrl = body?.task_result?.images?.[0]?.url;

    if (!taskId || !taskStatus) {
      log.error("Missing task_id or task_status");
      return NextResponse.json({ error: "Missing task_id or task_status" }, { status: 400 });
    }

    log.info(`Received callback for task ${taskId}`, { taskStatus });

    if (taskStatus === "failed") {
      await prisma.styling_log.updateMany({
        where: { kling_task_id: taskId },
        data: {
          status: "failed",
          updated_at: new Date(),
        },
      });

      log.warn(`Task ${taskId} marked as failed`);
      return NextResponse.json({ message: `Task ${taskId} marked as failed.` });
    }

    if (taskStatus === "succeed") {
      if (!imageUrl) {
        log.error("No image URL found in callback data", { taskId });
        return NextResponse.json({ error: "No image URL found in callback" }, { status: 400 });
      }

      log.info("Downloading image from Kling", { imageUrl });

      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) throw new Error("Failed to download image from Kling");

      const buffer = await imageRes.arrayBuffer();
      const s3Key = `tryon-image/${uuidv4()}.jpg`;

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
      log.info("Uploaded image to S3", { s3Url });

      await prisma.styling_log.updateMany({
        where: { kling_task_id: taskId },
        data: {
          styling_image_url: s3Url,
          status: "succeed",
          wardrobe: true,
          updated_at: new Date(),
        },
      });

      log.info("Updated styling_log entry", { taskId });

      try {
        const stylingEntry = await prisma.styling_log.findFirst({
          where: { kling_task_id: taskId },
          select: { user_id: true },
        });

        if (stylingEntry?.user_id) {
          await prisma.profile.update({
            where: { user_id: stylingEntry.user_id },
            data: {
              survey_prompt_stage: { increment: 1 },
            },
          });

          log.info("Incremented survey_prompt_stage", { userId: stylingEntry.user_id });
        } else {
          log.warn("No user found for this styling_log", { taskId });
        }
      } catch (error) {
        log.error("Error incrementing survey_prompt_stage", { taskId, error });
        return NextResponse.json({ error: "Failed to update survey prompt stage" }, { status: 500 });
      }

      return NextResponse.json({ message: "Try-on result processed successfully" });
    }

    log.warn(`Unhandled task status: ${taskStatus}`, { taskId });
    return NextResponse.json({ message: `Task ${taskId} is in progress or unrecognized.` }, { status: 202 });
  } catch (err) {
    log.error("Unhandled error in tryon callback", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
