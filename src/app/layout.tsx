import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KamKarOAI — AI automation with your own keys",
  description: "Build multi-step AI workflows with OpenAI, Anthropic and Google models using your own API keys.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
