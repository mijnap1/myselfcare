import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import { THEME_STORAGE_KEY } from "@/lib/journal/constants";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// A round geometric face for titles and numbers; Pretendard carries the body text and Hangul.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "My Self Care",
  description: "스킨, 바디, 스타일 기록을 한곳에 정리하는 퍼스널 셀프케어 저널",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%23ffb547'/%3E%3C/svg%3E",
  },
};

// Applies the saved theme (light unless dark was chosen) before first paint, so nothing flashes.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})==="dark"?"dark":"light"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      data-theme="light"
      className={outfit.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
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
