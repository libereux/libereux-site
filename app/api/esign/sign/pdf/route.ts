// Lets a signer view the lease they were sent, and download the completed copy once everyone has signed.
import { fromToken, getFile } from "@/lib/esign/envelopes";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const found = await fromToken(url.searchParams.get("t") || "");
  if (!found) return new Response("This link is not valid.", { status: 404 });
  const { env } = found;
  const kind = url.searchParams.get("kind") === "signed" && env.status === "completed" ? "signed" : "original";
  const bytes = await getFile(env.id, `${kind}.pdf`);
  if (!bytes) return new Response("Not available.", { status: 404 });
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="lease${kind === "signed" ? "_signed" : ""}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
