import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TAIHONG Ops",
  description: "Order tracking and workshop operations for custom food trucks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
