"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

export default function UserFashionInsight() {
  const auth = useAuth();
  const userEmail = auth?.user?.profile?.email;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState("");
  const API_BASE_URL = process.env.NEXT_PUBLIC_FYUSEAPI;

  useEffect(() => {
    async function fetchUserData() {
      if (!userEmail) return;
      try {
        const endpoint = `${API_BASE_URL}/insight?userEmail=${encodeURIComponent(userEmail)}`;
        const res = await fetch(endpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        const parsedBody = JSON.parse(json.body);
        setData(parsedBody.userData);
        setInsight(parsedBody.fashionInsight || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [userEmail]);

  if (loading)
    return (
      <div style={styles.container}>
        <h2>Loading your fashion insights...</h2>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <h2>Error: {error}</h2>
      </div>
    );

  const {
    physicalAppearance1,
    physicalAppearance2,
    StylePref1,
    StylePref2,
    StylePref3,
    userEmail: email,
    userProfile,
    tipsCount,
    recommendedHistory,
  } = data;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Fashion Insights</h1>

      <section style={styles.card}>
        <h3>User Profile</h3>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Location:</strong> {userProfile.city}, {userProfile.country}</p>
        <p><strong>Occupation:</strong> {userProfile.occupation}</p>
        <p><strong>Birthdate:</strong> {new Date(userProfile.birthdate).toLocaleDateString()}</p>
      </section>

      <section style={styles.card}>
        <h3>Physical Appearance</h3>
        <p><strong>Gender:</strong> {physicalAppearance1.gender}</p>
        <p><strong>Skin Tone:</strong> {physicalAppearance1.skinTone}</p>
        <p><strong>Body Shape:</strong> {physicalAppearance2.bodyShape}</p>
      </section>

      <section style={styles.card}>
        <h3>Style Preferences</h3>
        <p><strong>Type:</strong> {StylePref1.selectedType}</p>
        <p><strong>Colors:</strong> {StylePref2.colors?.join(", ")}</p>
        <p><strong>Brands:</strong> {StylePref2.brands?.join(", ")}</p>
        <p><strong>Fit:</strong> {StylePref3.fit}</p>
        <p><strong>Clothing Type:</strong> {StylePref3.clothingType}</p>
      </section>

      <section style={styles.card}>
        <h3>AI Fashion Insight</h3>
        <p>{insight || "No fashion insight generated yet."}</p>
      </section>

      <section style={styles.card}>
        <h3>Recommended History</h3>
        {recommendedHistory.length === 0 ? (
          <p>No recommendations yet.</p>
        ) : (
          recommendedHistory.map(({ productId, liked, genderCategory, "gender#category": genderHashCategory }, i) => (
            <div key={i} style={styles.recommendation}>
              <p><strong>Product:</strong> {productId}</p>
              <p><strong>Category:</strong> {genderCategory ?? genderHashCategory ?? "N/A"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span style={{ color: liked ? "green" : "gray" }}>
                  {liked ? "Liked ❤️" : "Not liked"}
                </span>
              </p>
            </div>
          ))
        )}
      </section>

      <footer style={{ marginTop: 20, fontSize: 12, color: "#888" }}>
        Total Tips Generated: {tipsCount}
      </footer>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: "2rem auto",
    padding: "1rem 2rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222",
  },
  title: {
    textAlign: "center",
    color: "#1a73e8",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#f9f9fb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: "0 4px 12px rgba(26, 115, 232, 0.1)",
  },
  recommendation: {
    borderTop: "1px solid #ddd",
    paddingTop: 8,
    marginTop: 8,
  },
};
