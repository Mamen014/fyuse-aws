import "./globals.css";
import OidcAuthProvider from "../components/OidcAuthProvider";
import Script from "next/script";
import PageViewTracker from "@/app/page-view-tracker";
import { Poppins, Raleway } from "next/font/google";

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
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}`}
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}', {
              send_page_view: false
            });
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-white font-body antialiased">
        <OidcAuthProvider>
          <PageViewTracker />
          {children}
        </OidcAuthProvider>
      </body>
    </html>
  );
}
