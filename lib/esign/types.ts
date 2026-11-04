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
};

export type EnvelopeEvent = { at: string; type: string; actor: string; ip?: string; detail?: string };

export type Envelope = {
  id: string;
  title: string;
  property: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  status: "in_progress" | "completed" | "voided";
  originalSha256: string;
  originalName: string;
  pages: number;
  signedSha256?: string;
  completedAt?: string;
  current: number; // index of the signer whose turn it is
  signers: Signer[];
  events: EnvelopeEvent[];
};

export const PROPERTIES = [
  "2098 Murry Trail, Morrow, GA 30260 (Upstairs)",
  "2707 Harrison Dr, Lawrenceville, GA 30044",
] as const;
