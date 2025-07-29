"use client";

import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import LoadingModalSpinner from "@/components/ui/LoadingState";
import { getOrCreateSessionId } from "@/lib/session";

export default function PricingPlans() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, isLoading, signinRedirect } = useAuth();
  const sessionId = getOrCreateSessionId();
  const token = user?.access_token;

  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!isLoading && !user) {
      signinRedirect();
    }
  }, [isLoading, user, signinRedirect]);

  // 🔍 Injected Logging Function (not imported from lib)
  const logActivity = async (action, selection) => {
    if (!token || !sessionId) return;

    try {
      const res = await fetch("/api/log-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          action,
          page: "/plan",
          selection,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.warn("⚠️ Failed to log activity:", err.message);
      }
    } catch (error) {
      console.error("❌ Activity log error:", error);
    }
  };

  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "10 Personalized Styling",
        "20 Change Preferences",
        "15 Saved Items in Wardrobe",
      ],
      buttonText: "Continue with Basic",
    },
    {
      name: "Elegant",
      price: "Rp. 29.999/Month",
      features: [
        "20 Personalized Styling",
        "30 Change Preferences",
        "50 Saved Items in Wardrobe",
      ],
      buttonText: "Upgrade to Elegant – Rp.29.999/Mo",
    },
    {
      name: "Glamour",
      price: "Rp. 59.999/Month",
      features: [
        "40 Personalized Styling",
        "Unlimited Change Preferences",
        "Unlimited Saved Items in Wardrobe",
      ],
      buttonText: "Upgrade to Glamour – Rp.59.999/Mo",
    },
  ];

  const handlePlanSelect = async (planName) => {
    setLoading(true);
    logActivity("purchase_plan", planName).catch(() => {});

    if (planName === "Basic") {
      router.push("/dashboard");
    } else {
      setSelectedPlan(planName);
      setShowThankYou(true);
      setLoading(false);
    }
  };

  const closeThankYouModal = () => {
    setLoading(true);
    setShowThankYou(false);
    router.push("/dashboard");
  };

  return (
    <>
      {loading && <LoadingModalSpinner />}
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
                <h3 className="text-xl md:text-2xl font-semibold text-center text-primary">{plan.name}</h3>
                <p className="text-lg md:text-xl text-cta mt-2 text-center">{plan.price}</p>
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

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4">
          <div className="bg-background rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <h3 className="text-2xl font-bold mb-4 text-green-600">
              🎉 Thank You for Choosing FYUSE Premium!
            </h3>
            <p className="text-base text-foreground mb-4">
              You’ve selected the {selectedPlan} Plan with special promo pricing.
              <br />
              We’re currently in early-access testing mode — actual payment isn’t required yet.
              <br />
              Your interest helps us improve FYUSE for you.
            </p>
            <p className="text-green-700 font-semibold">
              {selectedPlan === "Elegant" && "✔ You’re now pre-enrolled in the Elegant Plan (Rp.29,999/mo)"}
              {selectedPlan === "Glamour" && "✔ You’re now pre-enrolled in the Glamour Plan (Rp.59,999/mo)"}
            </p>
            <Button
              onClick={closeThankYouModal}
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
