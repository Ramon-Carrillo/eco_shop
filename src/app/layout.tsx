import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupportChat } from "./components/support-chat/SupportChat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoShop — Sustainable E-Commerce",
  description:
    "Eco-friendly products for your home, wardrobe, garden, and family. Powered by AI customer support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SupportChat />
      </body>
    </html>
  );
}
