import { google } from "googleapis";

export async function createCalendarEvent(
  accessToken: string,
  booking: {
    gymName: string;
    activityName: string;
    startTime: string;
    durationMin: number;
    address?: string | null;
  },
) {
  const oauth2 = new google.auth.OAuth2();
  oauth2.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2 });

  const start = new Date(booking.startTime);
  const end = new Date(start.getTime() + booking.durationMin * 60 * 1000);

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `${booking.activityName} @ ${booking.gymName}`,
      location: booking.address ?? undefined,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 120 },
          { method: "popup", minutes: 60 },
        ],
      },
    },
  });

  return event.data;
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
) {
  const oauth2 = new google.auth.OAuth2();
  oauth2.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2 });

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}
