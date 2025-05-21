"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PricingPlans({ isOpen, onSelectPlan, onClose }) {
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
        console.log("Setting user_id for GA4 tracking:", userId);
        window.gtag("set", { user_id: userId });
      } else {
        console.warn("No logged-in user found. Skipping user identification.");
      }
      window.gtag("event", "select_plan", { plan: planName });
      console.log("Plan selection event successfully sent to GA4.");
    } catch (error) {
      console.error("Error tracking plan selection:", error.message, error.stack);
    }
    onSelectPlan(planName);
  };

  return (
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

                {plan.promo && (
                  <p className="mt-3 text-cta text-xs md:text-sm text-center">
                    {plan.promo}
                  </p>
                )}
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
  );
}
