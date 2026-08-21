const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";

export function getGoogleAuthUrl(state: string): string {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ].join(" "),
    state: state,
  };

  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function getGoogleTokens(code: string): Promise<GoogleTokens> {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to exchange Google OAuth code: ${errText}`);
  }

  return response.json();
}

interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

export async function refreshGoogleTokens(refreshToken: string): Promise<RefreshResponse> {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(values).toString(),
  });

  if (!response.ok) {
    // SECURITY: Do not include the refresh token in the error logs.
    throw new Error(`Failed to refresh Google OAuth token: status=${response.status}`);
  }

  return response.json();
}

export interface BusyInterval {
  start: string;
  end: string;
}

export async function getBusyTimes(
  accessToken: string,
  startTime: Date,
  endTime: Date,
  calendarId: string = "primary"
): Promise<BusyInterval[]> {
  const url = "https://www.googleapis.com/calendar/v3/freeBusy";
  const body = {
    timeMin: startTime.toISOString(),
    timeMax: endTime.toISOString(),
    items: [{ id: calendarId }],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch Google Calendar free/busy: ${errText}`);
  }

  const data = await response.json();
  const calendarData = data.calendars?.[calendarId];
  return calendarData?.busy || [];
}

interface EventDetails {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  visitorEmail: string;
  visitorName: string;
  visitorPhone?: string | null;
}

export async function createCalendarEvent(
  accessToken: string,
  details: EventDetails,
  calendarId: string = "primary"
): Promise<string> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const body = {
    summary: details.summary,
    description: `Name: ${details.visitorName}\nEmail: ${details.visitorEmail}\nPhone: ${details.visitorPhone || "N/A"}\n\n${details.description}`,
    start: {
      dateTime: details.startTime.toISOString(),
    },
    end: {
      dateTime: details.endTime.toISOString(),
    },
    attendees: [
      {
        email: details.visitorEmail,
        displayName: details.visitorName,
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create Google Calendar event: ${errText}`);
  }

  const data = await response.json();
  return data.id;
}
