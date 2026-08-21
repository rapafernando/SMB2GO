import { NextRequest, NextResponse } from "next/server";
import { getGoogleTokens } from "@/lib/calendar";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error parameter:", error);
    return new NextResponse(`OAuth failed: ${error}`, { status: 400 });
  }

  if (!code || !state) {
    return new NextResponse("Code or state missing.", { status: 400 });
  }

  // Verify CSRF state parameter
  const storedState = req.cookies.get("google_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return new NextResponse("State verification failed. CSRF suspected.", { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokens = await getGoogleTokens(code);

    // Look up the default business
    const business = await db.business.findUnique({
      where: { slug: "tax-notary-demo" },
    });

    if (!business) {
      return new NextResponse(
        "Default business ('tax-notary-demo') not found. Please run the seed script first.",
        { status: 500 }
      );
    }

    const expiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Save/update connection details
    await db.calendarConnection.upsert({
      where: { businessId: business.id },
      update: {
        accessToken: tokens.access_token,
        // If Google did not return a refresh token (e.g. if prompt consent was skipped), keep the existing one
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: expiry,
        provider: "google",
      },
      create: {
        businessId: business.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        tokenExpiry: expiry,
        provider: "google",
      },
    });

    // Create the response and delete the state cookie
    const response = new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Calendar Connected Successfully</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; margin: 0; }
            .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-w-md; border: 1px solid #e2e8f0; }
            h1 { color: #16a34a; margin-top: 0; }
            p { color: #475569; line-height: 1.5; font-size: 0.95rem; }
            .btn { display: inline-block; background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; margin-top: 1.5rem; transition: background-color 0.2s; }
            .btn:hover { background-color: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Connection Successful!</h1>
            <p>Your Google Calendar has been successfully linked to Apex Tax & Notary Services. The client scheduler is now active.</p>
            <a href="/schedule" class="btn">View Appointment Scheduler</a>
          </div>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );

    response.cookies.delete("google_oauth_state");
    return response;
  } catch (err: any) {
    console.error("Error in calendar callback endpoint:", err);
    return new NextResponse(`OAuth connection failed: ${err.message}`, { status: 500 });
  }
}
