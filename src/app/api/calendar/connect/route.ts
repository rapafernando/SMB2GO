import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/calendar";
import crypto from "crypto";

export async function GET() {
  const state = crypto.randomBytes(32).toString("hex");

  const response = NextResponse.redirect(getGoogleAuthUrl(state));

  // Store state in a secure, HTTP-only cookie for CSRF verification
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // Valid for 10 minutes
  });

  return response;
}
