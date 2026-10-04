import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Nirmaan | AI Learning IDE & Engineering Mentor",
  description: "Build real software. Own every line. The AI co-developer that ensures you understand and master every line of code.",
  keywords: ["AI coding", "engineering education", "code ownership", "interactive IDE", "learn to code", "Nirmaan"],
  authors: [{ name: "Nirmaan Team" }],
  openGraph: {
    title: "Nirmaan | AI Learning IDE & Engineering Mentor",
    description: "Build real software. Own every line. AI builds with you, not for you.",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFF1E7] text-slate-900">{children}</body>
    </html>
  );
}
