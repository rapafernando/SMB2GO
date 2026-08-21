import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    let savedSubmission = null;
    let dbStatus = "saved";

    try {
      // Find the default business
      let business = await db.business.findFirst({
        where: { slug: "tax-notary-demo" },
      });

      // If no business exists (e.g., first run), create one
      if (!business) {
        business = await db.business.findFirst();
      }

      if (!business) {
        business = await db.business.create({
          data: {
            name: "Apex Tax & Notary Services",
            slug: "tax-notary-demo",
          },
        });
      }

      savedSubmission = await db.contactSubmission.create({
        data: {
          businessId: business.id,
          name,
          email,
          phone: phone || null,
          message,
        },
      });
    } catch (dbError) {
      console.warn("Database save failed. Logging submission to console instead:", dbError);
      console.log("=== OFFLINE CONTACT SUBMISSION ===");
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Phone: ${phone}`);
      console.log(`Message: ${message}`);
      console.log("==================================");
      dbStatus = "mocked";
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inquiry submitted successfully.",
        status: dbStatus,
        data: savedSubmission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API contact error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
