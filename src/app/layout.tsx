import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "RIGMS - Rural Infrastructure Grant Management System",
  description: "Next-generation digital governance platform for managing, monitoring, and transparently distributing government grants for rural development.",
  keywords: ["rural development", "grants", "infrastructure", "government", "transparency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
