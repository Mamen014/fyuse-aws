// app/api/test/tryon/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";


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
    log_id: "6734f5da-93d7-4ff0-81b3-99b16816992f",
    });
}
