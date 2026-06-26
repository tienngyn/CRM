import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "SalesOS",
  description: "Vertriebsprozess-OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark" data-theme="crimson" suppressHydrationWarning>
      <head>
        {/* Apply saved appearance prefs before paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg text-zinc-100 antialiased">
        <div className="decorative pointer-events-none fixed inset-x-0 top-0 -z-10 h-[600px] bg-radial-fade" />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
