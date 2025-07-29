import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";

  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "survey-prompt/increment-stage",
  });

  if (!authHeader.startsWith("Bearer ")) {
    log.error("Authorization header missing or malformed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userId) {
    log.error("Failed to extract user ID from token");
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    await prisma.profile.update({
      where: { user_id: userId },
      data: {
        survey_prompt_stage: {
          increment: 1,
        },
      },
    });

    log.info("Survey prompt stage incremented");
    return NextResponse.json({ message: "Survey stage incremented" });
  } catch (err) {
    log.error("Failed to increment survey stage", { error: (err as Error).message });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
