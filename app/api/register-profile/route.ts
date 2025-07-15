import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

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

    const {
      gender,
      body_shape,
      skin_tone,
      user_image_url,
      nickname,
      birthdate,
      country,
      city,
      phone_number,
      occupation,
    } = body;

    // Upsert logic (insert if new, or update if already exists)
    const profile = await prisma.profile.upsert({
      where: { user_id },
      update: {
        gender,
        body_shape,
        skin_tone,
        user_image_url,
        nickname,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        country,
        city,
        phone_number,
        occupation,
      },
      create: {
        user_id,
        gender,
        body_shape,
        skin_tone,
        user_image_url,
        nickname,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        country,
        city,
        phone_number,
        occupation,
      },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
