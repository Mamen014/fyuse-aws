// app/layout.js

import "./globals.css";
import OidcAuthProvider from "../components/OidcAuthProvider";
import { GoogleAnalytics } from '@next/third-parties/google';
import PageViewTracker from "@/app/page-view-tracker";
import { Poppins, Raleway } from "next/font/google";
import { UserProfileProvider } from "@/app/context/UserProfileContext";
import { Toaster } from "react-hot-toast"; // ✅ Import

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const raleway = Raleway({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
});

export const metadata = {
  title: "FYUSE",
  description: "For You Style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${raleway.variable}`}>
      <head>

      </head>
      <body className="min-h-screen bg-white font-body antialiased">
        <OidcAuthProvider>
          <UserProfileProvider>
            <PageViewTracker />
            {process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID && (
              <GoogleAnalytics
                gaId={process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}
                gaOptions={{ send_page_view: false }}
              />
            )}            
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  zIndex: 9999,
                },
              }}
            />
            {children}
          </UserProfileProvider>
        </OidcAuthProvider>
      </body>
    </html>
  );
}
