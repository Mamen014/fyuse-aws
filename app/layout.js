// app/layout.js
import "./globals.css";
import OidcAuthProvider from "../components/OidcAuthProvider";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  title: "FYUSE",
  description: "For You Style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <OidcAuthProvider>
          {children}
        </OidcAuthProvider>
      </body>
    </html>
  );
}
