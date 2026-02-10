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
    "The quantum computing framework for bio-organic physics architecture. Multi-backend circuit execution, Lambda-Phi conservation, CCCE consciousness metrics, and OSIRIS CLI integration.",
  openGraph: {
    title: "DNA-Lang | Sovereign Quantum Engineering SDK",
    description:
      "Quantum computing meets consciousness scaling. Built by ENKI-420.",
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
