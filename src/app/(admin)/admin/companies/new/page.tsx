import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [siteLink, setSiteLink] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [hrContactPhone, setHrContactPhone] = useState("");
  const [employeeCount, setEmployeeCount] = useState("SMALL_2_10");
  const [saving, setSaving] = useState(false);

  const canSave =
    name.trim().length > 0 && isValidEmail(hrEmail) && isValidUrl(siteLink);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    const response = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        logoUrl,
        description,
        siteLink,
        hrEmail,
        hrContactPhone,
        employeeCount,
      }),
    });
    if (response.ok) {
      const created = await response.json();
      router.push(`/companies/${created.id}`);
      return;
    }
    alert(await response.text());
    setSaving(false);
  }

  return (
    <Layout>
      <div className="form-page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Create</span>
            <h1>New company</h1>
            <p>Create a company profile without going through recruiters.</p>
          </div>
        </div>

        <form className="form detail-card" onSubmit={handleSubmit}>
          <label>
            Company name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label>
            HR email
            <input
              value={hrEmail}
              onChange={(event) => setHrEmail(event.target.value)}
            />
            {hrEmail.length > 0 && !isValidEmail(hrEmail) && (
              <div className="field-error">Enter a valid HR email</div>
            )}
          </label>

          <label>
            Site link
            <input
              value={siteLink}
              onChange={(event) => setSiteLink(event.target.value)}
            />
            {siteLink.length > 0 && !isValidUrl(siteLink) && (
              <div className="field-error">Enter a valid URL</div>
            )}
          </label>

          <label>
            Logo URL
            <input
              value={logoUrl}
              onChange={(event) => setLogoUrl(event.target.value)}
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </label>

          <label>
            HR contact phone
            <input
              value={hrContactPhone}
              onChange={(event) => setHrContactPhone(event.target.value)}
            />
          </label>

          <label>
            Employee count
            <select
              value={employeeCount}
              onChange={(event) => setEmployeeCount(event.target.value)}
            >
              <option value="SOLO">SOLO</option>
              <option value="SMALL_2_10">SMALL_2_10</option>
              <option value="MID_SIZE_11_50">MID_SIZE_11_50</option>
              <option value="GROWING_51_200">GROWING_51_200</option>
              <option value="ENTERPRISE_201_1000">ENTERPRISE_201_1000</option>
              <option value="GLOBAL_1000_PLUS">GLOBAL_1000_PLUS</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              className="primary-button"
              type="submit"
              disabled={!canSave || saving}
            >
              {saving ? "Creating…" : "Create company"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => router.push("/companies")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
