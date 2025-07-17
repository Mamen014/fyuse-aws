// app/api/test/tryon/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { prisma } from "@/lib/prisma";
import { getSecrets } from "@/lib/secrets";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  let user_id: string;
  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    user_id = decoded.sub;
  } catch (err) {
    console.error("⚠️ Failed to decode JWT token:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

    return NextResponse.json({
    message: "Try-on task submitted",
    task_id: "774499455235129368",
    });
}
