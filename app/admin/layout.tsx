import type React from "react"
import type { Metadata } from "next"
import AdminHeader from "@/components/admin/admin-header"

// CRITICAL FIX: Make admin layout fully dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "Morning Voyage Admin",
  description: "Manage your Morning Voyage products and sales.",
  robots: "noindex, nofollow" // Prevent admin from being indexed
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
