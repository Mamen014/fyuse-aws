// app/layout.js
// app/login/page.jsx
import AmplifyWrapper from './amplify-provider'; 
import '@aws-amplify/ui-react/styles.css';
import '../src/lib/initAmplify';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports'; // Or wherever `aws-exports.js` is
Amplify.configure(awsExports);

import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FYUSE Web App",
  description: "For You Style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header /> {/* ✅ Optional: Show global Header on all pages */}
          <AmplifyWrapper>
            {children}
          </AmplifyWrapper>
      </body>
    </html>
  );
}