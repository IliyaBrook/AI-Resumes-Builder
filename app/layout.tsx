import React from "react"
import Header from "./(home)/_components/common/Header"
import type { Metadata } from "next";
import { Urbanist, Open_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/context/query-provider";

const urbanist = Urbanist({ subsets: ["latin"] });
const open_sans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open_sans",
});

export const metadata: Metadata = {
  title: "CVBuild.ai",
  description: "Generated by create next app",
};

const MainLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en">
      <body className={cn("bg-background", open_sans.variable, urbanist.className)}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="w-full h-auto min-h-screen !bg-[#f8f8f8] dark:!bg-background">
              <Header />
              <div>{children}</div>
            </div>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

export default MainLayout
