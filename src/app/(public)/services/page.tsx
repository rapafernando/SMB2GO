import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ShieldCheck, FileText, Landmark, Clock, ArrowRight } from "lucide-react";

async function getServices() {
  try {
    return await db.service.findMany({
      orderBy: { type: "asc" },
    });
  } catch (error) {
    console.warn("Database connection failed, falling back to static services.");
    return [
      {
        id: "1",
        name: "Individual Tax Preparation",
        description: "Professional preparation and electronic filing of federal and state income tax returns. We check for over 350 deductions and credits to optimize your return.",
        price: 150.00,
        type: "TAX",
      },
      {
        id: "2",
        name: "Business Tax Preparation",
        description: "Comprehensive tax services for sole proprietorships, LLCs, S-Corporations, and partnerships. Includes schedule C preparation, deductions optimization, and compliance guidance.",
        price: 350.00,
        type: "TAX",
      },
      {
        id: "3",
        name: "General Notary Public Services",
        description: "Official witness and notarization of legal documents including affidavits, power of attorney, deeds, wills, contracts, and travel consent forms.",
        price: 15.00,
        type: "NOTARY",
      },
      {
        id: "4",
        name: "Mobile Loan Signing Agent",
        description: "Certified notary services for mortgage loans, refinancing, home equity lines of credit (HELOC), and seller packets. We travel to your preferred location.",
        price: 125.00,
        type: "NOTARY",
      },
    ];
  }
}

export default async function ServicesPage() {
  const services = await getServices();
  
  const taxServices = services.filter((s) => s.type === "TAX");
  const notaryServices = services.filter((s) => s.type === "NOTARY");

  return (
    <div className="bg-slate-50 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Our Services & Rates
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Transparent pricing with no hidden fees. Select from our expert tax prep and professional notary services.
          </p>
        </div>

        {/* Tax Preparation Services */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200">
            <FileText className="h-7 w-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-950">Tax Preparation & Consulting</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {taxServices.map((service) => (
              <div
                key={service.id}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                    {service.price && (
                      <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                        Starts at ${service.price}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                  <span>IRS Authorized E-File Provider</span>
                  <Link
                    href="/contact"
                    className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Inquire <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notary Public Services */}
        <div>
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200">
            <ShieldCheck className="h-7 w-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-950">Notary Public & Loan Signing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {notaryServices.map((service) => (
              <div
                key={service.id}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                    {service.price && (
                      <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                        {service.name.includes("Signing") ? `Starts at $${service.price}` : `$${service.price} per signature`}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                  <span>Licensed, Bonded & Commissioned</span>
                  <Link
                    href="/contact"
                    className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Inquire <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outro banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl text-white p-8 sm:p-12 shadow-md">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold mb-4">Need a Custom Service or Consultation?</h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
              If you have specialized accounting needs, multi-state tax returns, or volume notary requirements, we can arrange custom pricing tailored for you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-lg shadow-sm transition-colors text-sm sm:text-base"
            >
              Contact Us for a Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
