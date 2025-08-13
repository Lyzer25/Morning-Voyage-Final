export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header for login page */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <a href="/" className="text-xl font-bold text-gray-900">
            Morning Voyage
          </a>
        </div>
      </header>
      
      <main>{children}</main>
    </div>
  );
}
