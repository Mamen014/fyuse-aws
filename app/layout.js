// app/layout.js
import "./globals.css";
import OidcAuthProvider from "../components/OidcAuthProvider";
import AuthLoader from "../components/AuthLoader";
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <OidcAuthProvider>
          <AuthLoader>
            {children}
          </AuthLoader>
        </OidcAuthProvider>
      </body>
    </html>
  );
}
