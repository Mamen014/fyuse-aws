// api/save-style-preference/route.ts

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
    const { clothing_category, fashion_type } = body;

    if (!clothing_category || !fashion_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create style preference
    const stylePreference = await prisma.style_preference.create({
      data: {
        user_id,
        clothing_category: clothing_category.toLowerCase(),
        fashion_type: fashion_type.toLowerCase(),
        timestamp: new Date(),
      },
    });

    return NextResponse.json(stylePreference, { status: 201 });
  } catch (err) {
    console.error("Error saving style preference:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
