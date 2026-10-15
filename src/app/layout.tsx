import type { Metadata } from "next";
import { Noto_Sans_KR, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { THEME_STORAGE_KEY } from "@/lib/journal/constants";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const notoKr = Noto_Sans_KR({
  weight: ["400", "500", "700", "800"],
  variable: "--font-noto-kr",
  preload: false,
});

export const metadata: Metadata = {
  title: "My Self Care",
  description: "스킨, 바디, 스타일 기록을 한곳에 정리하는 퍼스널 셀프케어 저널",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='24' fill='%2322262b'/%3E%3C/svg%3E",
  },
};

// Applies the saved theme before first paint so there's no light/dark flash.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})==="light"?"light":"dark"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      data-theme="dark"
      className={`${jakarta.variable} ${notoKr.variable}`}
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
