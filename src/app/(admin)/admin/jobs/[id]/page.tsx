import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

type Job = {
  id: string;
  title: string;
  employmentType?: string;
  workplaceType?: string;
  location?: string;
  openings?: number;
  description?: string;
  responsibilities?: string;
};

export default function JobPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then(setJob);
  }, [id]);

  if (!job)
    return (
      <Layout>
        <div style={{ padding: 20 }}>Loading…</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="detail-page">
        <div className="detail-card">
          <span className="eyebrow">Job post</span>
          <h1>{job.title}</h1>
          <dl className="detail-list">
            {job.location && (
              <div>
                <dt>Location</dt>
                <dd>{job.location}</dd>
              </div>
            )}
            {job.openings !== undefined && (
              <div>
                <dt>Openings</dt>
                <dd>{job.openings}</dd>
              </div>
            )}
            {job.employmentType && (
              <div>
                <dt>Employment</dt>
                <dd>{job.employmentType}</dd>
              </div>
            )}
          </dl>

          {job.description && (
            <>
              <h3>Description</h3>
              <p>{job.description}</p>
            </>
          )}

          {job.responsibilities && (
            <>
              <h3>Responsibilities</h3>
              <p>{job.responsibilities}</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
