import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNA Global & UNAP | SDG Impact Dashboard",
  description: "Official SDG Tracking, Global Summits, and National Impact Awards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        {/* Sky Blue Header Bar */}
        <header className="bg-[#1abc9c]  sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#15d8e6] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-md">
                UNAP
              </div>
              {/* <div className="flex items-center gap-3">
  <img
    src="/images/UNAP_LOGO.png"
    alt="UNAP Logo"
    className="w-10 h-10 rounded-full object-cover shadow-md"
  />
</div> */}
              <div>
                <h1 className="text-base font-bold text-[#154c8d] tracking-tight leading-none">
                  UNA GLOBAL
                </h1>
                <p className="text-[11px] font-semibold text-[#ffffff] tracking-wider uppercase mt-0.5">
                  United Nations Association of the Philippines
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex text-xs px-3.5 py-1.5 rounded-full bg-sky-50 text-[#154c8d] font-bold border border-sky-100">
                Launch Target: October 5, 2026
              </span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 w-full">{children}</main>

        {/* Footer */}
        <footer className="bg-[#1abc9c] py-8 px-6 text-center text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white">
              © 2026 United Nations Association of the Philippines (UNAP) & UNA Global. All rights reserved.
            </p>
            <p className="text-white">
              {/* Data synchronized with Statista & Kaggle Global SDG Repositories. */}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}