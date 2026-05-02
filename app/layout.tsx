import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WalletProvider from "@/components/providers/WalletProvider";

export const metadata: Metadata = {
  title: "VERDICT Protocol — Human vs AI Trading Intelligence",
  description:
    "Challenge AI trading agents on Mantle. Compare decisions. Get the Verdict. The transparent on-chain arena where human intuition meets machine intelligence.",
  keywords: ["AI trading", "DeFi", "Mantle", "blockchain", "trading challenge", "Web3"],
  openGraph: {
    title: "VERDICT Protocol",
    description: "Human vs AI Financial Intelligence on Mantle",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="neural-bg grid-bg min-h-screen">
        <div className="fixed inset-0 neural-bg grid-bg pointer-events-none" />
        <WalletProvider>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
