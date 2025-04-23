"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import LearnMoreModal from "./LearnMoreModal";
import LearnMoreLite from "./LearnMoreLite";
import LearnMorePro from "./LearnMorePro";
import LearnMoreElite from "./LearnMoreElite";

export default function PricingPlans({ isOpen, onSelectPlan, onClose }) {
  const [openLearnMoreIndex, setOpenLearnMoreIndex] = useState(null);

  if (!isOpen) return null;

  const plans = [
    // New Basic Plan
    {
      name: "Basic Plan",
      price: "Free Forever",
      features: [
        "3 Try-Ons/Month",
        "6 Styling Tips",
        "15 Styles in the Digital Wardrobe",
      ],
      promo: "",
      buttonText: "Continue with Basic",
    },
    {
      name: "Lite Plan",
      price: "Rp. 29,999/mo",
      features: [
        "10 Try-Ons/month",
        "15 Styling Tips",
        "25 Styles in the Digital Wardrobe",
      ],
      promo: "🔓 Promo Price! 40% OFF",
      buttonText: "Upgrade to Lite – Rp.29,999",
      LearnMoreComponent: LearnMoreLite,
    },
    {
      name: "Pro Plan",
      price: "Rp. 59,999/mo",
      features: [
        "25 Try-Ons/month",
        "20 Personalized Styling Recommendations",
        "Compare Looks Side-by-Side",
        "30 Styles in the Digital Wardrobe",
      ],
      promo: "🔓 Promo Price! Save Rp.15,000",
      buttonText: "Upgrade to Pro – Rp.59,999",
      LearnMoreComponent: LearnMorePro,
    },
    {
      name: "👑 Elite Plan",
      price: "Coming Soon",
      features: [
        "Unlimited Try-Ons",
        "Unlimited Personalized Styling recommendations",
        "Wardrobe Tracker + Body Tracker",
        "Unlimited Styles in the Digital Wardrobe",
        "Exclusive Outfits",
      ],
      promo: "💬 Be the first to experience Elite benefits",
      buttonText: "Notify Me on Launch",
      LearnMoreComponent: LearnMoreElite,
    },
  ];

  const handlePlanSelect = (planName) => {
    try {
      console.log("Tracking plan selection for plan:", planName);
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedInUser) {
        const userId = loggedInUser.profile?.sub || loggedInUser.email;
        console.log("Setting user_id for GA4 tracking:", userId);
        window.gtag("set", { user_id: userId });
      } else {
        console.warn("No logged-in user found. Skipping user identification.");
      }
      window.gtag("event", "select_plan", { plan: planName });
      console.log("Plan selection event successfully sent to GA4.");
    } catch (error) {
      console.error(
        "Error tracking plan selection:",
        error.message,
        error.stack,
      );
    }
    onSelectPlan(planName);
  };

  const handleLearnMore = (index) => {
    try {
      console.log(`Tracking "Learn More" event for plan index: ${index}`);
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedInUser) {
        const userId = loggedInUser.profile?.sub || loggedInUser.email;
        console.log("Setting user_id for GA4 tracking:", userId);
        window.gtag("set", { user_id: userId });
      } else {
        console.warn("No logged-in user found. Skipping user identification.");
      }
      const planName = plans[index].name;
      window.gtag("event", "learn_more", { plan: planName });
      console.log(
        `"Learn More" event successfully sent to GA4 for plan: ${planName}`,
      );
    } catch (error) {
      console.error(
        "Error tracking 'Learn More' event:",
        error.message,
        error.stack,
      );
    }
    setOpenLearnMoreIndex(index);
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center overflow-y-auto">
        <div className="bg-background text-primary rounded-3xl p-8 max-w-7xl w-full mx-4 shadow-2xl relative overflow-y-auto max-h-[90vh]">
          {/* Close Modal */}
          <button
            onClick={onClose}
            className="absolute top-5 right-6 text-primary text-3xl font-bold hover:text-cta z-10"
            aria-label="Close Pricing Modal"
          >
            &times;
          </button>

          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Choose Your Plan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="border border-cta bg-background rounded-xl p-6 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Plan Name */}
                  <h3 className="text-xl md:text-2xl font-semibold text-center text-primary">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <p className="text-lg md:text-xl text-cta mt-2 text-center">
                    {plan.price}
                  </p>

                  {/* Features */}
                  <ul className="mt-4 text-sm md:text-base text-foreground list-disc ml-6 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>

                  {/* Promo */}
                  {plan.promo && (
                    <p className="mt-3 text-cta text-xs md:text-sm text-center">
                      {plan.promo}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => handlePlanSelect(plan.name)}
                    className="w-full bg-cta text-cta-foreground rounded-full text-sm md:text-base hover:bg-primary transition-colors"
                  >
                    {plan.buttonText}
                  </Button>

                  {/* Conditionally render the "Learn More" button */}
                  {plan.LearnMoreComponent && (
                    <Button
                      onClick={() => handleLearnMore(index)}
                      className="w-full bg-background text-foreground border border-cta hover:bg-cta hover:text-cta-foreground rounded-full text-sm md:text-base transition-colors"
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

      {/* Learn More Modal */}
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
