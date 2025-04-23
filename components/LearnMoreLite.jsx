export default function LearnMoreLite() {
  return (
    <div className="p-6 bg-background text-foreground rounded-2xl text-left text-lg space-y-4">
      <h4 className="text-2xl font-bold text-primary">✨ Lite Plan</h4>
      <p className="text-base text-foreground">
        Ideal For: Stylish beginners looking for insights
      </p>
      <ul className="list-disc ml-6 space-y-2 text-foreground">
        <li>✅ 10 Try-Ons/month including Matching Analysis</li>
        <li>✅ 15 Styling Tips tailored to your preferences</li>
        <li>✅ 25-item Digital Wardrobe to plan outfits virtually</li>
        <li>🚫 Compare Looks feature</li>
        <li>🚫 Personalized Styling Recommendation</li>
      </ul>
      <p className="text-cta text-base">
        💬 Limited-time promo – save 40%
      </p>
    </div>
  );
}