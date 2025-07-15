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
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { task_id } = await req.json();

    if (!task_id) {
      return NextResponse.json({ error: "task_id is required" }, { status: 400 });
    }

    // Update wardrobe to false
    const updatedLog = await prisma.styling_log.updateMany({
      where: {
        user_id,
        task_id,
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
  } catch (error) {
    console.error("Error removing wardrobe item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
