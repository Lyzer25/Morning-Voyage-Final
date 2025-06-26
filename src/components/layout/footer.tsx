import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-coffee-dark text-cream">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <Image src="/images/logo-light.svg" alt="Morning Voyage" width={40} height={40} className="h-10 w-auto" />
              <span className="ml-2 font-serif text-xl font-bold text-cream">Morning Voyage</span>
            </Link>
            <p className="mt-4 text-sm text-cream/80">
              Premium coffee products, subscriptions, and merchandise delivered to your doorstep.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/80 transition-colors hover:text-gold"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/80 transition-colors hover:text-gold"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/80 transition-colors hover:text-gold"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/shop" className="text-cream/80 transition-colors hover:text-gold">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop/coffee" className="text-cream/80 transition-colors hover:text-gold">
                  Coffee Beans
                </Link>
              </li>
              <li>
                <Link href="/shop/equipment" className="text-cream/80 transition-colors hover:text-gold">
                  Equipment
                </Link>
              </li>
              <li>
                <Link href="/shop/merchandise" className="text-cream/80 transition-colors hover:text-gold">
                  Merchandise
                </Link>
              </li>
              <li>
                <Link href="/shop/gift-cards" className="text-cream/80 transition-colors hover:text-gold">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-cream/80 transition-colors hover:text-gold">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-cream/80 transition-colors hover:text-gold">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="text-cream/80 transition-colors hover:text-gold">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-cream/80 transition-colors hover:text-gold">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-cream/80 transition-colors hover:text-gold">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Help</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/faq" className="text-cream/80 transition-colors hover:text-gold">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-cream/80 transition-colors hover:text-gold">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-cream/80 transition-colors hover:text-gold">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-cream/80 transition-colors hover:text-gold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-cream/80 transition-colors hover:text-gold">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/20 pt-8">
          <p className="text-center text-sm text-cream/60">
            &copy; {new Date().getFullYear()} Morning Voyage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
