import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "写真コンテストものさし｜この一枚をどこへ出せるか";
const description =
  "写真の条件を一度入力すると、応募できそうなフォトコンテストと要確認点を整理。過去の入賞作は転載せず、公式ギャラリーの傾向メモとともに案内します。";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f0eadb",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const imageUrl = `${origin}/og.png`;

  return {
    title,
    description,
    applicationName: "写真コンテストものさし",
    openGraph: {
      type: "website",
      locale: "ja_JP",
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

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
