import React from "react";
import Link from "next/link";
import { FileText, Phone, ShieldCheck } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
              Apex Tax & Notary
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-white mb-4">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-lg tracking-tight">Apex Tax & Notary Services</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm mb-4">
                Professional tax preparation and notary public services. Bonded, insured, and committed to absolute accuracy.
              </p>
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Apex Tax & Notary Services. All rights reserved.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact & Location</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>(555) 019-2834</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span>info@apextaxnotary.com</span>
                </li>
                <li className="text-xs text-slate-500 mt-2">
                  123 Main Street, Suite 400<br />
                  Los Angeles, CA 90012
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
