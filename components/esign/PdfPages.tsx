"use client";

// Renders every page of a PDF at the width of its container, with a layer on top of each page
// for placing or filling fields. Positions on that layer are fractions of the page, so they map
// straight onto the real PDF regardless of screen size.
import { useEffect, useRef, useState, type ReactNode } from "react";

type Loaded = { count: number; ratios: number[]; doc: unknown };

export default function PdfPages({
  url,
  overlay,
  onPageClick,
}: {
  url: string;
  overlay: (page: number) => ReactNode;
  onPageClick?: (page: number, x: number, y: number) => void;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ url, withCredentials: true }).promise;
        const ratios: number[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const vp = (await doc.getPage(i)).getViewport({ scale: 1 });
          ratios.push(vp.height / vp.width);
        }
        if (!cancelled) setLoaded({ count: doc.numPages, ratios, doc });
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("The lease could not be displayed here.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error)
    return (
      <p role="alert">
        {error}{" "}
        <a href={url} target="_blank" rel="noreferrer">
          Open the PDF
        </a>
      </p>
    );
  if (!loaded) return <p className="muted">Loading pages…</p>;

  return (
    <div className="esign-pages">
      {loaded.ratios.map((ratio, i) => (
        <PdfPage key={i} doc={loaded.doc} index={i} ratio={ratio} total={loaded.count} onPageClick={onPageClick}>
          {overlay(i)}
        </PdfPage>
      ))}
    </div>
  );
}

function PdfPage({
  doc,
  index,
  ratio,
  total,
  children,
  onPageClick,
}: {
  doc: unknown;
  index: number;
  ratio: number;
  total: number;
  children: ReactNode;
  onPageClick?: (page: number, x: number, y: number) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.round(el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!width || !canvas.current) return;
    let task: { cancel: () => void; promise: Promise<void> } | null = null;
    (async () => {
      const page = await (doc as { getPage: (n: number) => Promise<PdfPageProxy> }).getPage(index + 1);
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (width / base.width) * dpr });
      const c = canvas.current!;
      c.width = Math.floor(viewport.width);
      c.height = Math.floor(viewport.height);
      task = page.render({ canvas: c, viewport });
      await task.promise.catch(() => {});
    })();
    return () => task?.cancel();
  }, [doc, index, width]);

  return (
    <div className="esign-page-wrap">
      <div
        ref={wrap}
        className="esign-page"
        style={{ aspectRatio: `1 / ${ratio}` }}
        onClick={(e) => {
          if (!onPageClick || e.target !== e.currentTarget.querySelector(".esign-layer")) return;
          const r = e.currentTarget.getBoundingClientRect();
          onPageClick(index, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        }}
      >
        <canvas ref={canvas} aria-hidden="true" />
        <div className="esign-layer">{children}</div>
      </div>
      <p className="muted esign-page-num">
        Page {index + 1} of {total}
      </p>
    </div>
  );
}

type PdfPageProxy = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: { canvas: HTMLCanvasElement; viewport: unknown }) => { cancel: () => void; promise: Promise<void> };
};
