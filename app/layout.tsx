import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesOS",
  description: "Vertriebsprozess-OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="min-h-screen bg-bg text-zinc-100 antialiased">
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[600px] bg-radial-fade" />
        {children}
      </body>
    </html>
  );
}
