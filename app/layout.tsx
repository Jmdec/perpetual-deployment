import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import CookieConsent from "@/components/cookie-consent"
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider"
import FloatingSocialMedia from "@/components/FloatingSocialMedia"
import Chatbot from "@/components/Chatbot"
import ScreenshotProtection from "@/components/ScreenshotProtection"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://pamplonatres-laspinas.vercel.app/"),
  
  title: {
    default: "Tau Gamma Phi | Perpetual Village Chapter Official Portal",
    template: "%s | Tau Gamma Phi"
  },
  
  description: "Official digital platform of Tau Gamma Phi - Perpetual Village Chapter, Las Piñas City. Connect with the brotherhood, access chapter updates, events, and member resources. Triskelion pride and service.",
  
  keywords: [
    "Tau Gamma Phi",
    "Tau Gamma",
    "Triskelion",
    "Perpetual Village Chapter",
    "Las Piñas City",
    "Metro Manila fraternity",
    "brotherhood",
    "TGP",
    "Tau Gamma Phi Las Piñas",
    "fraternity chapter",
    "Triskelion brotherhood",
    "Philippine fraternity",
    "NCR chapter",
    "community service",
    "brotherhood organization"
  ],
  
  authors: [{ name: "Tau Gamma Phi - Perpetual Village Chapter" }],
  creator: "Tau Gamma Phi - Perpetual Village Chapter",
  publisher: "Tau Gamma Phi, Perpetual Village Chapter, Las Piñas City",
  generator: "Next.js",
  applicationName: "Tau Gamma Phi Portal",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  
  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://pamplonatres-laspinas.vercel.app/",
    title: "Tau Gamma Phi | Perpetual Village Chapter Official Portal",
    description: "Official digital platform of Tau Gamma Phi - Perpetual Village Chapter, Las Piñas City. Connect with the brotherhood and stay updated on chapter events.",
    siteName: "Tau Gamma Phi - Perpetual Village",
    images: [
      {
        url: "https://pamplonatres-laspinas.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tau Gamma Phi - Perpetual Village Chapter Official Portal",
      },
    ],
    countryName: "Philippines",
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Tau Gamma Phi | Perpetual Village Chapter Official Portal",
    description: "Official digital platform of Tau Gamma Phi - Perpetual Village Chapter, Las Piñas City. Brotherhood updates, events, and member resources.",
    images: ["https://pamplonatres-laspinas.vercel.app/twitter-image.png"],
    creator: "@TGPPerpetualLP",
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TGP Perpetual Village",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px)"
      }
    ]
  },

  // Icons
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon512_rounded.png",
        sizes: "512x512",
        type: "image/png",
      }
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/icon512_rounded.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/icon512_rounded.png",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  
  alternates: {
    canonical: "https://pamplonatres-laspinas.vercel.app/",
    languages: {
      "en-PH": "https://pamplonatres-laspinas.vercel.app/",
      "fil-PH": "https://pamplonatres-laspinas.vercel.app/fil",
    },
  },
  
  category: "organization",
  
  // Additional metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ea580c" },
    { media: "(prefers-color-scheme: dark)", color: "#dc2626" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://pamplonatres-laspinas.vercel.app/#organization",
    "name": "Tau Gamma Phi - Perpetual Village Chapter",
    "alternateName": "TGP Perpetual Village",
    "url": "https://pamplonatres-laspinas.vercel.app/",
    "logo": "https://pamplonatres-laspinas.vercel.app/icon512_rounded.png",
    "description": "Official chapter of Tau Gamma Phi fraternity in Perpetual Village, Las Piñas City, Metro Manila. A brotherhood dedicated to service, excellence, and camaraderie.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Perpetual Village",
      "addressLocality": "Las Piñas City",
      "addressRegion": "Metro Manila",
      "postalCode": "1747",
      "addressCountry": "PH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.4611",
      "longitude": "120.9845"
    },
    "telephone": "+63-2-XXXX-XXXX",
    "areaServed": {
      "@type": "Place",
      "name": "Perpetual Village, Las Piñas City"
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Tau Gamma Phi International",
      "url": "https://taugammaphi.org"
    },
    "sameAs": [
      "https://www.facebook.com/TGPPerpetualVillage",
      "https://twitter.com/TGPPerpetualLP"
    ]
  }

  // LocalBusiness Schema for better local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "CivicStructure",
    "@id": "https://pamplonatres-laspinas.vercel.app/#location",
    "name": "Tau Gamma Phi - Perpetual Village Chapter House",
    "image": "https://pamplonatres-laspinas.vercel.app/og-image.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Perpetual Village",
      "addressLocality": "Las Piñas City",
      "addressRegion": "Metro Manila",
      "postalCode": "1747",
      "addressCountry": "Philippines"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.4611",
      "longitude": "120.9845"
    },
    "url": "https://pamplonatres-laspinas.vercel.app/",
    "telephone": "+63-2-XXXX-XXXX"
  }

  // WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://pamplonatres-laspinas.vercel.app/#website",
    "url": "https://pamplonatres-laspinas.vercel.app/",
    "name": "Tau Gamma Phi - Perpetual Village Portal",
    "description": "Official Portal of Tau Gamma Phi - Perpetual Village Chapter, Las Piñas City",
    "inLanguage": "en-PH",
    "publisher": {
      "@id": "https://pamplonatres-laspinas.vercel.app/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://pamplonatres-laspinas.vercel.app/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Metro Manila",
        "item": "https://en.wikipedia.org/wiki/Metro_Manila"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Las Piñas City",
        "item": "https://laspinascity.gov.ph"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Tau Gamma Phi - Perpetual Village",
        "item": "https://pamplonatres-laspinas.vercel.app/"
      }
    ]
  }

  return (
    <html lang="en-PH">
      <head>
        {/* Primary Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Location Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        
        {/* Open Graph Image Tags */}
        <meta property="og:image" content="https://pamplonatres-laspinas.vercel.app/og-image.png" />
        <meta property="og:image:secure_url" content="https://pamplonatres-laspinas.vercel.app/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Tau Gamma Phi - Perpetual Village Chapter" />
        
        {/* Twitter Card Image */}
        <meta name="twitter:image" content="https://pamplonatres-laspinas.vercel.app/twitter-image.png" />
        <meta name="twitter:image:alt" content="Tau Gamma Phi Portal" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Geographic meta tags - Las Piñas City coordinates */}
        <meta name="geo.region" content="PH-NCR" />
        <meta name="geo.placename" content="Perpetual Village, Las Piñas City" />
        <meta name="geo.position" content="14.4611;120.9845" />
        <meta name="ICBM" content="14.4611, 120.9845" />
        
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        
        {/* Location meta */}
        <meta property="place:location:latitude" content="14.4611" />
        <meta property="place:location:longitude" content="120.9845" />
        <meta name="coverage" content="Perpetual Village, Las Piñas City, Metro Manila, Philippines" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://pamplonatres-laspinas.vercel.app/" />
        
        {/* Alternative languages */}
        <link rel="alternate" hrefLang="en-ph" href="https://pamplonatres-laspinas.vercel.app/" />
        <link rel="alternate" hrefLang="fil-ph" href="https://pamplonatres-laspinas.vercel.app/fil" />
        <link rel="alternate" hrefLang="x-default" href="https://pamplonatres-laspinas.vercel.app/" />
      </head>
      <body className={`${geist.className} antialiased bg-gradient-to-br from-red-50 via-orange-50 to-green-50`}>
        <ScreenshotProtection />
        <ServiceWorkerProvider />
        {children}
        <Toaster />
        <CookieConsent />
        <Chatbot />
        <FloatingSocialMedia />
      </body>
    </html>
  )
}