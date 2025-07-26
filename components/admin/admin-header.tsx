import { Coffee } from "lucide-react"
import Link from "next/link"

export default function AdminHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-[#4B2E2E]" />
            <span className="font-bold text-lg text-[#4B2E2E]">Morning Voyage Admin</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
