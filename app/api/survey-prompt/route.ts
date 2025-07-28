// app/api/survey-prompt/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtDecode } from "jwt-decode";

function getUserIdFromAuthHeader(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwtDecode<{ sub: string }>(token);
    return decoded.sub;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const user_id = getUserIdFromAuthHeader(req);
  if (!user_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id },
      select: {
        survey_prompt_dismissed: true,
        survey_prompt_stage: true,
      },
    });

    return NextResponse.json({
      dismissed: profile?.survey_prompt_dismissed || false,
      stage: profile?.survey_prompt_stage || 0,
    });
  } catch (err) {
    console.error('[survey-prompt/GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user_id = getUserIdFromAuthHeader(req);
  if (!user_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { dismiss, stage } = body;

    if (typeof stage !== "number") {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    await prisma.profile.update({
      where: { user_id },
      data: {
        survey_prompt_stage: stage,
        ...(dismiss ? { survey_prompt_dismissed: true } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[survey-prompt/POST]', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
