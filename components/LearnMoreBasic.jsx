export default function LearnMoreBasic({ isOpen, toggle }) {
    return (
      <div className="text-center">
        <button
          onClick={toggle}
          className="text-purple-400 hover:underline focus:outline-none"
        >
          👉 {isOpen ? "Hide Details" : "Learn More About Basic Plan"}
        </button>
  
        {isOpen && (
          <div className="mt-4 p-4 bg-[#29293d] text-white rounded-lg">
            <h4 className="text-lg font-bold">🆓 Basic Plan</h4>
            <p className="text-purple-300">Free Forever</p>
            <p className="mt-1">Ideal For: Exploring the core experience</p>
            <ul className="mt-2 text-sm text-purple-200 list-disc ml-4 space-y-1">
              <li>✅ 5 Try-Ons per Month + Matching Analysis</li>
              <li>✅ Style Quiz & Outfit Save</li>
              <li>✅ 15 Styles in the Digital Wardrobe</li>
              <li>🚫 No Personalized Stylist Assistant</li>
            </ul>
          </div>
        )}
      </div>
    );
  }
  