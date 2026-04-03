import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OfflineReadOnlyBanner } from "@/shared/ui/offline-read-only-banner";
import { QueryProvider } from "./query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tasks",
  description: "Capture and list todos backed by the API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <OfflineReadOnlyBanner />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
