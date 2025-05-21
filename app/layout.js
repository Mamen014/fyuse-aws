// app/layout.js
import "./globals.css";
import OidcAuthProvider from "../components/OidcAuthProvider";

// export const metadata = {
//   title: "FYUSE",
//   description: "For You Style",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <OidcAuthProvider>{children}</OidcAuthProvider>
      </body>
    </html>
  );
}