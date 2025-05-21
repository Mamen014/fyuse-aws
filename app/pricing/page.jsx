"use client";

import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

export default function PricingPlans() {
  const { user } = useAuth();
  const userEmail = user?.profile?.email;

  const handleTrack = async (action, planName) => {
    console.log(`User selected plan: ${planName}`);
    const payload = {
      userEmail,
      action,
      planName,
      timestamp: new Date().toISOString(),
      page: "PricingPage",
    };

    try {
      const res = await fetch(`${API_BASE_URL}/trackevent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Tracking result:", result);
    } catch (err) {
      console.error("Failed to track user event:", err);
    }
  };

  const plans = [
    {
      name: "Basic",
      price: "Free",
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
      price: "Rp. 29.999/Month",
      features: [
        "25 Style Me",
        "30 Personalized Styling Recommendations",
        "30 Change Preferences",
        "Unlimited Saved Items in Wardrobe",
      ],
      promo: "",
      buttonText: "Upgrade to Elegant – Rp.29.999/Mo",
    },
    {
      name: "Glamour",
      price: "Rp. 59.999/Month",
      features: [
        "40 Style Me",
        "Unlimited Personalized Styling",
        "Unlimited Change Preferences",
        "Unlimited Saved Items in Wardrobe",
      ],
      promo: "",
      buttonText: "Upgrade to Glamour – Rp.59.999/Mo",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-background text-foreground mt-20 min-h-screen p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary">
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

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => handleTrack("purchase_plan", plan.name)}
                  className="w-full bg-cta text-cta-foreground rounded-full text-sm md:text-base hover:bg-primary transition-colors"
                  aria-label={`Select ${plan.name}`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
