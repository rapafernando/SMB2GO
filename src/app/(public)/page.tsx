import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Shield, FileText, CheckCircle2, ChevronRight, Users, Clock, Star } from "lucide-react";

async function getServicesOverview() {
  try {
    return await db.service.findMany({
      take: 4,
    });
  } catch (error) {
    console.warn("Database connection failed, using fallback static data for homepage services.");
    return [
      {
        id: "1",
        name: "Individual Tax Preparation",
        description: "Professional preparation and electronic filing of federal and state income tax returns. We optimize deductions and credits.",
        type: "TAX",
      },
      {
        id: "2",
        name: "Business Tax Preparation",
        description: "Comprehensive tax compliance, schedule C, and corporate tax filings. Extensible for LLCs, S-Corps, and partnerships.",
        type: "TAX",
      },
      {
        id: "3",
        name: "General Notary Public",
        description: "Official witness and notarization of affidavits, power of attorney, contracts, deeds, and other legal documents.",
        type: "NOTARY",
      },
      {
        id: "4",
        name: "Mobile Loan Signing Agent",
        description: "Certified loan signing services for mortgage loans, refinancing, HELOCs, and seller packages. We travel to your location.",
        type: "NOTARY",
      },
    ];
  }
}

export default async function HomePage() {
  const services = await getServicesOverview();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Shield className="h-4 w-4" /> Trusted Tax & Notary Experts
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Stress-Free Tax Prep & <br />
            <span className="text-blue-400">Certified Notary Services</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 font-light">
            Providing small businesses and individuals with accurate, reliable, and convenient tax filing and legal document notarization. Bonded, insured, and IRS registered.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all gap-2"
            >
              Get In Touch <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Accurate & On-Time</h3>
              <p className="text-sm text-slate-500">We guarantee meticulous attention to detail to avoid errors, delay, or audits.</p>
            </div>
            <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">12+ Years Experience</h3>
              <p className="text-sm text-slate-500">Professional expertise in federal/state tax rules and real estate signings.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Licensed, Bonded & Insured</h3>
              <p className="text-sm text-slate-500">Fully verified and certified to notarize documents and file returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Our Core Services
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Reliable, professional support tailored to your unique personal or business requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 mb-4">
                    {service.type === "TAX" ? "Tax Service" : "Notary Service"}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <span className="text-xs text-slate-400">Professional Consultation Available</span>
                  <Link
                    href="/services"
                    className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-sm transition-colors"
            >
              View Full Service Details
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials or Trust Signals */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">What Our Clients Say</h2>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
            <div className="flex gap-1 text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <blockquote className="text-lg text-slate-700 italic leading-relaxed mb-6">
              "Working with Apex Tax & Notary was a breeze. They handled both my business tax return and notarized our lease agreement in one go. Extremely professional, quick, and saved us thousands in potential tax errors. Highly recommended!"
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                MK
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Marcus K.</p>
                <p className="text-xs text-slate-500">Local Small Business Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 font-light">
            Contact us today for a free tax estimate or to schedule your notary public signing.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-lg shadow-lg transition-all"
          >
            Contact & Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
