// Builds the completed lease: the original pages with an envelope stamp, a signature page,
// and a certificate of completion (document fingerprint plus the full audit trail).
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Envelope, Field } from "./types";

const NAVY = rgb(0x1b / 255, 0x2a / 255, 0x4a / 255);
const ORANGE = rgb(1, 0x6b / 255, 0x35 / 255);
const INK = rgb(0x11 / 255, 0x18 / 255, 0x27 / 255);
const STEEL = rgb(0x5b / 255, 0x64 / 255, 0x72 / 255);
const LINE = rgb(0.86, 0.88, 0.91);

// Standard PDF fonts only cover basic Latin characters.
const safe = (s: string) =>
  (s || "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "");

export function eastern(iso?: string) {
  if (!iso) return "";
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "long",
    }).format(new Date(iso))
  );
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = safe(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function pageCount(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

export function dateOnly(iso?: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "2-digit", day: "2-digit", year: "numeric" }).format(new Date(iso));
}

// The value a signer's field shows, for text-like fields.
export function fieldText(env: Envelope, f: Field): string {
  const s = env.signers[f.signer];
  if (!s) return "";
  if (f.type === "date") return dateOnly(s.signedAt);
  if (f.type === "name") return s.typedName || "";
  return s.values?.[f.id] || "";
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .join("")
    .slice(0, 4);

export async function buildSignedPdf(
  env: Envelope,
  original: Uint8Array,
  signatures: (Uint8Array | null)[],
  initials: (Uint8Array | null)[] = [],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(original, { ignoreEncryption: true });
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const script = await doc.embedFont(StandardFonts.TimesRomanItalic);

  // Lock any fillable fields so the signed copy cannot be edited afterwards.
  try {
    doc.getForm().flatten();
  } catch {
    // No form, or a form pdf-lib cannot flatten: the fingerprint still records the original.
  }

  // Stamp every placed field onto its page.
  const pages = doc.getPages();
  const imgCache = new Map<string, Awaited<ReturnType<typeof doc.embedPng>>>();
  const img = async (key: string, bytes: Uint8Array | null | undefined) => {
    if (!bytes) return null;
    if (!imgCache.has(key)) imgCache.set(key, await doc.embedPng(bytes));
    return imgCache.get(key)!;
  };
  for (const f of env.fields || []) {
    const page = pages[f.page];
    const s = env.signers[f.signer];
    if (!page || !s || s.status !== "signed") continue;
    const box = page.getCropBox();
    const x = box.x + f.x * box.width;
    const w = f.w * box.width;
    const h = f.h * box.height;
    const y = box.y + box.height * (1 - f.y) - h;
    if (f.type === "signature" || f.type === "initials") {
      const png = f.type === "signature" ? await img(`s${f.signer}`, signatures[f.signer]) : await img(`i${f.signer}`, initials[f.signer]);
      if (png) {
        const scale = Math.min(w / png.width, h / png.height);
        page.drawImage(png, { x, y: y + (h - png.height * scale) / 2, width: png.width * scale, height: png.height * scale });
      } else {
        const text = safe(f.type === "signature" ? s.typedName || s.name : initialsOf(s.typedName || s.name));
        let size = Math.min(h * 0.8, 28);
        while (size > 6 && script.widthOfTextAtSize(text, size) > w) size -= 0.5;
        page.drawText(text, { x, y: y + h * 0.2, size, font: script, color: NAVY });
      }
      continue;
    }
    if (f.type === "checkbox") {
      if (s.values?.[f.id] === "true") {
        const size = Math.min(w, h) * 0.95;
        page.drawText("X", { x: x + (w - bold.widthOfTextAtSize("X", size)) / 2, y: y + h * 0.15, size, font: bold, color: INK });
      }
      continue;
    }
    const text = safe(fieldText(env, f));
    if (!text) continue;
    let size = Math.min(h * 0.72, 12);
    while (size > 5 && helv.widthOfTextAtSize(text, size) > w) size -= 0.25;
    page.drawText(text, { x: x + 1, y: y + (h - size) / 2 + size * 0.2, size, font: helv, color: INK });
  }

  const total = doc.getPageCount();
  doc.getPages().forEach((p, i) => {
    const { width } = p.getSize();
    const label = safe(`Envelope ${env.id} | Electronically signed through libereux.com | Page ${i + 1} of ${total} of the original`);
    p.drawText(label, { x: 36, y: 14, size: 7, font: helv, color: STEEL, maxWidth: width - 72 });
  });

  const W = 612;
  const H = 792;
  const M = 54;

  const header = (page: PDFPage, title: string) => {
    page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: ORANGE });
    page.drawText("Libereux Holdings, LLC", { x: M, y: H - 50, size: 13, font: bold, color: NAVY });
    page.drawText(safe(title), { x: M, y: H - 80, size: 20, font: bold, color: INK });
    page.drawText(safe(`${env.title} | ${env.property}`), { x: M, y: H - 100, size: 10, font: helv, color: STEEL, maxWidth: W - 2 * M });
    page.drawText(safe(`Envelope ID ${env.id}`), { x: M, y: H - 114, size: 10, font: helv, color: STEEL });
    return H - 140;
  };

  // Signature page(s)
  let page = doc.addPage([W, H]);
  let y = header(page, "Electronic Signature Page");
  for (const line of wrap(
    `This page is part of and incorporated into the agreement above (${env.pages} pages). Each party below signed electronically, in the order shown, after agreeing to do business electronically under the federal ESIGN Act and the Georgia Uniform Electronic Transactions Act. An electronic signature has the same effect as a handwritten one.`,
    helv,
    10,
    W - 2 * M,
  )) {
    page.drawText(line, { x: M, y, size: 10, font: helv, color: INK });
    y -= 14;
  }
  y -= 10;

  const boxH = 128;
  for (let i = 0; i < env.signers.length; i++) {
    const s = env.signers[i];
    if (y - boxH < 60) {
      page = doc.addPage([W, H]);
      y = header(page, "Electronic Signature Page (continued)");
    }
    const top = y;
    page.drawRectangle({ x: M, y: top - boxH, width: W - 2 * M, height: boxH, borderColor: LINE, borderWidth: 1 });
    page.drawText(safe(s.role.toUpperCase()), { x: M + 12, y: top - 20, size: 9, font: bold, color: ORANGE });

    const sigImg = signatures[i];
    const sigX = M + 12;
    const sigY = top - 82;
    if (sigImg) {
      const png = await doc.embedPng(sigImg);
      const scale = Math.min(230 / png.width, 52 / png.height);
      page.drawImage(png, { x: sigX, y: sigY, width: png.width * scale, height: png.height * scale });
    } else if (s.typedName) {
      page.drawText(safe(s.typedName), { x: sigX, y: sigY + 14, size: 26, font: script, color: NAVY });
    }
    page.drawLine({ start: { x: sigX, y: sigY - 4 }, end: { x: sigX + 240, y: sigY - 4 }, thickness: 0.8, color: STEEL });
    page.drawText(safe(`Signature of ${s.typedName || s.name}`), { x: sigX, y: sigY - 16, size: 8, font: helv, color: STEEL });

    const cx = M + 280;
    const rows: [string, string][] = [
      ["Printed name", s.typedName || s.name],
      ["Email", s.email],
      ["Signed", eastern(s.signedAt)],
      ["IP address", s.ip || ""],
      ["Method", s.signatureMethod === "drawn" ? "Drawn signature" : "Typed signature"],
    ];
    let ry = top - 38;
    for (const [k, v] of rows) {
      page.drawText(safe(k), { x: cx, y: ry, size: 8, font: bold, color: STEEL });
      page.drawText(safe(v), { x: cx + 68, y: ry, size: 8.5, font: helv, color: INK, maxWidth: W - M - cx - 80 });
      ry -= 15;
    }
    y = top - boxH - 14;
  }

  // Certificate of completion
  page = doc.addPage([W, H]);
  y = header(page, "Certificate of Completion");
  const facts: [string, string][] = [
    ["Status", env.status === "completed" ? "Completed. All parties signed." : env.status],
    ["Created", `${eastern(env.createdAt)} by ${env.createdBy}`],
    ["Completed", eastern(env.completedAt)],
    ["Original file", `${env.originalName} (${env.pages} pages)`],
    ["Original SHA-256", env.originalSha256],
  ];
  for (const [k, v] of facts) {
    page.drawText(safe(k), { x: M, y, size: 9, font: bold, color: STEEL });
    const lines = wrap(v, helv, 9, W - 2 * M - 110);
    for (const l of lines) {
      page.drawText(l, { x: M + 110, y, size: 9, font: helv, color: INK });
      y -= 13;
    }
    y -= 3;
  }
  y -= 6;
  for (const line of wrap(
    "The SHA-256 fingerprint identifies the exact document each signer reviewed. Any change to the original file, even one character, produces a different fingerprint.",
    helv,
    8.5,
    W - 2 * M,
  )) {
    page.drawText(line, { x: M, y, size: 8.5, font: helv, color: STEEL });
    y -= 12;
  }
  y -= 12;
  page.drawText("Audit trail (Eastern Time)", { x: M, y, size: 12, font: bold, color: NAVY });
  y -= 20;
  for (const e of env.events) {
    const text = `${eastern(e.at)}  |  ${e.type}  |  ${e.actor}${e.ip ? `  |  IP ${e.ip}` : ""}${e.detail ? `  |  ${e.detail}` : ""}`;
    const lines = wrap(text, helv, 8.5, W - 2 * M);
    if (y - lines.length * 12 < 50) {
      page = doc.addPage([W, H]);
      y = header(page, "Certificate of Completion (continued)");
    }
    for (const l of lines) {
      page.drawText(l, { x: M, y, size: 8.5, font: helv, color: INK });
      y -= 12;
    }
    y -= 5;
  }

  doc.setTitle(safe(`${env.title} (signed)`));
  doc.setProducer("Libereux Holdings lease signing");
  return doc.save();
}
