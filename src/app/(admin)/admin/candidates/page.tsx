import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";

type Candidate = { id: string; name: string; email: string; status: string };

export default function Candidates() {
  const [list, setList] = useState<Candidate[]>([]);

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then(setList);
  }, []);

  async function deactivate(id: string) {
    if (!confirm("Confirm deactivate candidate?")) return;

    const res = await fetch(`/api/candidates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "inactive" }),
    });

    if (!res.ok) {
      alert("Failed to update candidate status");
      return;
    }

    const updated = await res.json();
    setList((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  return (
    <Layout>
      <div className="list-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Records</span>
            <h1>Candidates</h1>
            <p>
              Browse active candidates, view details, and create new records
              later.
            </p>
          </div>
          <Link className="primary-button" href="/candidates/new">
            Create candidate
          </Link>
        </div>

        <div className="table-wrap">
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Profile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="record-row">
                  <td>
                    <Link href={`/candidates/${c.id}`} className="record-link">
                      {c.name}
                    </Link>
                  </td>
                  <td>{c.email}</td>
                  <td>
                    <Link
                      className="primary-button"
                      href={`/candidates/${c.id}`}
                    >
                      View
                    </Link>
                  </td>
                  <td>
                    <span className={`status-pill status-${c.status}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === "active" ? (
                      <button
                        className="secondary-button"
                        onClick={() => deactivate(c.id)}
                        type="button"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
