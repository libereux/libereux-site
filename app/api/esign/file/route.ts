// Admin download of the original or the completed lease.
import { adminFrom } from "@/lib/esign/auth";
import { getEnvelope, getFile } from "@/lib/esign/envelopes";

export async function GET(req: Request) {
  const admin = await adminFrom(req);
  if (!admin) return new Response("Sign in first.", { status: 401 });
  const url = new URL(req.url);
  const env = await getEnvelope(url.searchParams.get("id") || "");
  const kind = url.searchParams.get("kind") === "signed" ? "signed" : "original";
  if (!env) return new Response("Not found.", { status: 404 });
  const bytes = await getFile(env.id, `${kind}.pdf`);
  if (!bytes) return new Response("Not available yet.", { status: 404 });
  const name = `${env.title.replace(/[^A-Za-z0-9 _-]+/g, "").trim().replace(/\s+/g, "_") || "Lease"}${kind === "signed" ? "_signed" : ""}.pdf`;
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${url.searchParams.get("download") ? "attachment" : "inline"}; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
