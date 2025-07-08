import "./globals.css";
import OidcAuthProvider from "../components/OidcAuthProvider";
import Script from "next/script";
import PageViewTracker from "@/app/page-view-tracker";

export const metadata = {
  title: "FYUSE",
  description: "For You Style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />      
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID}`}
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // ✅ Disable automatic page_view here
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
