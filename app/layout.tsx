import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

// Editorial display font for headlines - elegant, dramatic serif
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Clean, bold sans-serif for body text
const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Wrapped - Your AI Journey, Wrapped",
  description: "See your AI conversation stats visualized. Discover your total chats, longest sessions, busiest days, and personality insights from your Claude or ChatGPT history.",
  keywords: ["AI Wrapped", "Claude Wrapped", "ChatGPT Wrapped", "AI stats", "conversation analytics", "Claude statistics", "ChatGPT statistics", "year in review"],
  authors: [{ name: "Akshay Chintalapati", url: "https://twitter.com/akshayvkt" }],
  creator: "Dysun Labs",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aiwrapped.co",
    siteName: "AI Wrapped",
    title: "AI Wrapped - Your AI Journey, Wrapped",
    description: "See your AI conversation stats visualized. Discover your total chats, longest sessions, busiest days, and personality insights.",
    images: [
      {
        url: "https://aiwrapped.co/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Wrapped - Your AI journey, wrapped",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Wrapped - Your AI Journey, Wrapped",
    description: "See your AI conversation stats visualized. Total chats, longest sessions, busiest days, and more.",
    creator: "@akshayvkt",
    images: ["https://aiwrapped.co/og-image.png"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
