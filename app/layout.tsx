import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AmplifyProvider } from "@/components/AmplifyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ERMS — Employee Record Management System",
  description: "Secure, cloud-based HR management platform powered by AWS Amplify",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
