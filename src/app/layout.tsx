import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fraunces,
  Space_Grotesk,
  JetBrains_Mono,
  Inter,
} from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

// ── legacy faces (kept so existing light-canvas sections keep their type) ──
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const displaySerif = Fraunces({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// ── HeliQuant standard faces (Hero4 / "Antimetal" observatory) ──
const displayGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
const monoJetBrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const sansInter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "HeliQuant — The all-seeing quant",
  description:
    "Autonomous multi-source intelligence trading firm on Mantle. Seven AI desks debate, a PM " +
    "decides, every call is gated, sized by validated edge, and anchored on-chain. Honesty-by-design.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} ${displayGrotesk.variable} ${monoJetBrains.variable} ${sansInter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
