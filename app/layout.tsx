import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import ToasterProvider from "@/providers/ToasterProvider";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolaMint",
  description: "Created By Ashmeet Singh Monga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToasterProvider />
        <div className="w-screen h-screen flex justify-center items-center">
          <Card className="w-[500px] h-4/6 flex flex-col">
            <Link href="/">
              <CardTitle className="text-6xl font-black text-center pt-8">SolaMint</CardTitle>
            </Link>
            <CardContent className="mt-6 w-full flex-grow">{children}</CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
