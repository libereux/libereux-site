import { lookup } from "node:dns/promises";
import net from "node:net";
import type { Check, Report } from "./types";

const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 9000;
const MAX_REDIRECTS = 3;

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb");
}

export class ScanError extends Error {}

// Rejects anything that is not a public http(s) address, so visitors cannot use the
// scanner to reach internal networks.
async function assertPublic(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new ScanError("Only web addresses starting with http or https can be scanned.");
  if (url.username || url.password) throw new ScanError("Addresses with login details cannot be scanned.");
  if (process.env.SCAN_ALLOW_PRIVATE === "1") return; // local testing only
  if (url.port && url.port !== "80" && url.port !== "443") throw new ScanError("Only standard web ports can be scanned.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new ScanError("That address is not a public website.");
  }
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => {
    throw new ScanError("That website could not be found. Check the address and try again.");
  });
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new ScanError("That address is not a public website.");
}

export function normalizeUrl(input: string): URL {
  let s = input.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s) && !/^https?:\/\//i.test(s)) {
    throw new ScanError("Only web addresses starting with http or https can be scanned.");
  }
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    return new URL(s);
  } catch {
    throw new ScanError("That does not look like a website address.");
  }
}

async function fetchPublic(start: URL) {
  let url = start;
  const t0 = Date.now();
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertPublic(url);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": "LibereuxSiteReview/1.0 (+https://libereux.com)", Accept: "text/html" },
      });
    } catch {
      clearTimeout(timer);
      throw new ScanError("The website did not respond in time.");
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      clearTimeout(timer);
      url = new URL(res.headers.get("location")!, url);
      continue;
    }
    if (!res.ok) {
      clearTimeout(timer);
      throw new ScanError(`The website answered with an error (status ${res.status}).`);
    }
    const type = res.headers.get("content-type") || "";
    if (!type.includes("html")) {
      clearTimeout(timer);
      throw new ScanError("That address is not a web page.");
    }
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    clearTimeout(timer);
    const html = new TextDecoder("utf-8", { fatal: false }).decode(Buffer.concat(chunks));
    return { html, finalUrl: url, ms: Date.now() - t0, bytes: size };
  }
  throw new ScanError("The website redirected too many times.");
}

const attr = (tag: string, name: string) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3] ?? "") : null;
};

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function checkWebsite(input: string): Promise<Report> {
  const { html, finalUrl, ms, bytes } = await fetchPublic(normalizeUrl(input));

  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html.slice(0, 20000);
  const metas = head.match(/<meta\b[^>]*>/gi) ?? [];
  const meta = (key: string) => {
    const tag = metas.find((t) => (attr(t, "name") || attr(t, "property") || "").toLowerCase() === key);
    return tag ? decode(attr(tag, "content") ?? "") : "";
  };
  const title = decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = meta("description");
  const viewport = meta("viewport");
  const ogImage = meta("og:image");
  const lang = attr(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang");
  const canonical = /<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(head);
  const ldJson = (html.match(/application\/ld\+json/gi) ?? []).length;

  const body = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  const h1s = (body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) ?? []).map((h) => decode(h.replace(/<[^>]+>/g, " ")));
  const imgs = body.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imgs.filter((t) => attr(t, "alt") === null).length;
  const links = body.match(/<a\b[^>]*>/gi) ?? [];
  const tel = links.filter((t) => /href\s*=\s*["']tel:/i.test(t)).length;
  const whatsapp = links.filter((t) => /wa\.me|whatsapp/i.test(t)).length;
  const text = decode(body.replace(/<[^>]+>/g, " "));
  const actionWords = /\b(book|booking|reserve|appointment|schedule|order|get a quote|request a quote|contact us|call now|buy)\b/i;
  const hasAction = actionWords.test(text) || (body.match(/<form\b/gi) ?? []).length > 0;

  const mk = (
    id: string,
    label: string,
    ok: boolean,
    detail: string,
    weight: number,
    why: string,
    fix: string,
  ): Check => ({ id, label, ok, detail, weight, why, fix });

  const checks: Check[] = [
    mk(
      "action",
      "Clear next step for customers",
      hasAction,
      hasAction ? "Visitors can see a way to book, order or get in touch." : "We could not find an obvious way to book, order or get in touch.",
      10,
      "Visitors who cannot see how to book, order or contact you in a few seconds usually leave and choose someone else.",
      "One clear action, such as Book, Order or Call, near the top of every page and repeated as they scroll.",
    ),
    mk(
      "tap",
      "Tap to call or message",
      tel + whatsapp > 0,
      tel + whatsapp > 0 ? "Phone or messaging links open with one tap." : "Phone numbers are not tappable, or there is no phone or messaging link.",
      9,
      "Most people find local businesses on their phones. If the number is not tappable, every caller has to copy it by hand, and many will not bother.",
      "Make every phone number and messaging link open with one tap.",
    ),
    mk(
      "mobile",
      "Works on phones",
      /width\s*=\s*device-width/i.test(viewport),
      viewport ? "The page is set up for phone screens." : "No mobile setting, so phones may show a shrunken desktop page.",
      9,
      "A page that is tiny or needs zooming on a phone feels broken, and visitors leave before reading anything.",
      "A layout designed for phones first, with readable text and buttons big enough to tap.",
    ),
    mk(
      "https",
      "Secure connection",
      finalUrl.protocol === "https:",
      finalUrl.protocol === "https:" ? "Loads over a secure connection." : "Not secure. Browsers show visitors a warning.",
      8,
      "Browsers label unsecured sites as not secure, which scares visitors away, especially from forms.",
      "A security certificate, which is usually free and renews automatically.",
    ),
    mk(
      "title",
      "Search result title",
      title.length >= 10 && title.length <= 65,
      title ? `${title.length} characters: "${title.slice(0, 70)}"` : "Missing, so search results show whatever the search engine guesses.",
      7,
      "The title is the headline people see in search results. A vague or missing one means fewer people click through to you.",
      "Say what you do and where, in under 60 characters, for every page.",
    ),
    mk(
      "speed",
      "Loads quickly",
      ms < 2500,
      `The page started arriving in about ${(ms / 1000).toFixed(1)} seconds from our server.`,
      7,
      "Every extra second of waiting loses visitors, especially on mobile data.",
      "Lighter pages, compressed images and fast hosting.",
    ),
    mk(
      "description",
      "Search result description",
      description.length >= 50 && description.length <= 165,
      description ? `${description.length} characters.` : "Missing, so search results show a random piece of the page.",
      6,
      "The description is your sales pitch in search results. Without one, the search engine picks a random snippet.",
      "A clear one or two sentence summary of what you offer and why to choose you.",
    ),
    mk(
      "h1",
      "One clear main heading",
      h1s.length === 1,
      h1s.length === 0 ? "No main heading found." : h1s.length === 1 ? `"${h1s[0].slice(0, 70)}"` : `${h1s.length} main headings compete for attention.`,
      5,
      "Visitors and search engines both use the main heading to understand what the page is about in a glance.",
      "One main heading per page that says plainly what you do.",
    ),
    mk(
      "schema",
      "Business details for search engines",
      ldJson > 0,
      ldJson > 0 ? "Structured business details found." : "No structured details found.",
      5,
      "Without structured details, search engines have to guess your hours, services and location, and may show them wrong.",
      "Structured business details for your name, services, hours, area and contact information.",
    ),
    mk(
      "weight",
      "Lightweight page",
      bytes < 600_000,
      `About ${Math.round(bytes / 1024)} KB of page code.`,
      3,
      "Heavy pages load slowly on older phones and weaker connections.",
      "Trimming unused code and moving large content out of the page itself.",
    ),
    mk(
      "alt",
      "Image descriptions",
      imgs.length === 0 || missingAlt / imgs.length <= 0.2,
      imgs.length === 0 ? "No images found in the page code." : `${imgs.length - missingAlt} of ${imgs.length} images are described.`,
      3,
      "Image descriptions help search engines understand your photos and let visitors using screen readers follow along.",
      "A short description for every meaningful image.",
    ),
    mk(
      "share",
      "Preview when shared",
      Boolean(ogImage),
      ogImage ? "A preview image is set for shared links." : "Shared links show no preview image.",
      3,
      "Links shared in messages and social posts without a preview get noticeably fewer taps.",
      "A branded preview image and title for every page.",
    ),
    mk(
      "lang",
      "Page language set",
      Boolean(lang),
      lang ? `Marked as "${lang}".` : "Language not declared.",
      2,
      "Declaring the language helps search engines show your page to the right audience and helps translation tools.",
      "Setting the page language in the site code.",
    ),
    mk(
      "canonical",
      "Duplicate-page protection",
      canonical,
      canonical ? "Main address is declared." : "No main address declared.",
      2,
      "When the same page is reachable at several addresses, search ranking can be split between them.",
      "Declaring one main address for each page.",
    ),
  ];

  // Score weights each check by how much it matters for winning customers.
  const total = checks.reduce((n, c) => n + c.weight, 0);
  const earned = checks.reduce((n, c) => n + (c.ok ? c.weight : 0), 0);
  const score = Math.round((earned / total) * 100);
  const verdict =
    score >= 85
      ? "Strong foundation. A few refinements would make it even easier to find you and act."
      : score >= 60
        ? "Solid in places, with gaps that are likely costing you enquiries."
        : "Customers are probably slipping away before they get in touch.";

  const topFixes = checks
    .filter((c) => !c.ok)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  return {
    url: finalUrl.toString(),
    host: finalUrl.hostname.replace(/^www\./, ""),
    score,
    verdict,
    checks,
    topFixes,
    loadMs: ms,
    sizeKb: Math.round(bytes / 1024),
    checkedAt: new Date().toISOString(),
  };
}
