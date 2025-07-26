import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    await prisma.profile.update({
      where: { user_id: user_id },
      data: {
        survey_prompt_stage: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Survey stage incremented' });
  } catch (err) {
    console.error('❌ Failed to increment survey stage:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
