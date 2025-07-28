// app/api/submit-survey/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtDecode } from "jwt-decode";

export async function POST(req: Request) {
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

    await prisma.survey_response.create({
      data: {
        user_id,
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

    await prisma.profile.update({
      where: { user_id },
      data: { survey_prompt_dismissed: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SubmitSurvey]', err);
    return NextResponse.json({ error: 'Failed to submit survey' }, { status: 500 });
  }
}
