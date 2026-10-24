import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="prose">
          <h1>That page is not here.</h1>
          <p className="lede">It may have moved when we updated the site. These links will get you where you need to go.</p>
          <div className="btn-row" style={{ marginTop: 28 }}>
            <Link href="/" className="btn btn-primary">
              Go to the home page
            </Link>
            <Link href="/pricing" className="btn btn-ghost">
              See prices
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
