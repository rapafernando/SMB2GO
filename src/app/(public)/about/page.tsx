import React from "react";
import { db } from "@/lib/db";
import { Award, ShieldCheck, CheckCircle2, Calendar } from "lucide-react";

async function getAboutData() {
  try {
    const about = await db.aboutSection.findFirst();
    if (about) return about;
    throw new Error("No about section found");
  } catch (error) {
    console.warn("Database connection failed, using fallback static data for About page.");
    return {
      bio: "At Apex Tax & Notary Services, we believe that professional financial and legal support should be accessible, accurate, and stress-free. Founded by a veteran tax preparer and certified loan signing agent, we specialize in helping individuals and small businesses manage tax filings and verify legal documentation with absolute precision. We pride ourselves on attention to detail, confidentiality, and exceptional customer service.",
      credentials: [
        "IRS Registered Tax Return Preparer (RTRP)",
        "Certified Mobile Loan Signing Agent",
        "Licensed, Bonded & Commissioned Notary Public",
        "Active Member of the National Notary Association (NNA)"
      ],
      experience: "Serving the local community with over 12 years of professional financial and notary services.",
    };
  }
}

export default async function AboutPage() {
  const about = await getAboutData();

  return (
    <div className="bg-slate-50 py-16 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            About Us & Credentials
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Learn more about our qualifications, experience, and commitment to you.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3">
          {/* Left Column (Highlight & Trust signals) */}
          <div className="bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between">
            <div>
              <div className="inline-flex p-3 bg-blue-500/10 border border-blue-400/20 rounded-xl text-blue-400 mb-6">
                <Award className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Integrity</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                We handle every tax return and notary request with complete confidentiality and precision.
              </p>
            </div>
            <div className="border-t border-slate-800 pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Established 2014
                </span>
              </div>
            </div>
          </div>

          {/* Right Columns (Bio & Credentials) */}
          <div className="md:col-span-2 p-8 md:p-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Professional Bio</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              {about.bio}
            </p>

            <h3 className="text-xl font-bold text-slate-900 mb-4">Credentials & Certifications</h3>
            <ul className="space-y-3 mb-8">
              {about.credentials.map((cred, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 text-sm">{cred}</span>
                </li>
              ))}
            </ul>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-xs text-slate-500">
                {about.experience}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
