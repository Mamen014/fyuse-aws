// components/ui/ShareCanvas.jsx

import Image from "next/image";

export default function ShareCanvas({
  resultImageUrl,
  productImageUrl,
  productName,
  brand,
  nickname,
  skinToneLabel,
  gender,
  bodyShape,
  fashionType,
}) {
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
          {nickname ? `${nickname}'s Perfect Look` : "Your Perfect Look"}
        </h1>
      </div>

      {/* 🔷 Content Row */}
      <div className="flex flex-row justify-between mt-[32px] h-[800px]">
        {/* 👕 Left: Try-On Image */}
        <div className="w-1/2 justify-center">
          <img
            src={`${resultImageUrl}?cb=${Date.now()}`}
            alt="Try-On"
            crossOrigin="anonymous"
            className="w-full h-full object-cover shadow-2xl rounded-2xl"
          />
        </div>

        {/* 📦 Right: Info Card */}
        <div className="w-[440px] bg-white border border-primary/40 rounded-2xl p-[24px] shadow-xl flex flex-col">
          {/* 👤 Skin Tone & Body Shape */}
          <div className="flex justify-between border border-primary-light rounded-xl px-[16px] py-8 mb-6">
            <div className="text-center flex-1">
              <p className="text-primary font-medium text-[24px] mb-2">Skin Tone</p>
              <div className="aspect-square w-[96px] items-center justify-center relative mx-auto mb-4 mt-4">
                <Image
                  src={`/images/skin-tone/${skinToneLabel}.png`}
                  alt={`${skinToneLabel}`}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-primary font-semibold text-[24px] capitalize">{skinToneLabel}</p>
            </div>

            <div className="text-center flex-1">
              <p className="text-primary font-medium text-[24px] mb-2">Body Shape</p>
              <div className="aspect-square w-[96px] items-center justify-center relative mx-auto mb-4 mt-4">
                <Image
                  src={`/images/body-shape/${gender}/${bodyShape}.png`}
                  alt={`${bodyShape}`}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-primary font-semibold text-[24px] capitalize">{bodyShape}</p>
            </div>
          </div>

          {/* 👗 Product Details */}
          <div className="rounded-xl border border-primary-light">
            {/* 🖼️ Product Image */}
            <div className="rounded-xl p-[24px] mb-2 flex items-center justify-center">
              <img
                src={`${productImageUrl}?cb=${Date.now()}`}
                alt="Product"
                crossOrigin="anonymous"
                className="w-80 h-80 object-cover rounded-xl"
              />
            </div>

            {/* 📝 Product Info */}
            <div className="text-left px-[24px] flex flex-row items-center justify-between">
              <div>
                <h2 className="text-[20px] font-extrabold text-[#1e293b] uppercase mb-[4px] leading-tight">
                  {productName}
                </h2>
                <p className="text-[#475569] text-[14px] font-medium mb-[12px] uppercase">
                  Style: {fashionType}
                </p>                
              </div>

              <div className="px-2 mb-3">
                  <img
                    src={`/images/brand-logo/${brand}.png`}
                    alt={brand}
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
          Ready to Discover Your Own{" "}
          <span className="font-bold text-[32px] text-primary">Personalized Style?</span>
        </p>
        <p className="text-[18px] text-primary mt-[8px]">
          Visit: <span className="text-[18px] text-primary font-bold">fyuse.org</span>
        </p>
      </div>
    </div>
  );
}
