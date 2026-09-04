import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "写真コンテストものさし｜この一枚をどこへ出せるか";
const description =
  "写真の条件から世界のフォトコンテストを照合し、ハッシュタグ投稿や編集部キュレーションの入口も整理。未確認条件と公式ページを明示します。";

// 公開URL決定後に差し替える(独自サブドメイン or GitHub Pages)。
// 静的書き出しでは実行時のリクエスト情報を使えないため固定値で持つ。
const siteOrigin = "https://aratama-ship-it.github.io/photo-contest-monosashi";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f0eadb",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  applicationName: "写真コンテストものさし",
  icons: { icon: `${siteOrigin}/favicon.svg`, apple: `${siteOrigin}/apple-touch-icon.png` },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    title,
    description,
    images: [{ url: `${siteOrigin}/og.png`, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteOrigin}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
