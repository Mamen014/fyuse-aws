import { useState } from "react";
import { Button } from "@/components/ui/button";
import LearnMoreBasic from "./LearnMoreBasic";
import LearnMoreLite from "./LearnMoreLite";
import LearnMorePro from "./LearnMorePro";
import LearnMoreElite from "./LearnMoreLite";

export default function PricingPlans({ onSelectPlan }) {
  const [openPlan, setOpenPlan] = useState(null);

  const togglePlan = (index) => {
    setOpenPlan((prev) => (prev === index ? null : index));
  };

  const plans = [
    {
      name: "Basic (Free)",
      price: "Rp. 0/mo",
      features: ["5 Try-Ons/month", "Matching Analysis"],
      promo: null,
      buttonText: "Continue with Basic Plan",
      LearnMoreComponent: LearnMoreBasic,
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-white mb-6">Choose Your Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan, index) => {
          const LearnMoreComponent = plan.LearnMoreComponent;

          return (
            <div
              key={index}
              className="border border-purple-600 bg-[#1a1a2e] text-white rounded-xl p-5 shadow-lg flex flex-col justify-between w-full min-w-[280px] max-w-sm"
            >
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-lg text-purple-300 mt-1">{plan.price}</p>
                <ul className="mt-3 text-sm text-purple-200 list-disc ml-4 space-y-1">
                  {plan.features.map((feature, i) => (
                    <li key={i}>✅ {feature}</li>
                  ))}
                </ul>
                {plan.promo && <p className="mt-3 text-yellow-400">{plan.promo}</p>}
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => onSelectPlan(plan.name)}
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:opacity-90"
                >
                  {plan.buttonText}
                </Button>

                {/* Render LearnMore component with props */}
                <LearnMoreComponent isOpen={openPlan === index} toggle={() => togglePlan(index)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
