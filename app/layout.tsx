import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Merc Deck Madness",
  description: "A chaotic multiplayer card game set in space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-space-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
