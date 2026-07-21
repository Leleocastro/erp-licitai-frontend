import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Licitai",
  description: "Sistema de gestão governamental",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
