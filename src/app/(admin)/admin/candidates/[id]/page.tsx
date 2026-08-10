import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

type Candidate = {
  id: string;
  name: string;
  email: string;
  status: string;
  gpa?: number;
  jobrole?: string;
  phone?: string;
  address?: string;
  portfolioUrl?: string;
  employmentStatus?: string;
  currentOrg?: string;
  currentPosition?: string;
  personalStatement?: string;
  aboutMe?: string;
  socialLinks?: { platformName: string; profileUrl: string }[];
  skills?: { skillName: string; level: string }[];
  experience?: {
    companyName: string;
    startDate: string;
    endDate?: string;
    roleDescription: string;
  }[];
  education?: {
    degreeTitle: string;
    fieldOfStudy: string;
    organization: string;
    startDate: string;
    endDate: string;
    honors?: string;
  }[];
};

export default function CandidatePage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<Candidate | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/candidates/${id}`)
      .then((r) => r.json())
      .then(setItem);
  }, [id]);

  if (!item)
    return (
      <Layout>
        <div style={{ padding: 20 }}>Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="detail-page">
        <div className="detail-card">
          <span className="eyebrow">Candidate profile</span>
          <h1>{item.name}</h1>

          <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <h3>Contact & Summary</h3>
              <dl className="detail-list">
                <div>
                  <dt>Email</dt>
                  <dd>{item.email}</dd>
                </div>
                {item.phone && (
                  <div>
                    <dt>Phone</dt>
                    <dd>{item.phone}</dd>
                  </div>
                )}
                {item.address && (
                  <div>
                    <dt>Address</dt>
                    <dd>{item.address}</dd>
                  </div>
                )}
                {item.portfolioUrl && (
                  <div>
                    <dt>Portfolio</dt>
                    <dd>
                      <a
                        href={item.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.portfolioUrl}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className={`status-pill status-${item.status}`}>
                      {item.status}
                    </span>
                  </dd>
                </div>
                {item.jobrole && (
                  <div>
                    <dt>Role</dt>
                    <dd>{item.jobrole}</dd>
                  </div>
                )}
                {item.gpa !== undefined && (
                  <div>
                    <dt>GPA</dt>
                    <dd>{item.gpa}</dd>
                  </div>
                )}
                {item.employmentStatus && (
                  <div>
                    <dt>Employment</dt>
                    <dd>{item.employmentStatus}</dd>
                  </div>
                )}
              </dl>

              {item.personalStatement && (
                <>
                  <h3>Personal statement</h3>
                  <p>{item.personalStatement}</p>
                </>
              )}

              {item.aboutMe && (
                <>
                  <h3>About</h3>
                  <p>{item.aboutMe}</p>
                </>
              )}

              {item.socialLinks && item.socialLinks.length > 0 && (
                <>
                  <h3>Social</h3>
                  <ul>
                    {item.socialLinks.map((s) => (
                      <li key={s.profileUrl}>
                        <a href={s.profileUrl} target="_blank" rel="noreferrer">
                          {s.platformName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div style={{ width: 360 }}>
              {item.skills && item.skills.length > 0 && (
                <>
                  <h3>Skills</h3>
                  <ul>
                    {item.skills.map((s) => (
                      <li key={s.skillName}>
                        {s.skillName} — {s.level}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {item.experience && item.experience.length > 0 && (
                <>
                  <h3>Experience</h3>
                  <ul>
                    {item.experience.map((e, i) => (
                      <li key={i}>
                        <strong>{e.companyName}</strong> <br />
                        <small>
                          {e.startDate} — {e.endDate || "Present"}
                        </small>
                        <div>{e.roleDescription}</div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {item.education && item.education.length > 0 && (
                <>
                  <h3>Education</h3>
                  <ul>
                    {item.education.map((ed, i) => (
                      <li key={i}>
                        <strong>{ed.degreeTitle}</strong>, {ed.organization}{" "}
                        <br />
                        <small>
                          {ed.startDate} — {ed.endDate}
                        </small>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
