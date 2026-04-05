import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { A11yAnnouncer } from "@/shared/ui/a11y-announcer";
import { OfflineReadOnlyBanner } from "@/shared/ui/offline-read-only-banner";
import { getApiBaseUrl } from "@/shared/api/env";
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
  const apiBaseUrl = getApiBaseUrl();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {apiBaseUrl && (
          <link
            rel="preconnect"
            href={apiBaseUrl}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <A11yAnnouncer />
          <OfflineReadOnlyBanner />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
