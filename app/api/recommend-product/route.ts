// app/api/recommend-product/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { prisma } from "@/lib/prisma";
import {
  PersonalizeRuntimeClient,
  GetRecommendationsCommand,
} from "@aws-sdk/client-personalize-runtime";

const personalizeClient = new PersonalizeRuntimeClient({ region: "ap-southeast-2" });
const CAMPAIGN_ARN = "arn:aws:personalize:ap-southeast-2:586794474562:campaign/StyleRec";
const FILTER_ARN = "arn:aws:personalize:ap-southeast-2:586794474562:filter/3init";

function normalizeGender(input: string | null) {
  if (!input) return null;
  const val = input.toLowerCase();
  if (val === "male") return "man";
  if (val === "female") return "woman";
  return null;
}

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
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    // 1. Fetch gender from profile
    const profile = await prisma.profile.findUnique({
      where: { user_id },
      select: { gender: true },
    });

    if (!profile?.gender) {
      return NextResponse.json({ error: "Missing gender in profile" }, { status: 400 });
    }

    const gender = normalizeGender(profile.gender);

    // 2. Fetch latest style preference
    const latestPreference = await prisma.style_preference.findFirst({
      where: { user_id },
      orderBy: { timestamp: "desc" },
      select: {
        clothing_category: true,
        fashion_type: true,
      },
    });

    if (!latestPreference?.clothing_category || !latestPreference?.fashion_type) {
      return NextResponse.json({ error: "Style preference not found" }, { status: 400 });
    }

    const clothingCategory = latestPreference.clothing_category.toLowerCase();
    const fashionType = latestPreference.fashion_type.toLowerCase();

    // 3. Call AWS Personalize
    const personalizeResponse = await personalizeClient.send(
      new GetRecommendationsCommand({
        campaignArn: CAMPAIGN_ARN,
        userId: user_id,
        filterArn: FILTER_ARN,
        filterValues: {
          gender: `"${gender}"`,
          clothingCategory: `"${clothingCategory}"`,
          fashionType: `"${fashionType}"`,
        },
        numResults: 10,
      })
    );

    const recommendedIds = (personalizeResponse.itemList ?? [])
      .map(item => item.itemId)
      .filter((id): id is string => typeof id === "string");

    if (recommendedIds.length === 0) {
      return NextResponse.json({ message: "No recommendations found" }, { status: 200 });
    }

    // 4. Filter out items in styling_log within 30 days and wardrobe=true
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const previousLogs = await prisma.styling_log.findMany({
      where: {
        user_id,
      },
      select: { 
        item_id: true,
        updated_at: true,
        wardrobe: true,
     },
    });
    const excludedIds = new Set(
      previousLogs
        .filter((log: { updated_at: Date | null; wardrobe: boolean | null; item_id: string }) => {
        const isRecent = log.updated_at && log.updated_at > thirtyDaysAgo;
        const isStillInWardrobe = log.wardrobe === true;
        return isRecent || isStillInWardrobe;
        })
        .map((log: { item_id: string }) => log.item_id)
      );

    const validRecommendations = recommendedIds.filter((id) => !excludedIds.has(id));

    if (validRecommendations.length === 0) {
      return NextResponse.json({ message: "No new recommendations available" }, { status: 200 });
    }

    const topRecommendedId = validRecommendations[0];

    if (!topRecommendedId) {
      return NextResponse.json({ error: "Recommended item ID missing" }, { status: 400 });
    }

    // ✅ Check for duplicate recommendation in the past 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const alreadyExists = await prisma.styling_log.findFirst({
      where: {
        user_id,
        item_id: topRecommendedId,
        created_at: { gte: fiveSecondsAgo },
      },
      orderBy: { created_at: 'desc' },
    });

    if (alreadyExists) {
      return NextResponse.json({ message: "Already recommended recently" }, { status: 200 });
    }

    // 5. Fetch product detail
    const product = await prisma.product_data.findUnique({
      where: { item_id: topRecommendedId },
    });

    if (!product) {
      return NextResponse.json({ error: "Recommended product not found" }, { status: 404 });
    }

    // 6. Return product
    return NextResponse.json({
      productId: product.item_id,
      productName: product.product_name,
      brand: product.brand,
      imageS3Url: product.product_image_url,
      productLink: product.product_link,
    });
  } catch (err) {
    console.error("Failed to retrieve recommendation item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
