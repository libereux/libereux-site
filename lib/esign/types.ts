export type SignerStatus = "waiting" | "sent" | "viewed" | "signed";

export type Signer = {
  name: string;
  email: string;
  role: string; // Tenant, Property Manager, Landlord
  status: SignerStatus;
  tokenHash: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  ip?: string;
  userAgent?: string;
  typedName?: string;
  signatureMethod?: "drawn" | "typed";
  values?: Record<string, string>; // field id -> text, number, "true"/"false" for checkboxes
};

export const FIELD_TYPES = ["signature", "initials", "date", "name", "text", "number", "checkbox"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

// Positions are fractions of the page (0 to 1) from the top-left corner, so they work at any zoom.
export type Field = {
  id: string;
  signer: number;
  type: FieldType;
  page: number; // 0-based
  x: number;
  y: number;
  w: number;
  h: number;
  required: boolean;
  label?: string;
};

export const FIELD_LABELS: Record<FieldType, string> = {
  signature: "Signature",
  initials: "Initials",
  date: "Date signed",
  name: "Full name",
  text: "Text",
  number: "Number",
  checkbox: "Checkbox",
};

export type EnvelopeEvent = { at: string; type: string; actor: string; ip?: string; detail?: string };

export type Envelope = {
  id: string;
  title: string;
  property: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  status: "draft" | "in_progress" | "completed" | "voided";
  originalSha256: string;
  originalName: string;
  pages: number;
  signedSha256?: string;
  completedAt?: string;
  current: number; // index of the signer whose turn it is
  signers: Signer[];
  fields?: Field[];
  driveFileId?: string;
  driveLink?: string;
  lease?: LeaseTerms; // feeds the property calendar
  source?: "signed_here" | "imported"; // imported = a lease signed elsewhere, uploaded for the records
  events: EnvelopeEvent[];
};

// Dates are calendar days (YYYY-MM-DD). "end" is the last night the tenant is in the property.
export type LeaseTerms = { tenants: string; start: string; end: string; rent?: number };

export type BookingSource = "Direct" | "Airbnb" | "VRBO" | "Booking.com" | "Furnished Finder" | "Other";
export const BOOKING_SOURCES: BookingSource[] = ["Direct", "Airbnb", "VRBO", "Booking.com", "Furnished Finder", "Other"];

// A stay entered by hand (a guest who booked directly without a lease, or a platform booking
// whose details we want to keep). "end" is the checkout day, like the platforms use.
export type Booking = {
  id: string;
  property: string;
  start: string;
  end: string;
  guest: string;
  source: BookingSource;
  phone?: string;
  email?: string;
  amount?: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
};

export type CalendarFeed = { property: string; source: BookingSource; url: string };

export const isDay = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

export const PROPERTIES = [
  "2098 Murry Trail, Morrow, GA 30260 (Upstairs)",
  "2707 Harrison Dr, Lawrenceville, GA 30044",
] as const;
