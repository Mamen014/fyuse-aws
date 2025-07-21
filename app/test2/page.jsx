// components/ui/ShareCanvas.jsx

import Image from "next/image";

export default function ShareCanvas() {
  return (
    <div id="share-canvas" className="relative w-[1080px] h-[1350px] bg-[#fafafa] overflow-hidden flex flex-col px-[64px] py-[48px]">
      
      {/* 🔷 Header */}
      <div>
        <div className="w-[192px] h-[80px] relative mb-[64px]">
          <Image
            src="/logo-tb.png"
            alt="FYUSE Logo"
            fill
            className="object-cover"
          />
        </div>
        <h1 className="text-[54px] text-primary font-bold leading-tight mb-2">
          Ryan's Perfect Look
        </h1>
      </div>

      {/* 🔷 Content Row */}
      <div className="flex flex-row justify-between mt-[32px] h-[800px]">
        {/* 👕 Left: Try-On Image */}
        <div className="w-1/2 justify-center">
          <img
            src="https://fyuse-images.s3.ap-southeast-2.amazonaws.com/tryon-image/584548f5-401d-45ec-a5ca-0bf0a2db2ca1.jpg"
            alt="Try-On"
            crossOrigin="anonymous"
            className="w-full h-full object-cover shadow-2xl rounded-2xl"
          />
        </div>

        {/* 📦 Right: Info Card */}
        <div className="w-[440px] bg-white border border-primary/40 rounded-2xl p-[24px] shadow-xl flex flex-col">
          {/* 👤 Skin Tone & Body Shape */}
          <div className="flex justify-between border border-primary-light rounded-xl px-[16px] py-8 mb-8">
            <div className="text-center flex-1">
              <p className="text-primary font-medium text-[24px] mb-2">Skin Tone</p>
              <div className="aspect-square w-[96px] relative mx-auto mb-4 mt-4">
                <Image
                  src="/images/skin-tone/medium.png"
                  alt="medium"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-primary font-semibold text-[24px] capitalize">Medium</p>
            </div>

            <div className="text-center flex-1">
              <p className="text-primary font-medium text-[24px] mb-2">Body Shape</p>
              <div className="aspect-square w-[96px] relative mx-auto mb-4 mt-4">
                <Image
                  src="/images/body-shape/male/trapezoid.png"
                  alt="trapezoid"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-primary font-semibold text-[24px] capitalize">trapezoid</p>
            </div>
          </div>

          {/* 👗 Product Details */}
          <div className="rounded-xl border border-primary-light">
            {/* 🖼️ Product Image */}
            <div className="rounded-xl p-[24px] mb-2 flex items-center justify-center">
              <img
                src="https://fyuse-images.s3.ap-southeast-2.amazonaws.com/productData/Adidas/iy1592_2_apparel_photography_front20center20view_grey.jpg"
                alt="Product"
                crossOrigin="anonymous"
                className="w-80 h-80 object-cover rounded-xl"
              />
            </div>

            {/* 📝 Product Info */}
            <div className="text-left px-[24px] flex flex-row items-center justify-between">
            <div>
              <h2 className="text-[20px] font-extrabold text-[#1e293b] uppercase mb-[4px] leading-tight">
                Long Sleeve
              </h2>
              <p className="text-[#475569] text-[14px] font-medium uppercase">
                Style: Sporty
              </p>
            </div>

            <div className="px-2 mb-3">
                <img
                  src="/images/brand-logo/8.png"
                  alt="Adidas"
                  crossOrigin="anonymous"
                  className="w-[64px] h-[64px] object-contain"
                />
            </div>

            </div>          
          </div>

        </div>
      </div>

      {/* 🔷 Footer */}
      <div className="mt-[64px]">
        <p className="text-[32px] text-[#1e293b] font-medium">
          Ready to Discover Your own{" "}
          <span className="font-bold text-[32px] text-primary">Personalized Style?</span>
        </p>
        <p className="text-[18px] text-primary mt-[8px]">
          Visit: <span className="font-bold">fyuse.org</span>
        </p>
      </div>
    </div>
  );
}
