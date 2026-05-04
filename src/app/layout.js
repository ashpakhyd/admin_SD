import { Geist } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata = {
  title: "Admin Panel",
  description: "Store Management Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
