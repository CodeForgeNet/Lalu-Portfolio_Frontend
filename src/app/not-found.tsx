import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-body">
      <div className="page-intro">
        <p className="eyebrow">404 / Page not found</p>
        <h1>
          This path
          <br />
          <em>ends here.</em>
        </h1>
        <p>The project or page you’re looking for isn’t available.</p>
        <Link className="text-link" href="/projects">
          Explore the work ↗
        </Link>
      </div>
    </main>
  );
}
