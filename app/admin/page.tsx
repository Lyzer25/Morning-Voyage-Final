import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SheetsTestPanel from "@/components/admin/sheets-test-panel"
import AutoSyncManager from "@/components/admin/auto-sync-manager"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1EB] via-white to-[#E7CFC7]">
      <Header />

      <main className="relative overflow-hidden pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-[#4B2E2E] mb-4">Admin Dashboard</h1>
              <p className="text-xl text-[#6E6658] font-light">
                Automated product management with Google Sheets integration
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <AutoSyncManager />
              <SheetsTestPanel />
            </div>

            {/* Info Panel */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-bold text-blue-800 mb-4">🚀 How It Works</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <h4 className="font-semibold mb-2">For End Users:</h4>
                  <ul className="space-y-1">
                    <li>• Products served from cache (super fast!)</li>
                    <li>• No Google Sheets API calls</li>
                    <li>• No rate limits or costs</li>
                    <li>• Always available</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">For Admins:</h4>
                  <ul className="space-y-1">
                    <li>• Auto-sync every 5 minutes</li>
                    <li>• Manual sync when needed</li>
                    <li>• Real-time status monitoring</li>
                    <li>• Google Sheets as single source of truth</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
