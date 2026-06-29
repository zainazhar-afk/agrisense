import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/common/Footer";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "@/components/system/AppProviders";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "AgriSense | Digital tools for Pakistani farmers",
  description:
    "Crop disease detection, multilingual farmer assistance, and community field updates in one workflow.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${manrope.variable} ${sora.variable} app-shell font-sans antialiased`}>
        <AppProviders>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
