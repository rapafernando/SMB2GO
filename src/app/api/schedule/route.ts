import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBusyTimes, createCalendarEvent, refreshGoogleTokens, BusyInterval } from "@/lib/calendar";

// Fixed appointment configuration
const APPOINTMENT_DURATION_MINS = 30;
const BUFFER_MINS = 15;

// Helper: Convert local time in a timezone to UTC
function localTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(candidate);

  const getPart = (type: string) => Number(parts.find((p) => p.type === type)?.value);

  const cYear = getPart("year");
  const cMonth = getPart("month");
  const cDay = getPart("day");
  const cHour = getPart("hour") === 24 ? 0 : getPart("hour");
  const cMinute = getPart("minute");

  const utcCandidateMs = candidate.getTime();
  const localCandidateMs = Date.UTC(cYear, cMonth - 1, cDay, cHour, cMinute);
  const offsetMs = localCandidateMs - utcCandidateMs;

  const targetLocalMs = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(targetLocalMs - offsetMs);
}

// Helper: Refresh access token if close to expiry
async function getActiveGoogleToken(businessId: string): Promise<string | null> {
  const connection = await db.calendarConnection.findUnique({
    where: { businessId },
  });

  if (!connection) return null;

  const now = new Date();
  const expiryThreshold = new Date(now.getTime() + 5 * 60 * 1000); // 5 minute buffer

  if (connection.tokenExpiry <= expiryThreshold) {
    try {
      const refreshResponse = await refreshGoogleTokens(connection.refreshToken);
      const newExpiry = new Date(Date.now() + refreshResponse.expires_in * 1000);

      const updated = await db.calendarConnection.update({
        where: { businessId },
        data: {
          accessToken: refreshResponse.access_token,
          tokenExpiry: newExpiry,
        },
      });
      return updated.accessToken;
    } catch (error) {
      console.error(`Failed to refresh Google OAuth token for business ${businessId}:`, error);
      // Return the current one as fallback
      return connection.accessToken;
    }
  }

  return connection.accessToken;
}

// GET: Fetch available slots for a given date
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // Expected format: YYYY-MM-DD

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { slug: "tax-notary-demo" },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const timezone = business.timezone;
    const [year, month, day] = dateStr.split("-").map(Number);

    // Business Hours: 9:00 AM to 5:00 PM local time
    const dayStartUTC = localTimeToUtc(year, month, day, 9, 0, timezone);
    const dayEndUTC = localTimeToUtc(year, month, day, 17, 0, timezone);

    // Fetch busy times
    let busyTimes: BusyInterval[] = [];
    const accessToken = await getActiveGoogleToken(business.id);

    if (accessToken) {
      try {
        busyTimes = await getBusyTimes(accessToken, dayStartUTC, dayEndUTC);
      } catch (err) {
        console.error("Failed to fetch Google Calendar busy times:", err);
      }
    } else {
      console.warn("Google Calendar not connected. Falling back to local database bookings only.");
    }

    // Also fetch local bookings to prevent double-booking if Google sync fails
    const localBookings = await db.booking.findMany({
      where: {
        businessId: business.id,
        status: "SCHEDULED",
        startTime: { gte: dayStartUTC },
        endTime: { lte: dayEndUTC },
      },
    });

    // Merge Google busy times and local bookings into a unified busy interval list
    const combinedBusy = [
      ...busyTimes.map(b => ({ start: new Date(b.start), end: new Date(b.end) })),
      ...localBookings.map(b => ({ start: b.startTime, end: b.endTime })),
    ];

    // Generate potential slots (30-minute duration + 15-minute buffer)
    const availableSlots: { startTime: string; endTime: string }[] = [];
    let currentStart = dayStartUTC;

    while (true) {
      const currentEnd = new Date(currentStart.getTime() + APPOINTMENT_DURATION_MINS * 60 * 1000);
      
      // Stop generating slots once we exceed working hours
      if (currentEnd.getTime() > dayEndUTC.getTime()) {
        break;
      }

      // Check if slot overlaps with any busy times (including buffer)
      const overlaps = combinedBusy.some((busy) => {
        const busyStartBuffered = new Date(busy.start.getTime() - BUFFER_MINS * 60 * 1000);
        const busyEndBuffered = new Date(busy.end.getTime() + BUFFER_MINS * 60 * 1000);
        return currentStart.getTime() < busyEndBuffered.getTime() && currentEnd.getTime() > busyStartBuffered.getTime();
      });

      // Do not show past slots if date is today
      const now = new Date();
      const isPast = currentStart.getTime() < now.getTime();

      if (!overlaps && !isPast) {
        availableSlots.push({
          startTime: currentStart.toISOString(),
          endTime: currentEnd.toISOString(),
        });
      }

      // Increment by slot duration + buffer (30m + 15m = 45m)
      currentStart = new Date(currentStart.getTime() + (APPOINTMENT_DURATION_MINS + BUFFER_MINS) * 60 * 1000);
    }

    return NextResponse.json({ slots: availableSlots, timezone });
  } catch (error) {
    console.error("GET schedule error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Book a consultation slot
export async function POST(req: NextRequest) {
  try {
    const { date, slotStart, visitorName, visitorEmail, visitorPhone, notes } = await req.json();

    if (!date || !slotStart || !visitorName || !visitorEmail) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { slug: "tax-notary-demo" },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const startTime = new Date(slotStart);
    const endTime = new Date(startTime.getTime() + APPOINTMENT_DURATION_MINS * 60 * 1000);

    // Double-Booking Check: Re-verify slot availability
    const accessToken = await getActiveGoogleToken(business.id);
    let busyTimes: BusyInterval[] = [];

    if (accessToken) {
      try {
        // Query window around the target slot (including buffer)
        const checkStart = new Date(startTime.getTime() - BUFFER_MINS * 60 * 1000);
        const checkEnd = new Date(endTime.getTime() + BUFFER_MINS * 60 * 1000);
        busyTimes = await getBusyTimes(accessToken, checkStart, checkEnd);
      } catch (err) {
        console.error("Failed to query Google busy times during double-booking verification:", err);
      }
    }

    // Check database bookings for overlap (including buffer)
    const dbStartCheck = new Date(startTime.getTime() - BUFFER_MINS * 60 * 1000);
    const dbEndCheck = new Date(endTime.getTime() + BUFFER_MINS * 60 * 1000);
    
    const conflictingDbBooking = await db.booking.findFirst({
      where: {
        businessId: business.id,
        status: "SCHEDULED",
        startTime: { lt: dbEndCheck },
        endTime: { gt: dbStartCheck },
      },
    });

    const conflictsWithGoogle = busyTimes.some((busy) => {
      const busyStartBuffered = new Date(new Date(busy.start).getTime() - BUFFER_MINS * 60 * 1000);
      const busyEndBuffered = new Date(new Date(busy.end).getTime() + BUFFER_MINS * 60 * 1000);
      return startTime.getTime() < busyEndBuffered.getTime() && endTime.getTime() > busyStartBuffered.getTime();
    });

    if (conflictingDbBooking || conflictsWithGoogle) {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please select another time." },
        { status: 409 }
      );
    }

    // Save Booking in Database
    const booking = await db.booking.create({
      data: {
        businessId: business.id,
        visitorName,
        visitorEmail,
        visitorPhone: visitorPhone || null,
        startTime,
        endTime,
        notes: notes || null,
        status: "SCHEDULED",
      },
    });

    // Create event on Google Calendar if connected
    let googleEventId: string | null = null;
    if (accessToken) {
      try {
        googleEventId = await createCalendarEvent(accessToken, {
          summary: `Apex Tax & Notary Consultation: ${visitorName}`,
          description: notes || "No additional notes provided.",
          startTime,
          endTime,
          visitorEmail,
          visitorName,
          visitorPhone,
        });

        // Save Google Event ID back to Booking
        await db.booking.update({
          where: { id: booking.id },
          data: { googleEventId },
        });
      } catch (err) {
        console.error("Failed to register event in Google Calendar:", err);
        // We do not roll back local DB booking to allow fallback offline operations
      }
    }

    return NextResponse.json({
      success: true,
      message: "Consultation booked successfully.",
      booking: {
        id: booking.id,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        googleSynced: !!googleEventId,
      },
    });
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
