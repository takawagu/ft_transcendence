import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { PresenceProvider } from "@/lib/presence";
import { RoomInviteToast } from "@/lib/invite-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "4ITO",
  description: "数字を言葉で表現し合う、緊迫の協力型カードゲーム",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* ログイン状態と /presence 接続はページ遷移をまたいで維持する（docs/dm-requirements.md セクション4） */}
        <SessionProvider>
          <PresenceProvider>
            {children}
            {/* ルーム招待はどの画面に居ても気づけるようにする（docs/room-invite-requirements.md セクション4-b） */}
            <RoomInviteToast />
          </PresenceProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
