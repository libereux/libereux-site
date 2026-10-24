// Booking settings. Change hours here and the site updates; no other file needs to change.
//
// Windows are written in James's own clock (Africa/Johannesburg, no daylight saving) so they
// never drift when the US clocks change. Visitors see times in their own time zone.
//
// A slot is offered only if it sits inside a window AND James has nothing busy on the
// calendars listed in BOOKING_BUSY_CALENDARS (see docs/BOOKING_SETUP.md).

export const booking = {
  zone: "Africa/Johannesburg",
  slotMinutes: 30,
  // Free time kept clear on both sides of anything already on the calendar.
  bufferMinutes: 10,
  // Do not offer anything sooner than this many hours from now.
  minNoticeHours: 12,
  // How far ahead visitors can book.
  horizonDays: 21,
  // days: 0 = Sunday ... 6 = Saturday, in James's zone. Times are 24 hour "HH:MM".
  windows: [
    // Evening, every day. About 12:30 to 14:30 in New York from November to March.
    { days: [0, 1, 2, 3, 4, 5, 6], start: "19:30", end: "21:30" },
    // Early US call window, weekdays.
    { days: [1, 2, 3, 4, 5], start: "13:30", end: "14:30" },
  ],
};

export type Window = (typeof booking.windows)[number];
