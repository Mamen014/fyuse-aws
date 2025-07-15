import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  let userId: string;
  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    userId = decoded.sub;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      select: {
        gender: true,
        skin_tone: true,
        body_shape: true,
        occupation: true,
        city: true,
        nickname: true,
        user_image_url: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
