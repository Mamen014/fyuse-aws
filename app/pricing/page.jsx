"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import LearnMoreModal from "@/components/LearnMoreModal";
import LearnMoreLite from "@/components/LearnMoreLite";
import LearnMorePro from "@/components/LearnMorePro";
import LearnMoreElite from "@/components/LearnMoreElite";
import Navbar from "@/components/Navbar";

const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

export default function PricingPlans() {
  const [openLearnMoreIndex, setOpenLearnMoreIndex] = useState(null);
  const { user } = useAuth();
  const userEmail = user?.profile?.email;

  const handleTrack = async (action, planName) => {
    console.log(`User selected plan: ${planName}`);
    const payload = {
      userEmail,
      action,
      planName,
      timestamp: new Date().toISOString(),
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

  return (
    <>
      {/* Full-page Pricing Plans */}
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
                  onClick={() => handleTrack("purchase_plan", plan.name)}
                  className="w-full bg-cta text-cta-foreground rounded-full text-sm md:text-base hover:bg-primary transition-colors"
                  aria-label={`Select ${plan.name}`}
                >
                  {plan.buttonText}
                </Button>
                {/* Conditionally render the "Learn More" button */}
                {plan.LearnMoreComponent && (
                  <Button
                    onClick={() => {
                      setOpenLearnMoreIndex(index);
                      handleTrack("learn_more", plan.name);
                    }}
                    className="w-full bg-background text-foreground border border-cta hover:bg-cta hover:text-cta-foreground rounded-full text-sm md:text-base transition-colors"
                    aria-label={`Learn more about ${plan.name}`}
                  >
                    Learn More
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* <div className="bottom-0 left-0 right-0 bg-background py-8 px-2 flex justify-between items-center"> */}
        {/* Back to Home (Arrow Icon) */}
        {/* <Link href="/" passHref>
            <button
              className="text-foreground text-xl hover:text-cta transition-colors"
              aria-label="Back to Home"
            >
              ← Back to Home
            </button>
          </Link> */}

        {/* Link to /features */}
        {/* <Link href="/features" passHref>
            <button
              className="text-foreground text-xl hover:text-cta transition-colors"
              aria-label="View Features Page"
            >
              View Features →
            </button>
          </Link> */}
        {/* </div> */}
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
