import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Madness Rumble Space",
  description: "A chaotic multiplayer card game set in space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-space-dark text-white antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
