import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner"; // Keep Toaster here for global notifications if needed across all pages

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
        <AuthProvider>
          {children}
          <Toaster position="top-center" closeButton richColors /> {/* Keep Toaster accessible globally */}
        </AuthProvider>
      </body>
    </html>
  );
}
