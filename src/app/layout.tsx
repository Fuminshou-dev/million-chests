import type { Metadata } from "next";
import { Inter, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
const scrollbar = "scrollbar-hide";
const Patrick = Patrick_Hand({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Funny Chests",
  description: "A million chests project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="business" className={scrollbar}>
      <body className={Patrick.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
