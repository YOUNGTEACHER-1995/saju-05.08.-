import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "운수좋은 웹 - AI 사주풀이",
  description: "현대적이고 위로가 되는 AI 사주풀이 서비스입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
