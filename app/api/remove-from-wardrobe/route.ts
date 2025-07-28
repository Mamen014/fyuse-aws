// app/api/remove-from-wardrobe/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

export async function PATCH(req: NextRequest) {
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
    const { log_id } = await req.json();

    if (!log_id) {
      return NextResponse.json({ error: "log_id is required" }, { status: 400 });
    }

    const updatedLog = await prisma.styling_log.updateMany({
      where: {
        id: log_id,
        user_id,
        wardrobe: true,
      },
      data: {
        wardrobe: false,
      },
    });

    if (updatedLog.count === 0) {
      return NextResponse.json({ error: "No matching wardrobe item found or already removed." }, { status: 404 });
    }

    return NextResponse.json({ message: "Item removed from wardrobe." });
  } catch (err) {
    console.error("Failed to remove item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
