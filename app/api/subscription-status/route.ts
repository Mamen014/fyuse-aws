// app/api/subscription-status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/get_user_id";

// Get the first day of the current month
function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Get number of days between two dates
function getDateDifferenceInDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = a.getTime() - b.getTime();
  return Math.floor(diffMs / msPerDay);
}

export async function GET(req: NextRequest) {
  try {
    const user_id = getUserIdFromRequest(req);
    if (!user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subs_plan.findUnique({
      where: { user_id },
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
      subs_date = getFirstDayOfMonth();
      plan = "basic";
      status = "active";
    } else {
      const now = new Date();
      const rawDate = subscription.subs_date ?? getFirstDayOfMonth();
      const rawPlan = subscription.plan ?? "basic";
      const rawStatus = subscription.status ?? "active";

      const ageInDays = getDateDifferenceInDays(now, rawDate);

      if (rawPlan !== "basic" && ageInDays <= 30) {
        subs_date = rawDate;
        plan = rawPlan;
        status = rawStatus;
      } else {
        subs_date = getFirstDayOfMonth();
        plan = "basic";
        status = "active";
      }
    }

    const successfulTasks = await prisma.styling_log.findMany({
      where: {
        user_id,
        status: "succeed",
        created_at: {
          gte: subs_date,
        },
      },
      distinct: ["id"], // ✅ use internal ID
      select: {
        id: true, // ✅ log ID
      },
    });

    return NextResponse.json({
      subs_date: subs_date.toISOString(),
      plan,
      status,
      successful_stylings: successfulTasks.length,
    });

  } catch (err) {
    console.error("Error retrieving subscription:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
