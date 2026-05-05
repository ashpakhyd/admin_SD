import { Geist } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata = {
  title: "SD Admin",
  description: "Store Management Admin Panel",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/businessman.png",
    apple: "/icons/businessman.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SD Admin",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <link rel="apple-touch-icon" href="/icons/businessman.png" />
        <link rel="manifest" href="/manifest.json" />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
