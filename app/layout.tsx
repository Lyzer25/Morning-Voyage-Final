import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Morning Voyage - Premium Coffee Delivered Fresh',
  description:
    'Discover exceptional coffee blends and single-origin beans from Morning Voyage. Fresh roasted, ethically sourced, and delivered to your door. Start your coffee journey today.',
  keywords:
    'coffee, specialty coffee, fresh roasted, single origin, coffee beans, coffee subscription, premium coffee, artisan coffee',
  authors: [{ name: 'Morning Voyage' }],
  creator: 'Morning Voyage',
  publisher: 'Morning Voyage',
  openGraph: {
    title: 'Morning Voyage - Premium Coffee Delivered Fresh',
    description:
      'Discover exceptional coffee blends and single-origin beans from Morning Voyage. Fresh roasted, ethically sourced, and delivered to your door.',
    url: 'https://morningvoyage.co',
    siteName: 'Morning Voyage',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Morning Voyage - Premium Coffee',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Morning Voyage - Premium Coffee Delivered Fresh',
    description: 'Discover exceptional coffee blends and single-origin beans from Morning Voyage.',
    images: ['/twitter-image.jpg'],
    creator: '@morningvoyage',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
