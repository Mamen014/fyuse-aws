"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PricingPlans({ isOpen, onSelectPlan, onClose }) {
  const router = useRouter();
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState(null); // NEW
  const [showThankYou, setShowThankYou] = useState(false); // NEW

  if (!isOpen) return null;

  const plans = [
    {
      name: "Basic",
      price: "Free Forever",
      features: [
        "10 Style Me",
        "20 Personalized Styling",
        "20 Change Preferences",
        "15 Saved Items in Wardrobe",
      ],
      promo: "",
      buttonText: "Continue with Basic",
    },
    {
      name: "Elegant",
      price: "Rp. 29,999/mo",
      features: [
        "25 Virtual Try-Ons",
        "30 Personalized Styling",
        "30 Change Preferences",
        "Unlimited Saved Items in Wardrobe",
      ],
      promo: "",
      buttonText: "Upgrade to Elegant – Rp.29,999",
    },
    {
      name: "Glamour",
      price: "Rp. 59,999/mo",
      features: [
        "40 Virtual Try-Ons",
        "Unlimited Personalized Styling",
        "Unlimited Change Preferences",
        "Unlimited Saved Items in Wardrobe",
      ],
      promo: "",
      buttonText: "Upgrade to Glamour – Rp.59,999",
    },
  ];

  const handlePlanSelect = (planName) => {
    try {
      console.log("Tracking plan selection for plan:", planName);
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedInUser) {
        const userId = loggedInUser.profile?.sub || loggedInUser.email;
        window.gtag("set", { user_id: userId });
      }
      window.gtag("event", "select_plan", { plan: planName });
    } catch (error) {
      console.error("Error tracking plan selection:", error.message);
    }

    onSelectPlan(planName);

    if (planName === "Basic") {
      router.push("/");
    } else {
      setSelectedPremiumPlan(planName);
      setShowThankYou(true);
    }
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    onClose(); // Close pricing modal
    router.push("/");
  };

  return (
    <>
      {/* Pricing Modal */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center overflow-y-auto">
        <div className="bg-background text-primary rounded-3xl p-8 max-w-7xl w-full mx-4 shadow-2xl relative overflow-y-auto max-h-[90vh]">
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
                  <h3 className="text-xl md:text-2xl font-semibold text-center text-primary">
                    {plan.name}
                  </h3>
                  <p className="text-lg md:text-xl text-cta mt-2 text-center">
                    {plan.price}
                  </p>
                  <ul className="mt-4 text-sm md:text-base text-foreground list-disc ml-6 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => handlePlanSelect(plan.name)}
                    className="w-full bg-cta text-cta-foreground rounded-full text-sm md:text-base hover:bg-primary transition-colors"
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-background text-primary p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 text-center">
            <h3 className="text-2xl font-bold mb-4 text-green-600">
              🎉 Thank You for Choosing FYUSE Premium!
            </h3>
            <p className="text-sm md:text-base text-foreground mb-4">
              You’ve selected the {selectedPremiumPlan} Plan with special promo pricing.<br />
              We’re currently in early-access testing mode — actual payment isn’t required yet.<br />
              Your interest helps us improve FYUSE for you.
            </p>
            <p className="text-green-700 font-semibold mt-2">
              ✔ You’re now pre-enrolled in the {selectedPremiumPlan} Plan (
              {selectedPremiumPlan === "Elegant" ? "Rp.29,999/mo" : "Rp.59,999/mo"})
            </p>
            <Button
              onClick={handleThankYouClose}
              className="mt-6 bg-cta text-cta-foreground rounded-full hover:bg-primary"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
