import { useState } from "react";

export default function LearnMoreElite() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-purple-400 hover:underline focus:outline-none"
      >
        👉 Learn More About Elite Plan
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-[#29293d] text-white rounded-lg">
          <h4 className="text-lg font-bold">👑 Elite Plan</h4>
          <p className="text-purple-300">Coming Soon</p>
          <p className="mt-1">Ideal For: Power users, influencers & fashion creators</p>
          <ul className="mt-2 text-sm text-purple-200 list-disc ml-4 space-y-1">
            <li>✅ Unlimited Try-Ons + Matching Analysis</li>
            <li>✅ Unlimited Personalized Stylist Assistant</li>
            <li>✅ Wardrobe Tracker + Body Tracker</li>
            <li>✅ Unlimited Styles in the Digital Wardrobe</li>
            <li>✅ Exclusive Outfits</li>
          </ul>
          <p className="mt-2 text-yellow-400">💬 Be the first to experience Elite benefits</p>
        </div>
      )}
    </div>
  );
}
