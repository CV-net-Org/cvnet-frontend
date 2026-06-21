import Link from "next/link";
import { useRouter } from "next/router";
import { useAdminAuth } from "./AdminAuth";

export default function Nav() {
  const router = useRouter();
  const auth = useAdminAuth();

  return (
    <aside className="sidebar">
      <div>
        <span className="eyebrow eyebrow-inverse">Admin</span>
        <h2>CVNET</h2>
        <p className="sidebar-copy">
          Manage candidate and company records from one place.
        </p>
      </div>

      <nav className="sidebar-nav">
        <Link
          className={router.pathname === "/" ? "nav-link active" : "nav-link"}
          href="/"
        >
          Overview
        </Link>
        <Link
          className={
            router.pathname.startsWith("/candidates")
              ? "nav-link active"
              : "nav-link"
          }
          href="/candidates"
        >
          Candidates
        </Link>
        <Link
          className={
            router.pathname.startsWith("/companies")
              ? "nav-link active"
              : "nav-link"
          }
          href="/companies"
        >
          Companies
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div>
          <div className="sidebar-label">Signed in as</div>
          <div className="sidebar-value">{auth.session?.name ?? "Admin"}</div>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={auth.logout}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
