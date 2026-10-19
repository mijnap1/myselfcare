import type { Metadata } from "next";
import { Courier_Prime, Homemade_Apple, Nanum_Gothic_Coding } from "next/font/google";
import Script from "next/script";
import { SkyClock } from "@/components/SkyClock";
import { THEME_STORAGE_KEY } from "@/lib/journal/constants";
import { getSkyPeriod } from "@/lib/sky";
import "./globals.css";

// Typewriter text, with a monospaced Korean face so Hangul keeps the same rhythm.
const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-courier",
});

const nanumCoding = Nanum_Gothic_Coding({
  weight: ["400", "700"],
  variable: "--font-nanum-coding",
  preload: false,
});

// The handwritten "Self" in the title.
const homemadeApple = Homemade_Apple({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pen",
});

export const metadata: Metadata = {
  title: "My Self Care",
  description: "스킨, 바디, 스타일 기록을 한곳에 정리하는 퍼스널 셀프케어 저널",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%2322262b'/%3E%3C/svg%3E",
  },
};

// Applies the saved theme and the time of day's sky before first paint, so nothing flashes.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})==="light"?"light":"dark"}catch(e){}document.documentElement.dataset.sky=(${getSkyPeriod.toString()})(new Date().getHours());`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      data-theme="dark"
      className={`${courier.variable} ${nanumCoding.variable} ${homemadeApple.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SkyClock />
        {children}
        <Script
          type="module"
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
