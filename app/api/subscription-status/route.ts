// app/api/subscription-status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getDateDifferenceInDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = a.getTime() - b.getTime();
  return Math.floor(diffMs / msPerDay);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const sessionId = request.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader);

  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "subscription-status",
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
    log.info("Fetching subscription record");

    const subscription = await prisma.subs_plan.findUnique({
      where: { user_id: userId },
      select: {
        subs_date: true,
        plan: true,
        status: true,
      },
    });

    let subs_date: Date;
    let plan: string;
    let status: string;

    if (!subscription) {
      log.info("No subscription found — creating default basic plan");

      subs_date = getFirstDayOfMonth();
      plan = "basic";
      status = "active";

      await prisma.subs_plan.create({
        data: {
          user_id: userId,
          subs_date,
          plan,
          status,
        },
      });
    } else {
      log.info("Existing subscription found");

      const now = new Date();
      const rawDate = subscription.subs_date ?? getFirstDayOfMonth();
      const rawPlan = subscription.plan ?? "basic";
      const rawStatus = subscription.status ?? "active";

      const ageInDays = getDateDifferenceInDays(now, rawDate);

      if (rawPlan !== "basic" && ageInDays <= 30) {
        log.info(`Preserving premium plan: ${rawPlan}`);
        subs_date = rawDate;
        plan = rawPlan;
        status = rawStatus;
      } else {
        log.info("Resetting to basic plan due to expiration");
        subs_date = getFirstDayOfMonth();
        plan = "basic";
        status = "active";
      }
    }

    const successfulTasks = await prisma.styling_log.findMany({
      where: {
        user_id: userId,
        status: "succeed",
        created_at: {
          gte: subs_date,
        },
      },
      distinct: ["id"],
      select: {
        id: true,
      },
    });

    log.info("Returning subscription status response");

    return NextResponse.json({
      subs_date: subs_date.toISOString(),
      plan,
      status,
      successful_stylings: successfulTasks.length,
    });

  } catch (err) {
    log.error("Unexpected error retrieving subscription status");
    console.error("Subscription route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
