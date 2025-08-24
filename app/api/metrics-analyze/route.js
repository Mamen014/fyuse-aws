// app/api/metrics-analyze/route.js

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  subDays,
  subWeeks,
  format,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "4-weeks";

    const today = new Date();

    let startDate;
    if (timeframe === "7-days") {
      startDate = subDays(today, 6);
    } else if (timeframe === "4-weeks") {
      startDate = subWeeks(today, 4);
    } else if (timeframe === "all-time") {
      const earliestAttempt = await prisma.styling_log.findFirst({
        orderBy: { created_at: "asc" },
        select: { created_at: true },
      });

      startDate = earliestAttempt?.created_at ?? today;    
    } else {
      return NextResponse.json(
        { error: "Invalid timeframe. Use 7-days, 4-weeks, or all-time." },
        { status: 400 }
      );
    }

    // === 1. Raw grouped attempt counts ===
    const rawAttempts = await prisma.styling_log.groupBy({
      by: ["created_at"],
      _count: true,
      where: {
        created_at: {
          gte: startDate,
          lte: today,
        },
      },
    });

    // === 2. Normalize by day (YYYY-MM-DD) and aggregate ===
    const groupedByDate = {};
    rawAttempts.forEach((entry) => {
      const date = format(new Date(entry.created_at), "yyyy-MM-dd");
      groupedByDate[date] = (groupedByDate[date] || 0) + entry._count;
    });

    // === 3. Generate full date range and merge ===
    const allDates = eachDayOfInterval({ start: startDate, end: today }).map(
      (d) => format(d, "yyyy-MM-dd")
    );

    const dailyAttempts = allDates.map((date) => ({
      date,
      count: groupedByDate[date] || 0,
    }));

    // === 4. Compute unique users who made attempts ===
    const uniqueUsers = await prisma.styling_log.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: today,
        },
      },
      distinct: ["user_id"],
      select: { user_id: true },
    });

    // === 5. Total styling attempts ===
    const totalAttempts = await prisma.styling_log.count({
      where: {
        created_at: {
          gte: startDate,
          lte: today,
        },
      },
    });

    // === 6. Successful styling attempts ===
    const successfulAttempts = await prisma.styling_log.count({
      where: {
        created_at: {
          gte: startDate,
          lte: today,
        },
        styling_image_url: {
          not: null,
        },
      },
    });

    const attemptsPerUser =
      uniqueUsers.length > 0
        ? parseFloat((totalAttempts / uniqueUsers.length).toFixed(2))
        : 0;

    const successRate =
      totalAttempts > 0
        ? parseFloat((successfulAttempts / totalAttempts).toFixed(2))
        : 0;

    // === Physical Attribute Distribution ===
    const [bodyShapes, skinTones] = await Promise.all([
      prisma.profile.groupBy({
        by: ["body_shape"],
        where: {
          body_shape: { not: null },
          styling_logs: { some: { created_at: { gte: startDate } } },
        },
        _count: true,
      }),
      prisma.profile.groupBy({
        by: ["skin_tone"],
        where: {
          skin_tone: { not: null },
          styling_logs: { some: { created_at: { gte: startDate } } },
        },
        _count: true,
      }),
    ]);

    const clothingCategoryCount = await prisma.style_preference.groupBy({
      by: ['clothing_category'],
      _count: true,
    });

    const fashionTypeCount = await prisma.style_preference.groupBy({
      by: ['fashion_type'],
      _count: true,
    });

    const shapeCountMapped = {};
    bodyShapes.forEach((item) => {
      shapeCountMapped[item.body_shape] = item._count;
    });

    const skinToneCountMapped = {};
    skinTones.forEach((item) => {
      skinToneCountMapped[item.skin_tone] = item._count;
    });

    const clothingCategoryCountMapped = {};
    clothingCategoryCount.forEach((item) => {
      clothingCategoryCountMapped[item.clothing_category] = item._count;
    });

    const fashionTypeCountMapped = {};
    fashionTypeCount.forEach((item) => {
      fashionTypeCountMapped[item.fashion_type] = item._count;
    });


    return NextResponse.json({
      timeframe,
      dailyAttempts,
      users: uniqueUsers.length,
      totalAttempts,
      attemptsPerUser,
      successRate,
      bodyShapes: shapeCountMapped,
      skinTones: skinToneCountMapped,
      clothingCategories: clothingCategoryCountMapped,
      fashionTypes: fashionTypeCountMapped,      
    });
  } catch (err) {
    console.error("Failed to fetch metrics:", err);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
