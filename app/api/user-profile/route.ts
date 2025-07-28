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
    // 🔍 Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    // ✨ If not, create a blank profile
    if (!profile) {
      profile = await prisma.profile.create({
        data: { user_id: userId },
      });
    }

    // 🔁 Return profile (select only needed fields)
    return NextResponse.json({
      gender: profile?.gender,
      skin_tone: profile?.skin_tone,
      body_shape: profile?.body_shape,
      occupation: profile?.occupation,
      city: profile?.city,
      nickname: profile?.nickname,
      user_image_url: profile?.user_image_url,
    });
  } catch (err) {
    console.error("Error fetching or creating profile:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
