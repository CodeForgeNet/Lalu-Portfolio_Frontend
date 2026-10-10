import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/portfolio/Footer";
import { profile } from "@/data/portfolio";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(profile.url),
  title: {
    default: `${profile.name} | ${profile.role}`,
    template: `%s | ${profile.name}`,
  },
  description: profile.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Lalu Kumar — Applied AI Systems Lab",
    title: `${profile.name} | ${profile.role}`,
    description: profile.description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | ${profile.role}`,
    description: profile.description,
    images: ["/opengraph-image"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: profile.url,
    sameAs: [profile.github, profile.linkedin],
  };
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
