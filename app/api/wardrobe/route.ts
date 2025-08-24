// app/api/styling-history/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getUserIdFromAuth } from "@/lib/session";

type ProductMeta = {
  image: string;
  color: string;
  link: string;
  fashType: string;
  name: string;
  brand: string;
  category: string;
  clothType: string;
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const sessionId = request.headers.get("x-session-id") || "unknown";

  const userId = getUserIdFromAuth(authHeader);
  const log = logger.withContext({
    sessionId,
    userId,
    routeName: "styling-history",
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
    const logs = await prisma.styling_log.findMany({
      where: {
        user_id: userId,
        status: {
          in: ["succeed", "recommend"],
        },
        wardrobe: true,
      },
      orderBy: { updated_at: "desc" },
      select: {
        id: true,
        item_id: true,
        styling_image_url: true,
        user_image_url: true,
        updated_at: true,
        status: true,
      },
    });

    log.info(`Fetched ${logs.length} styling logs`);

    const itemIds = logs.map(log => log.item_id);

    const products = await prisma.product_data.findMany({
      where: { item_id: { in: itemIds } },
      select: {
        item_id: true,
        product_image_url: true,
        clothing_type: true,
        fashion_type: true,
        clothing_category: true,
        product_link: true,
        product_name: true,
        brand: true,
        color: true,
      },
    });

    log.info(`Fetched ${products.length} associated products`);

    const productMap: Record<string, ProductMeta> = Object.fromEntries(
      products.map(p => [
        p.item_id,
        {
          image: p.product_image_url,
          color: p.color,
          link: p.product_link,
          fashType: p.fashion_type,
          name: p.product_name,
          brand: p.brand,
          category: p.clothing_category,
          clothType: p.clothing_type,
        },
      ])
    );

    const result = logs.map(log => {
      const product = productMap[log.item_id];
      return {
        log_id: log.id,
        item_id: log.item_id,
        styling_image_url: log.styling_image_url ?? null,
        user_image_url: log.user_image_url ?? null,
        product_image_url: product?.image ?? null,
        category: product?.category ?? null,
        fashType: product?.fashType ?? null,
        link: product?.link ?? null,
        brand: product?.brand ?? null,
        name: product?.name ?? null,
        color: product?.color ?? null,
        cloth_type: product?.clothType ?? null,
        status: log.status ?? null,
        updated_at: log.updated_at ?? null,
      };
    });

    log.info("Responded with styling history data");

    return NextResponse.json(result);
  } catch (err) {
    log.error("Failed to fetch styling history");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
