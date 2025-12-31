import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CountriesController } from "@/server/controllers/countries.controller";
import { OrganizationsController } from "@/server/controllers/organizations.controller";
import {
  JsonLd,
  generateWebsiteSchema,
  generateOrganizationSchema,
} from "@/components/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: countries = [] }, { data: organizations = [] }] = await Promise.all([
    CountriesController.getAll(),
    OrganizationsController.listAll(),
  ]);

  const countryNames = countries.map((c) => c.name).join(", ");
  const orgNames = organizations.map((o) => o.name).join(", ");

  const description = `Lisez vos journaux et magazines africains préférés en illimité. Accédez à toute la presse de : ${countryNames}. Retrouvez les publications de : ${orgNames} et plus encore sur kioskfy.`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://kioskfy.com"),
    title: {
      default: "kioskfy - Votre kiosque numérique de presse africaine",
      template: "%s | kioskfy",
    },
    description,
    keywords: [
      "presse africaine",
      "journaux cameroun",
      "journaux côte d'ivoire",
      "actualités afrique",
      "kiosque numérique",
      "lecture en ligne",
      "abonnement presse",
      "kioskfy",
      ...countries.map((c) => `presse ${c.name.toLowerCase()}`),
      ...countries.map((c) => `journaux ${c.name.toLowerCase()}`),
      ...organizations.map((o) => o.name.toLowerCase()),
    ],
    authors: [{ name: "kioskfy" }],
    creator: "kioskfy",
    publisher: "kioskfy",
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: baseUrl,
      title: "kioskfy - Votre kiosque numérique de presse africaine",
      description,
      siteName: "kioskfy",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "kioskfy - Presse Africaine",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "kioskfy - Votre kiosque numérique de presse africaine",
      description,
      images: ["/og-image.jpg"],
      creator: "@kioskfy",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Generate global schemas
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Global JSON-LD Schemas */}
        <JsonLd data={websiteSchema} />
        <JsonLd data={organizationSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
