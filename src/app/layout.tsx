import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fraunces,
  Saira_Extra_Condensed,
  Saira,
  IBM_Plex_Mono,
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

// ── HeliQuant brand faces — "NIGHT GARAGE" (dark automotive brutalism) ──
// Display: condensed motorsport headline face. Body: its grotesk family. Mono: telemetry figures.
const displayCondensed = Saira_Extra_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const sansSaira = Saira({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const monoPlex = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "HeliQuant — The disciplined trading engine",
  description:
    "Autonomous multi-desk AI trading firm on Mantle, built like an engine: desks ingest, debate " +
    "compresses, the PM sparks ENTER only on a validated edge — otherwise it holds gear (ABSTAIN). " +
    "Every decision sealed on-chain. We publish what doesn't work too.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable} ${displayCondensed.variable} ${monoPlex.variable} ${sansSaira.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
