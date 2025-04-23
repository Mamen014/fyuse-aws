export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // New Color Palette
        primary: {
          DEFAULT: "#0B1F63", // Primary Text & Logo
          foreground: "#FAFAFA", // Background (used as text on primary)
        },
        background: "#FAFAFA", // Background
        foreground: "#0B1F63", // Primary Text & Logo
        cta: {
          DEFAULT: "#005EB8", // CTA Button
          foreground: "#FAFAFA", // Text on CTA buttons
        },
        success: {
          DEFAULT: "#A1E3B5", // Success States
          foreground: "#0B1F63", // Text on success states
        },
        muted: {
          DEFAULT: "#FAFAFA", // Light background
          foreground: "#808080", // Text on muted backgrounds
        },
        accent: {
          DEFAULT: "#005EB8", // Accent (same as CTA for consistency)
          foreground: "#FAFAFA", // Text on accents
        },
        destructive: {
          DEFAULT: "#FF4D4D", // Red for destructive actions (not in palette, added for completeness)
          foreground: "#FAFAFA", // Text on destructive actions
        },
        border: "#005EB8", // Border color (same as CTA for consistency)
        input: "#FAFAFA", // Input background
        ring: "#005EB8", // Focus ring color
        chart: {
          1: "#005EB8", // CTA Button
          2: "#A1E3B5", // Success States
          3: "#0B1F63", // Primary Text & Logo
          4: "#FAFAFA", // Background
          5: "#005EB8", // CTA Button
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};