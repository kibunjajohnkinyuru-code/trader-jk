import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trader JK",
  description: "Deriv Digit Analysis Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
      }
