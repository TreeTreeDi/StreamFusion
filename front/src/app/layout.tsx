import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar/navbar";
import { Sidebar } from "@/components/sidebar/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwitchClone - 直播平台",
  description: "一个类似Twitch的直播平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Navbar />
        <div className="flex h-full pt-14">
          <Sidebar className="hidden md:flex w-60 h-full" />
          <main className="flex-1 h-full">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
} 
