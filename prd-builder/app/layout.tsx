import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "אפיון אתר | Website Characterization",
  description: "מערכת אפיון אתרים מקצועית",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{var t=localStorage.getItem('prd-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.setAttribute('data-theme','light')}}catch(e){}})()`}</Script>
      </head>
      <body>
        {/* Background orbs */}
        <div
          className="orb"
          style={{ width: 600, height: 600, top: -100, right: -200, background: "var(--orb-1)" }}
        />
        <div
          className="orb"
          style={{ width: 500, height: 500, bottom: -100, left: -150, background: "var(--orb-2)" }}
        />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
