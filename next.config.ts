import type { NextConfig } from "next";

// 静的書き出し(サーバーなし)。写真・カルテ回答を受け取るサーバーを構造的に持たない。
// GitHub Pagesのサブパス配信時は環境変数で基底パスを指定する:
//   NEXT_PUBLIC_BASE_PATH=/photo-contest-monosashi npm run build
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
