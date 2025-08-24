// app/api/survey-prompt/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const sessionId = request.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader);

  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "survey-prompt",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.error("Authorization header missing or malformed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    log.error("Failed to decode user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      select: {
        survey_prompt_dismissed: true,
        survey_prompt_stage: true,
      },
    });

    const dismissed = profile?.survey_prompt_dismissed || false;
    const stage = profile?.survey_prompt_stage || 0;

    log.info("Fetched survey prompt status", { dismissed, stage });

    return NextResponse.json({ dismissed, stage });
  } catch (err) {
    log.error("Failed to fetch survey prompt status", { error: err });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const sessionId = request.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader);

  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "survey-prompt",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.error("Authorization header missing or malformed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    log.error("Failed to decode user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dismiss, stage } = body;

    log.info("Received POST data", { dismiss, stage });

    if (typeof stage !== "number") {
      log.error("Invalid input: stage must be a number");
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    await prisma.profile.update({
      where: { user_id: userId },
      data: {
        survey_prompt_stage: stage,
        ...(dismiss ? { survey_prompt_dismissed: true } : {}),
      },
    });

    log.info("Successfully updated survey prompt", { dismiss, stage });

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Failed to update survey prompt", { error: err });
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
