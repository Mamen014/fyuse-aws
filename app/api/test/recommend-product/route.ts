// app/api/test/recommend-product/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

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

    return NextResponse.json({
      productId: "product.item_id",
      productName: "ADIDAS BY STELLA MCCARTNEY TRUECASUALS CROPPED SWEATSHIRT",
      brand: "H&M",
      imageS3Url: "https://fyuse-images.s3.ap-southeast-2.amazonaws.com/productData/Adidas/jy2218_1_apparel_photography_front_center_view_grey.jpg",
      productLink: "https://www.adidas.co.id/en/train-essentials-boxy-workout-t-shirt-1032798.html",
    });
}
