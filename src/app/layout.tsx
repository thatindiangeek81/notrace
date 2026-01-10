import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jetbrainsMono =JetBrains_Mono ({
  variable:"--font-jebrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "NoTrace - Chat Room",
  description: "Self-destructing chat rooms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
