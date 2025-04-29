import type { Metadata } from "next";
// Inter font and globals.css should be handled by the root layout now
import { Navbar } from "@/components/navbar/navbar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { SidebarProvider } from "@/contexts/sidebar-context";

// Optional: Define metadata specific to this layout section if needed,
// otherwise remove or leave empty to inherit from root.
export const metadata: Metadata = {
  // title: "TwitchClone - Main App",
};

export default function MainAppLayout({ // Renamed for clarity
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No <html> or <body> tags needed here, provided by the root layout
  // AuthProvider and Toaster are also moved to the root layout
  return (
    <SidebarProvider>
      <Navbar />
      <div className="flex h-full pt-14">
        <Sidebar className="hidden md:flex w-60 h-full" />
        <main className="flex-1 h-full">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
