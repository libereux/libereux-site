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
  events: EnvelopeEvent[];
};

export const PROPERTIES = [
  "2098 Murry Trail, Morrow, GA 30260 (Upstairs)",
  "2707 Harrison Dr, Lawrenceville, GA 30044",
] as const;
