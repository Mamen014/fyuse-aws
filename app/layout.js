// app/layout.js
import "./globals.css";
import OidcAuthProvider from "../components/OidcAuthProvider";

export const metadata = {
  title: "FYUSE",
  description: "For You Style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body suppressHydrationWarning={true}>
        <OidcAuthProvider>{children}</OidcAuthProvider>
      </body>
    </html>
  );
}
