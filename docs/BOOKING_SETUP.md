# Online consultation booking

Visitors pick a 30 minute time on the contact page. The site checks James's calendars,
creates a Google Calendar event on holdings@libereux.com with a Google Meet link, invites the
visitor, and puts a consultation agenda (built from what they typed) in the event description.
Running cost: $0. No AI service is used; the agenda is rule based.

If the Google variables below are not set, the picker is hidden and the form works exactly as before.

## What it needs

1. A Google Cloud project owned by holdings@libereux.com (free).
2. The Google Calendar API switched on.
3. One OAuth refresh token for holdings@libereux.com.
4. Four environment variables in Netlify.

## One time setup (about 15 minutes)

1. Sign in to https://console.cloud.google.com as holdings@libereux.com. Create a project named "Libereux Website".
2. APIs and Services, Library: search "Google Calendar API", click Enable.
3. APIs and Services, OAuth consent screen: choose user type **Internal**, app name "Libereux Website",
   support email holdings@libereux.com. Internal matters: tokens for Internal apps do not expire after 7 days.
4. APIs and Services, Credentials, Create credentials, OAuth client ID. Type: Web application.
   Authorized redirect URI: `https://developers.google.com/oauthplayground`. Copy the client ID and client secret.
5. Open https://developers.google.com/oauthplayground. Click the gear icon, tick "Use your own OAuth credentials",
   paste the client ID and secret.
6. In Step 1 type these two scopes in the box and click Authorize APIs, signing in as holdings@libereux.com:
   `https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy`
7. Step 2: click "Exchange authorization code for tokens". Copy the **Refresh token**.
8. In Netlify, Site configuration, Environment variables, add:

   | Name | Value |
   |---|---|
   | `GOOGLE_CLIENT_ID` | from step 4 |
   | `GOOGLE_CLIENT_SECRET` | from step 4 |
   | `GOOGLE_REFRESH_TOKEN` | from step 7 |
   | `BOOKING_BUSY_CALENDARS` | `primary,` then the personal calendar address, for example `primary,you@gmail.com` |

9. The personal calendar must be shared with holdings@libereux.com (Settings and sharing, Share with specific people).
   "See only free/busy" is enough because the site only needs to know when you are busy.
10. Redeploy the site. Open `/api/slots` on the live site: you should see `"configured":true` and a list of times.

## Calendar rules the booking relies on

- Only events marked **Busy** block a time. Events marked **Free** do not. The "US call window" and "Flex evening
  block" events are availability markers, so they must be set to Free or they would hide the times they describe.
- Add a work meeting, meal or workout to either calendar and it blocks that time (plus 10 minutes either side).
- If one of the listed calendars cannot be read, the site shows no times at all rather than risk a double booking.

## Changing the hours

Edit `lib/booking/config.ts`: bookable windows, slot length, buffer, minimum notice and how far ahead visitors can book.
Windows are in James's own clock (Africa/Johannesburg, no daylight saving), so they do not move when US clocks change.
Visitors see times in their own time zone.

Current windows:

- Every day, 19:30 to 21:30 Johannesburg (New York 13:30 to 15:30 until 1 Nov 2026, then 12:30 to 14:30).
- Monday to Friday, 13:30 to 14:30 Johannesburg (New York 07:30 to 08:30 until 1 Nov 2026, then 06:30 to 07:30).

## Known limits

- Two visitors choosing the same time in the same few seconds could both pass the check. The second booking
  would show as an overlapping event on the calendar. At current volume this is very unlikely.
- Event descriptions are visible to the invited visitor, so the agenda contains nothing internal.
- Visitor details live only in the calendar event and the backup email. The site stores nothing.
