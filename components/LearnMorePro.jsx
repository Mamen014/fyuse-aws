export default function LearnMorePro({ isOpen, toggle }) {
    return (
      <div className="text-center">
        <button
          onClick={toggle}
          className="text-purple-400 hover:underline focus:outline-none"
        >
          👉 {isOpen ? "Hide Details" : "Learn More About Pro Plan"}
        </button>
  
        {isOpen && (
          <div className="mt-4 p-4 bg-[#29293d] text-white rounded-lg">
            <h4 className="text-lg font-bold">🔥 Pro Plan</h4>
            <p className="text-purple-300">→ Promo Rp59,999</p>
            <p className="mt-1">Ideal For: Fashion-savvy users who want full personalization</p>
            <ul className="mt-2 text-sm text-purple-200 list-disc ml-4 space-y-1">
              <li>✅ 25 Try-Ons per Month + Matching Analysis</li>
              <li>✅ 40 Personalized Stylist Assistant</li>
              <li>✅ Compare Looks Side-by-Side</li>
              <li>✅ 40 Styles in the Digital Wardrobe</li>
              <li>🚫 Exclusive Outfits</li>
              <li>🚫 Wardrobe Tracker + Body Tracker</li>
            </ul>
            <p className="mt-2 text-yellow-400">💬 Most Popular – Save Rp15,000 now</p>
          </div>
        )}
      </div>
    );
  }
  