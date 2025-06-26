"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface NavItem {
  name: string
  href: string
}

interface MobileMenuProps {
  isOpen: boolean
  navItems: NavItem[]
}

export default function MobileMenu({ isOpen, navItems }: MobileMenuProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden"
        >
          <div className="border-t border-gray-200 bg-white px-4 py-2">
            <nav className="flex flex-col space-y-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "py-2 text-base font-medium transition-colors",
                    pathname === item.href ? "text-coffee-dark" : "text-coffee-medium hover:text-coffee-dark",
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4">
                <Link
                  href="/login"
                  className="block w-full rounded-md bg-coffee-dark py-2 text-center font-medium text-cream"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="mt-2 block w-full rounded-md border border-coffee-dark py-2 text-center font-medium text-coffee-dark"
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
