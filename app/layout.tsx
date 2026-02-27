import "./globals.css";
import { Suspense } from "react";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import AppShell from "@/components/layout/AppShell";

export const metadata = {
  title: "CFOC Mission App",
  description: "Connecting donors, churches, and missionaries around the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white">
        <SupabaseProvider>
          <Suspense fallback={<main className="flex-grow">{children}</main>}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </SupabaseProvider>
      </body>
    </html>
  );
}
