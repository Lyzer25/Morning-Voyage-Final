import Link from "next/link"
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#D5BFA3] rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#9E7C83] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D5BFA3] to-[#9E7C83] rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-[#4B2E2E] font-bold text-xl">M</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4B2E2E] rounded-full"></div>
                </div>
                <div>
                  <span className="text-white font-bold text-2xl tracking-tight">Morning Voyage</span>
                  <div className="text-xs text-gray-400 font-medium tracking-wider uppercase">Premium Coffee</div>
                </div>
              </div>

              <p className="text-gray-400 leading-relaxed font-light max-w-md">
                Freshly roasted coffee and premium fashion, crafted with intention and delivered with care. Experience
                the difference of quality that never sits on shelves.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">hello@morningvoyage.co</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">1-800-MORNING</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  { icon: Instagram, href: "https://www.instagram.com/morningvoyage.co", label: "Instagram" },
                  { icon: Facebook, href: "https://www.facebook.com/share/1ARzCwokBj/", label: "Facebook" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Youtube, href: "#", label: "YouTube" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#D5BFA3] transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Products</h3>
              <ul className="space-y-3">
                {[
                  "Coffee Blends",
                  "Single Origins",
                  "Decaf Options",
                  "Coffee Bundles",
                  "Fashion Line",
                  "Accessories",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors font-light hover:translate-x-1 inline-block transition-transform duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Company</h3>
              <ul className="space-y-3">
                {["About Us", "Our Story", "Sustainability", "Careers", "Press Kit", "Blog"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors font-light hover:translate-x-1 inline-block transition-transform duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
              <ul className="space-y-3">
                {["Help Center", "Shipping Info", "Returns", "Size Guide", "Brewing Guide", "Contact Us"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors font-light hover:translate-x-1 inline-block transition-transform duration-300"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm font-light">
              © 2024 Morning Voyage. All rights reserved. Made with ☕ in San Francisco.
            </p>
            <div className="flex space-x-8">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors font-light"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
