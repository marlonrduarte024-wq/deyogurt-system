import "./globals.css";
import Sidebar from "./sidebar";
import AuthGuard from "./auth-guard";

export default function RootLayout({ children }) {

  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-900 min-h-screen flex">

        <AuthGuard>

          <Sidebar />

          <main className="flex-1 flex flex-col">

            <div className="bg-white border-b px-4 py-3 shadow-sm flex items-center justify-center gap-3">

              <img
                src="/logo.png"
                alt="logo deyogurt"
                className="h-15"
              />

              <h1 className="font-semibold text-lg">
                 DeYogurt
              </h1>

            </div>

            <div className="flex-1 p-4">

              <div className="bg-white rounded-xl shadow-md p-5">
                {children}
              </div>

            </div>

            <footer className="text-center text-sm text-gray-500 pb-4">
              Desarrollado para <span className="font-semibold">DEYOGURT BY Marlon Duarte-2026</span>
            </footer>

          </main>

        </AuthGuard>

      </body>
    </html>
  );
}