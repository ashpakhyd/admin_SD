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
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <head>
        <meta name="theme-color" content="#4f46e5" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/businessman.png" />
      </head>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
