import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

export async function GET(req: NextRequest) {
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
<<<<<<< Updated upstream
    const latestPreference = await prisma.style_preference.findFirst({
      where: { user_id },
      orderBy: {
        timestamp: "desc",
      },
=======
    const latestPreference = await prisma.profile.findFirst({
      where: { user_id: userId }, 
>>>>>>> Stashed changes
      select: {
        clothing_category: true,
        fashion_type: true,
      },
    });

    if (!latestPreference) {
      return NextResponse.json({ message: "No preference found" }, { status: 404 });
    }

    return NextResponse.json(latestPreference);
  } catch (error) {
    console.error("Error retrieving style preference:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
