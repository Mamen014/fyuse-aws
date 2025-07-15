// /app/api/mock-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { task_id } = await req.json();
  if (!task_id) return NextResponse.json({ error: "Missing task_id" }, { status: 400 });

  // Simulate Kling callback
  await prisma.styling_log.updateMany({
    where: { kling_task_id: task_id },
    data: {
      status: "succeed",
      wardrobe: true,
      styling_image_url: "https://fyuse-images.s3.ap-southeast-2.amazonaws.com/tryon-image/mock_result.jpg",
      updated_at: new Date(),
    },
  });

  return NextResponse.json({ message: "Simulated styling result saved." });
}
