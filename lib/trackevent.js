// lib/trackEvent.js
export async function trackEvent(eventType, additionalData = {}) {
  const loggedInUser = localStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    console.error("User not logged in");
    return;
  }
  const user = JSON.parse(loggedInUser);
  const idToken = user.idToken;

  const payload = {
    eventType, // e.g., "pricing-plan-selected", "pricing-plan-learn-more"
    userId: user.profile?.sub || user.email,
    timestamp: Date.now(),
    ...additionalData,
  };

  try {
    const res = await fetch("/api/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("Tracking response:", data);
    return data;
  } catch (error) {
    console.error("Error tracking event:", error);
    throw error;
  }
}
