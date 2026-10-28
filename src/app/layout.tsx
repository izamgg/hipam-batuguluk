import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HIPAM Batuguluk Foundation",
  description: "Sistem Pengelolaan & Kwitansi Pembayaran Air Bersih",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
