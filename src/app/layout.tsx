import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "./context/cart-context"
import { AuthProvider } from "./context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// Font setup
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
})

// Metadata
export const metadata: Metadata = {
  title: {
    default: "Morning Voyage | Premium Coffee",
    template: "%s | Morning Voyage",
  },
  description: "Premium coffee products, subscriptions, and merchandise delivered to your doorstep.",
  keywords: ["coffee", "premium coffee", "coffee subscription", "specialty coffee"],
  authors: [{ name: "Morning Voyage" }],
  creator: "Morning Voyage",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://morningvoyage.co",
    siteName: "Morning Voyage",
    title: "Morning Voyage | Premium Coffee",
    description: "Premium coffee products, subscriptions, and merchandise delivered to your doorstep.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Morning Voyage Premium Coffee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Morning Voyage | Premium Coffee",
    description: "Premium coffee products, subscriptions, and merchandise delivered to your doorstep.",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-coffee-dark antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
