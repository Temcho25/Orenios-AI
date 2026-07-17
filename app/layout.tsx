import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ThemeProvider from "./components/ThemeProvider";
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
  title: "Orenios AI – Your AI Life Admin",
  description:
    "Orenios AI is your personal AI life admin. Organize your goals, tasks, calendar, notes and daily planning in one intelligent workspace. Join the waitlist today.",
  keywords: [
    "AI",
    "AI assistant",
    "life admin",
    "productivity",
    "task manager",
    "goals",
    "calendar",
    "daily planner",
    "personal AI",
    "Orenios AI",
  ],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Orenios AI – Your AI Life Admin",
    description:
      "One AI that remembers your goals, organizes your tasks and plans your day.",
    url: "https://orenios.com",
    siteName: "Orenios AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orenios AI – Your AI Life Admin",
    description:
      "One AI that remembers your goals, organizes your tasks and plans your day.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}