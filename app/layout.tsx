import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: "variable",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: "variable",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Lovely — A little place for love",
  description:
    "A tiny interactive Valentine with memories, a silly quiz, little gifts, and one very important question.",
  openGraph: {
    title: "Lovely — A little place for love",
    description:
      "Someone has something for you... A little website, a lot of love.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${jakarta.variable} ${caveat.variable}`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
