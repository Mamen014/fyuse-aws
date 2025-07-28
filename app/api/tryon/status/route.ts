// app/api/tryon/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const logId = searchParams.get("log_id");
  if (!logId) {
    return NextResponse.json({ error: "Missing log_id" }, { status: 400 });
  }

  const log = await prisma.styling_log.findUnique({
    where: {
      id: logId,
    },
  });

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
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
    const log = await prisma.styling_log.findFirst({
      where: {
        id: logId,
        user_id,
      },
      select: {
        status: true,
        styling_image_url: true,
        updated_at: true,
      },
    });

    if (!log) {
      return NextResponse.json({ error: "Task not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({
      status: log.status,
      styling_image_url: log.styling_image_url,
      updated_at: log.updated_at,
    });
  } catch (err) {
    console.error("❌ Error fetching status:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
