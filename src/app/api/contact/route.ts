import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  let name = "";
  let email = "";
  let phone = "";
  let message = "";

  try {
    const body = await req.json();
    name = body.name;
    email = body.email;
    phone = body.phone;
    message = body.message;
    const honeypot = body.website; // Hidden honeypot field

    // Check honeypot for spam protection
    if (honeypot) {
      console.warn("Spam detected: Honeypot field filled in.", { honeypot });
      return NextResponse.json(
        { error: "Spam detected." },
        { status: 400 }
      );
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Direct lookup by slug as guaranteed by seed script
    const business = await db.business.findUnique({
      where: { slug: "tax-notary-demo" },
    });

    if (!business) {
      throw new Error("Business 'tax-notary-demo' not found in database.");
    }

    const savedSubmission = await db.contactSubmission.create({
      data: {
        businessId: business.id,
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry submitted successfully.",
        data: { id: savedSubmission.id },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API contact error:", error);

    // Fallback: Write the submission to a local log file if it's a database failure
    // Only attempt this if we have parsed the form successfully
    if (name && email && message) {
      try {
        const logDir = path.join(process.cwd(), "logs");
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logFile = path.join(logDir, "contact_fallback.jsonl");
        const logEntry = JSON.stringify({
          timestamp: new Date().toISOString(),
          name,
          email,
          phone: phone || null,
          message,
          error: error.message || "Unknown error",
        });
        
        fs.appendFileSync(logFile, logEntry + "\n", "utf-8");
        console.warn(`Saved fallback contact inquiry to file: ${logFile}`);
      } catch (logError) {
        console.error("Failed to write to fallback contact log file:", logError);
      }
    }

    return NextResponse.json(
      {
        error: "We could not save your message. Please try again, email info@apextaxnotary.com, or call (555) 019-2834 directly.",
      },
      { status: 500 }
    );
  }
}
