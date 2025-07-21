// app/api/styling-history/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtDecode } from "jwt-decode";

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

export async function GET(req: NextRequest) {
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
    const logs = await prisma.styling_log.findMany({
      where: {
        user_id,
        status: "succeed",
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

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching styling history:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
