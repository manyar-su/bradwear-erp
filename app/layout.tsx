import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const ubuntuSans = Ubuntu({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ubuntuMono = Ubuntu({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Bradwear Dashboard",
  description: "Bradwear Dashboard untuk manajemen produksi garmen",
  icons: {
    icon: "/brand/logo-bradwear.png",
    apple: "/brand/logo-bradwear.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${ubuntuSans.variable} ${ubuntuMono.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
