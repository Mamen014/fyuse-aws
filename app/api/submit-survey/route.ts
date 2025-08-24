import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader);

  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "submit-survey",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.warn("Authorization header missing or malformed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    log.error("Failed to decode user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      stylingSatisfaction,
      styleMatch,
      bodyShape,
      skinTone,
      tryonRealism,
      tryonEase,
      appExperience,
      device,
      issues,
      shareIntent,
      purchaseIntent,
      likeMost,
      improveSuggestions,
      email,
    } = body;

    log.info("Creating new survey response");

    await prisma.survey_response.create({
      data: {
        user_id: userId,
        stylingSatisfaction,
        styleMatch,
        bodyShape,
        skinTone,
        tryonRealism,
        tryonEase,
        appExperience,
        device,
        issues: issues?.join(', '),
        shareIntent,
        purchaseIntent,
        likeMost,
        improveSuggestions,
        email,
      },
    });

    log.info("Updating profile to dismiss survey prompt");

    await prisma.profile.update({
      where: { user_id: userId },
      data: { survey_prompt_dismissed: true },
    });

    log.info("Survey submitted successfully");
    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Failed to submit survey", err);
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 });
  }
}
