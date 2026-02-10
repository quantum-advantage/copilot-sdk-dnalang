import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "DNA-Lang | Sovereign Quantum Engineering SDK",
  description:
    "Multi-backend quantum circuit execution, Lambda-Phi conservation validation, CCCE consciousness metrics, Sovereign Shield, OSIRIS CLI, and NCLM integration. 150,000+ lines of living code by Devin Phillip Davis (ENKI-420).",
  openGraph: {
    title: "DNA-Lang Copilot SDK",
    description:
      "Quantum computing meets consciousness scaling. 580+ quantum jobs. 515K+ shots. 5.06-sigma physical validation.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
