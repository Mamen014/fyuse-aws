// app/api/upload-image/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { jwtDecode } from "jwt-decode";

const s3 = new S3Client({ region: "ap-southeast-2" });
const BUCKET_NAME = "fyuse-images";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let user_id: string;

  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    user_id = decoded.sub;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fileName, fileDataBase64, contentType } = body;

    if (!fileName || !fileDataBase64 || !contentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(fileDataBase64, "base64");
    const rawKey = `uploaded-image/user-image/${user_id}-${fileName}`;
    const encodedKey = encodeURIComponent(rawKey);

    // Upload image to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: rawKey,
        Body: buffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      })
    );

    const s3Url = `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${encodedKey}`;

    // Update profile
    await prisma.profile.upsert({
      where: { user_id },
      update: {
        user_image_url: s3Url,
      },
      create: {
        user_id,
        user_image_url: s3Url,
      }
    });

    return NextResponse.json({ 
        message: "upload image updated sucessfully",
        user_image_url: s3Url,
    });
  } catch (err) {
    console.error("❌ Error in uploading user photo:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
