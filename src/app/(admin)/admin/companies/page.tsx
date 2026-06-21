import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { Company } from "../api/_data";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetch("/api/companies")
      .then((response) => response.json())
      .then(setCompanies);
  }, []);

  return (
    <Layout>
      <div className="list-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Records</span>
            <h1>Companies</h1>
            <p>
              Manage company profiles, locations, jobs, and hiring records from
              one place.
            </p>
          </div>
          <Link className="primary-button" href="/companies/new">
            Create company
          </Link>
        </div>

        <div className="record-grid">
          {companies.map((company) => (
            <Link
              key={company.id}
              className="record-card"
              href={`/companies/${company.id}`}
            >
              <div>
                <span className="record-title">{company.name}</span>
                <span className="record-subtitle">
                  {company.employeeCount || "Employee count not set"}
                </span>
                <span className="record-meta">HR: {company.hrEmail}</span>
              </div>
              <span className="chevron">Manage</span>
            </Link>
          ))}
        </div>

        {companies.length === 0 && (
          <div className="detail-card">
            <h3>No companies yet</h3>
            <p>
              Create a company record, then come back here to manage its
              details.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
