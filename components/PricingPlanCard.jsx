"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import LearnMoreModal from "./LearnMoreModal";
import LearnMoreLite from "./LearnMoreLite";
import LearnMorePro from "./LearnMorePro";
import LearnMoreElite from "./LearnMoreElite";
import { trackEvent } from "@/lib/trackevent";

export default function PricingPlans({ isOpen, onSelectPlan, onClose }) {
  const [openLearnMoreIndex, setOpenLearnMoreIndex] = useState(null);

  if (!isOpen) return null;

  const plans = [
    {
      name: "Basic Plan",
      price: "Free Forever",
      features: [
        "5 Try-Ons per Month + Matching Analysis",
        "Styling Tips",
        "15 Styles in the Digital Wardrobe",
      ],
      promo: "",
      buttonText: "Continue with Basic",
    },
    {
      name: "Lite Plan",
      price: "Rp. 29,999/mo",
      features: ["10 Try-Ons/month", "Color Harmony Tips", "Style Suggestions"],
      promo: "🔓 Promo Price! 40% OFF",
      buttonText: "Upgrade to Lite – Rp.29,999",
      LearnMoreComponent: LearnMoreLite,
    },
    {
      name: "Pro Plan",
      price: "Rp. 59,999/mo",
      features: [
        "25 Try-Ons/month",
        "AI Stylist Assistant",
        "Compare Looks Side-by-Side",
        "Digital Wardrobe (Beta)",
      ],
      promo: "🔓 Promo Price! Save Rp.15,000",
      buttonText: "Upgrade to Pro – Rp.59,999",
      LearnMoreComponent: LearnMorePro,
    },
    {
      name: "👑 Elite Plan",
      price: "Coming Soon",
      features: [
        "Unlimited Try-Ons + Matching Analysis",
        "Unlimited Personalized Stylist Assistant",
        "Wardrobe Tracker + Body Tracker",
        "Unlimited Styles in the Digital Wardrobe",
        "Exclusive Outfits",
      ],
      promo: "💬 Be the first to experience Elite benefits",
      buttonText: "Notify Me on Launch",
      LearnMoreComponent: LearnMoreElite,
    },
  ];

  // Track plan selection event, then call the provided callback.
  const handlePlanSelect = async (planName) => {
    try {
      await trackEvent("pricing-plan-selected", { plan: planName });
    } catch (error) {
      console.error("Error tracking plan selection", error);
    }
    onSelectPlan(planName);
  };

  // Track "Learn More" event when the button is clicked.
  const handleLearnMore = async (index) => {
    try {
      await trackEvent("pricing-plan-learn-more", { plan: plans[index].name });
    } catch (error) {
      console.error("Error tracking learn more", error);
    }
    setOpenLearnMoreIndex(index);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center overflow-y-auto">
        <div className="bg-[#0f0f1a] text-white rounded-3xl p-8 max-w-7xl w-full mx-4 shadow-2xl relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-6 text-white text-3xl font-bold hover:text-purple-300 z-10"
            aria-label="Close Pricing Modal"
          >
            &times;
          </button>
          <h2 className="text-4xl font-bold text-center mb-8">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="border border-purple-600 bg-[#1a1a2e] rounded-xl p-6 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-center">
                    {plan.name}
                  </h3>
                  <p className="text-xl text-purple-300 mt-2 text-center">
                    {plan.price}
                  </p>
                  <ul className="mt-4 text-base text-purple-200 list-disc ml-6 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i}>✅ {feature}</li>
                    ))}
                  </ul>
                  {plan.promo && (
                    <p className="mt-3 text-yellow-400 text-sm text-center">
                      {plan.promo}
                    </p>
                  )}
                </div>
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => handlePlanSelect(plan.name)}
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-full text-base hover:scale-[1.02] transition-transform"
                  >
                    {plan.buttonText}
                  </Button>
                  {plan.LearnMoreComponent && (
                    <Button
                      onClick={() => handleLearnMore(index)}
                      className="w-full text-white border-purple-500 hover:bg-purple-800 hover:border-purple-400 rounded-full text-base transition-colors"
                    >
                      Learn More
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {openLearnMoreIndex !== null &&
        plans[openLearnMoreIndex]?.LearnMoreComponent && (
          <LearnMoreModal
            isOpen={true}
            onClose={() => setOpenLearnMoreIndex(null)}
            Component={plans[openLearnMoreIndex].LearnMoreComponent}
          />
        )}
    </>
  );
}
