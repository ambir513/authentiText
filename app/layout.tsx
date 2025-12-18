import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CheckInternetWrapper } from "@/components/utils/check-internet-wrapper";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "AuthentiText",
  description: "AI-powered content authenticity verification",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <CheckInternetWrapper>{children}</CheckInternetWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
