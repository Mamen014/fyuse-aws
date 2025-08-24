import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";
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
  const authHeader = req.headers.get("authorization") || "";
  const sessionId = req.headers.get("x-session-id") || "unknown";
  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "recommend-product",
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
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      select: {
        gender: true,
        clothing_category: true,
        fashion_type: true,
      },
    });

    if (!profile) {
      log.warn("Profile not found for user");
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const gender = normalizeGender(profile.gender);
    const clothingCategory = profile.clothing_category?.toLowerCase() || null;
    const fashionType = profile.fashion_type?.toLowerCase() || null;

    if (!gender || !clothingCategory || !fashionType) {
      log.warn("❗ Incomplete profile data", { gender, clothingCategory, fashionType });
      return NextResponse.json({ error: "Incomplete profile data" }, { status: 400 });
    }

    const filterValues: Record<string, string> = {
      gender: `"${gender}"`,
      clothingCategory: `"${clothingCategory}"`,
      fashionType: `"${fashionType}"`,
    };

    // 🔹 Call Personalize with filters
    const personalizeResponse = await personalizeClient.send(
      new GetRecommendationsCommand({
        campaignArn: CAMPAIGN_ARN,
        userId,
        filterArn: FILTER_ARN,
        filterValues,
        numResults: 25,
      })
    );

    const recommendedIds = (personalizeResponse.itemList ?? [])
      .map(item => item.itemId)
      .filter((id): id is string => typeof id === "string");

    if (recommendedIds.length === 0) {
      log.info("No recommendations returned by Personalize");
      return NextResponse.json({ message: "No recommendations found" }, { status: 200 });
    }

    // 🔹 Exclude duplicates and wardrobe items
    const previousLogs = await prisma.styling_log.findMany({
      where: { user_id: userId },
      select: { item_id: true, created_at: true, wardrobe: true },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFiveSeconds = new Date(Date.now() - 5000);

    const excludedIds = new Set(
      previousLogs
        .filter(log =>
          (log.created_at && log.created_at > thirtyDaysAgo) ||
          (log.created_at && log.created_at > recentFiveSeconds) ||
          log.wardrobe === true
        )
        .map(log => log.item_id)
    );

    const validRecommendations = recommendedIds.filter(id => !excludedIds.has(id));

    if (validRecommendations.length === 0) {
      log.info("Filtered out all recommendations due to duplicates or wardrobe");
      return NextResponse.json({ message: "No new recommendations available" }, { status: 200 });
    }

    const topRecommendedId = validRecommendations[0];

    const product = await prisma.product_data.findUnique({
      where: { item_id: topRecommendedId },
    });

    if (!product) {
      log.error("Recommended product not found in DB", { itemId: topRecommendedId });
      return NextResponse.json({ error: "Recommended product not found" }, { status: 404 });
    }

    log.info("Product recommendation successful", {
      recommendedItemId: product.item_id,
      brand: product.brand,
    });

    return NextResponse.json({
      productId: product.item_id,
      productName: product.product_name,
      brand: product.brand,
      imageS3Url: product.product_image_url,
      productLink: product.product_link,
    });
  } catch (err) {
    log.error("Unexpected failure in recommendation logic", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
