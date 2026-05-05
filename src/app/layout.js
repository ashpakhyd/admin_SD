import { Geist } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata = {
  title: "SD Admin",
  description: "Store Management Admin Panel",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SD Admin",
  },
};

export const viewport = {
  themeColor: "#1e40af",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
