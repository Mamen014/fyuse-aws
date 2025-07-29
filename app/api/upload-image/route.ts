// app/api/upload-image/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

const s3 = new S3Client({ region: "ap-southeast-2" });
const BUCKET_NAME = "fyuse-images";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";

  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "upload-image",
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
    const { fileName, fileDataBase64, contentType } = body;

    if (!fileName || !fileDataBase64 || !contentType) {
      log.warn("Missing one or more required fields: fileName, fileDataBase64, contentType");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(fileDataBase64, "base64");
    const rawKey = `uploaded-image/user-image/${userId}-${fileName}`;
    const encodedKey = encodeURIComponent(rawKey);

    // Upload image to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: rawKey,
        Body: buffer,
        ContentType: contentType || "image/jpeg",
        ACL: "public-read",
      })
    );
    const s3Url = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${encodedKey}`;
    log.info("Image uploaded to S3");

    // Update or create profile
    await prisma.profile.upsert({
      where: { user_id: userId },
      update: { user_image_url: s3Url },
      create: { user_id: userId, user_image_url: s3Url },
    });
    log.info("User profile image updated");

    return NextResponse.json({
      message: "Upload image updated successfully",
      user_image_url: s3Url,
    });
  } catch (err) {
    log.error(`Failed to upload image or update profile: ${(err as Error).message}`);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
