import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import {
  Company,
  CompanyLocation,
  HiredRecord,
  Job,
  JobApplication,
  JobEducationRequirement,
  JobExperienceRequirement,
  JobSkillRequirement,
} from "../api/_data";

const employeeCountOptions = [
  "SOLO",
  "SMALL_2_10",
  "MID_SIZE_11_50",
  "GROWING_51_200",
  "ENTERPRISE_201_1000",
  "GLOBAL_1000_PLUS",
];

const employmentTypeOptions = [
  "INTERNSHIP",
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
];
const workplaceTypeOptions = ["REMOTE", "HYBRID", "ONSITE"];
const skillLevelOptions = ["BEGINNER", "INTERMEDIATE", "EXPERT"];
const applicationStatusOptions = [
  "Pending",
  "Reviewed",
  "Shortlisted",
  "Rejected",
  "Hired",
];

function requestJson(path: string, options?: RequestInit) {
  return fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.json();
  });
}

function toDateTimeLocalValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoString(value: string) {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

export default function CompanyPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [company, setCompany] = useState<Company | null>(null);
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [experienceRequirements, setExperienceRequirements] = useState<
    JobExperienceRequirement[]
  >([]);
  const [skillRequirements, setSkillRequirements] = useState<
    JobSkillRequirement[]
  >([]);
  const [educationRequirements, setEducationRequirements] = useState<
    JobEducationRequirement[]
  >([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [hiredRecords, setHiredRecords] = useState<HiredRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [siteLink, setSiteLink] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [hrContactPhone, setHrContactPhone] = useState("");
  const [employeeCount, setEmployeeCount] = useState("SMALL_2_10");

  const [countryName, setCountryName] = useState("");
  const [isHeadquarters, setIsHeadquarters] = useState(false);

  const [jobCategory, setJobCategory] = useState("");
  const [title, setTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("FULL_TIME");
  const [workplaceType, setWorkplaceType] = useState("HYBRID");
  const [location, setLocation] = useState("");
  const [openings, setOpenings] = useState("1");
  const [jobDescription, setJobDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [jobHrContactEmail, setJobHrContactEmail] = useState("");

  const [levelName, setLevelName] = useState("");
  const [minYears, setMinYears] = useState("0");
  const [maxYears, setMaxYears] = useState("");
  const [skillName, setSkillName] = useState("");
  const [requiredLevel, setRequiredLevel] = useState("BEGINNER");
  const [degreeName, setDegreeName] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("Pending");
  const [hiredName, setHiredName] = useState("");
  const [hiredEmail, setHiredEmail] = useState("");

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );

  async function loadCompany(currentId: string) {
    setLoading(true);
    const [companyData, locationsData, jobsData] = await Promise.all([
      requestJson(`/api/companies/${currentId}`),
      requestJson(`/api/company-locations?companyId=${currentId}`),
      requestJson(`/api/jobs?companyId=${currentId}`),
    ]);
    setCompany(companyData);
    setLocations(locationsData);
    setJobs(jobsData);
    setName(companyData?.name || "");
    setLogoUrl(companyData?.logoUrl || "");
    setDescription(companyData?.description || "");
    setSiteLink(companyData?.siteLink || "");
    setHrEmail(companyData?.hrEmail || "");
    setHrContactPhone(companyData?.hrContactPhone || "");
    setEmployeeCount(companyData?.employeeCount || "SMALL_2_10");
    if (jobsData.length > 0) {
      setSelectedJobId((current) => current || jobsData[0].id);
    } else {
      setSelectedJobId("");
    }
    setLoading(false);
  }

  async function loadJobData(jobId: string) {
    if (!jobId) {
      setExperienceRequirements([]);
      setSkillRequirements([]);
      setEducationRequirements([]);
      setApplications([]);
      setHiredRecords([]);
      return;
    }

    const [
      experienceData,
      skillData,
      educationData,
      applicationsData,
      hiredData,
    ] = await Promise.all([
      requestJson(`/api/job-experience?jobId=${jobId}`),
      requestJson(`/api/job-skills?jobId=${jobId}`),
      requestJson(`/api/job-education?jobId=${jobId}`),
      requestJson(`/api/job-applications?jobId=${jobId}`),
      requestJson(`/api/hired-records?jobId=${jobId}`),
    ]);

    setExperienceRequirements(experienceData);
    setSkillRequirements(skillData);
    setEducationRequirements(educationData);
    setApplications(applicationsData);
    setHiredRecords(hiredData);
  }

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    loadCompany(id).catch((error) => {
      alert(error instanceof Error ? error.message : "Failed to load company");
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!selectedJobId) {
      loadJobData("");
      return;
    }
    loadJobData(selectedJobId).catch((error) => {
      alert(error instanceof Error ? error.message : "Failed to load job data");
    });
  }, [selectedJobId]);

  async function refreshAll() {
    if (!id || typeof id !== "string") return;
    await loadCompany(id);
    if (selectedJobId) {
      await loadJobData(selectedJobId);
    }
  }

  async function handleUpdateCompany() {
    if (!id || typeof id !== "string") return;
    await requestJson(`/api/companies/${id}`, {
      method: "PUT",
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
    await refreshAll();
  }

  async function handleDeleteCompany() {
    if (!id || typeof id !== "string") return;
    if (!confirm("Delete this company and all of its jobs?")) return;
    await requestJson(`/api/companies/${id}`, {
      method: "DELETE",
    });
    router.push("/companies");
  }

  async function handleAddLocation() {
    if (!id || typeof id !== "string") return;
    await requestJson("/api/company-locations", {
      method: "POST",
      body: JSON.stringify({
        companyId: id,
        countryName,
        isHeadquarters,
      }),
    });
    setCountryName("");
    setIsHeadquarters(false);
    await refreshAll();
  }

  async function handleDeleteLocation(locationId: string) {
    await requestJson(`/api/company-locations?id=${locationId}`, {
      method: "DELETE",
    });
    await refreshAll();
  }

  async function handleCreateJob() {
    if (!id || typeof id !== "string") return;
    const created = await requestJson("/api/jobs", {
      method: "POST",
      body: JSON.stringify({
        companyId: id,
        jobCategory,
        title,
        employmentType,
        workplaceType,
        location,
        openings: Number(openings || 1),
        description: jobDescription,
        responsibilities,
        salaryRange,
        currency,
        applicationDeadline: toIsoString(applicationDeadline),
        hrContactEmail: jobHrContactEmail || hrEmail,
      }),
    });
    setJobCategory("");
    setTitle("");
    setEmploymentType("FULL_TIME");
    setWorkplaceType("HYBRID");
    setLocation("");
    setOpenings("1");
    setJobDescription("");
    setResponsibilities("");
    setSalaryRange("");
    setCurrency("LKR");
    setApplicationDeadline("");
    setJobHrContactEmail("");
    await refreshAll();
    setSelectedJobId(created.id);
  }

  async function handleDeleteJob(jobId: string) {
    await requestJson(`/api/jobs/${jobId}`, {
      method: "DELETE",
    });
    if (selectedJobId === jobId) {
      setSelectedJobId("");
    }
    await refreshAll();
  }

  async function handleAddExperience() {
    if (!selectedJobId) return;
    await requestJson("/api/job-experience", {
      method: "POST",
      body: JSON.stringify({
        jobId: selectedJobId,
        levelName,
        minYears: Number(minYears || 0),
        maxYears: maxYears ? Number(maxYears) : undefined,
      }),
    });
    setLevelName("");
    setMinYears("0");
    setMaxYears("");
    await loadJobData(selectedJobId);
  }

  async function handleDeleteExperience(recordId: string) {
    await requestJson(`/api/job-experience?id=${recordId}`, {
      method: "DELETE",
    });
    await loadJobData(selectedJobId);
  }

  async function handleAddSkill() {
    if (!selectedJobId) return;
    await requestJson("/api/job-skills", {
      method: "POST",
      body: JSON.stringify({
        jobId: selectedJobId,
        skillName,
        requiredLevel,
      }),
    });
    setSkillName("");
    setRequiredLevel("BEGINNER");
    await loadJobData(selectedJobId);
  }

  async function handleDeleteSkill(recordId: string) {
    await requestJson(`/api/job-skills?id=${recordId}`, {
      method: "DELETE",
    });
    await loadJobData(selectedJobId);
  }

  async function handleAddEducation() {
    if (!selectedJobId) return;
    await requestJson("/api/job-education", {
      method: "POST",
      body: JSON.stringify({
        jobId: selectedJobId,
        degreeName,
      }),
    });
    setDegreeName("");
    await loadJobData(selectedJobId);
  }

  async function handleDeleteEducation(recordId: string) {
    await requestJson(`/api/job-education?id=${recordId}`, {
      method: "DELETE",
    });
    await loadJobData(selectedJobId);
  }

  async function handleAddApplication() {
    if (!selectedJobId) return;
    await requestJson("/api/job-applications", {
      method: "POST",
      body: JSON.stringify({
        jobId: selectedJobId,
        userName: applicantName,
        userEmail: applicantEmail,
        status: applicationStatus,
      }),
    });
    setApplicantName("");
    setApplicantEmail("");
    setApplicationStatus("Pending");
    await loadJobData(selectedJobId);
  }

  async function handleUpdateApplication(
    applicationId: string,
    nextStatus: string,
  ) {
    await requestJson(`/api/job-applications?id=${applicationId}`, {
      method: "PUT",
      body: JSON.stringify({ status: nextStatus }),
    });
    await loadJobData(selectedJobId);
  }

  async function handleDeleteApplication(applicationId: string) {
    await requestJson(`/api/job-applications?id=${applicationId}`, {
      method: "DELETE",
    });
    await loadJobData(selectedJobId);
  }

  async function handleAddHiredRecord() {
    if (!selectedJobId) return;
    await requestJson("/api/hired-records", {
      method: "POST",
      body: JSON.stringify({
        jobId: selectedJobId,
        userName: hiredName,
        userEmail: hiredEmail,
      }),
    });
    setHiredName("");
    setHiredEmail("");
    await loadJobData(selectedJobId);
  }

  async function handleDeleteHiredRecord(recordId: string) {
    await requestJson(`/api/hired-records?id=${recordId}`, {
      method: "DELETE",
    });
    await loadJobData(selectedJobId);
  }

  if (loading || !company) {
    return (
      <Layout>
        <div style={{ padding: 20 }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="detail-page company-admin-page">
        <div className="detail-card">
          <div className="page-header" style={{ alignItems: "start" }}>
            <div>
              <span className="eyebrow">Company admin</span>
              <h1>{company.name}</h1>
              <p>
                Maintain the company profile and every downstream hiring record.
              </p>
            </div>
            <div className="action-links">
              <button
                className="primary-button"
                type="button"
                onClick={handleUpdateCompany}
              >
                Save company
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleDeleteCompany}
              >
                Delete company
              </button>
            </div>
          </div>

          <div className="company-summary-grid">
            <div className="detail-panel">
              <label>
                Company name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
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
                Site link
                <input
                  value={siteLink}
                  onChange={(event) => setSiteLink(event.target.value)}
                />
              </label>
              <label>
                HR email
                <input
                  value={hrEmail}
                  onChange={(event) => setHrEmail(event.target.value)}
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
                  {employeeCountOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="detail-panel" style={{ display: "grid", gap: 12 }}>
              <div className="stat-card">
                <span className="stat-label">Locations</span>
                <strong>{locations.length}</strong>
                <p>Company offices and headquarters.</p>
              </div>
              <div className="stat-card">
                <span className="stat-label">Jobs</span>
                <strong>{jobs.length}</strong>
                <p>Active posts tied to this company.</p>
              </div>
              <div className="stat-card">
                <span className="stat-label">Selected job</span>
                <strong>{selectedJob?.title || "None"}</strong>
                <p>
                  Manage experience, skills, education, applications, and hires
                  here.
                </p>
              </div>
              {company.logoUrl && (
                <div
                  className="stat-card"
                  style={{ display: "grid", justifyItems: "start", gap: 12 }}
                >
                  <span className="stat-label">Logo preview</span>
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    style={{
                      width: 96,
                      height: 96,
                      objectFit: "cover",
                      borderRadius: 18,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="company-admin-grid">
          <section className="detail-card admin-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Locations</span>
                <h2>Company locations</h2>
              </div>
            </div>
            <div className="stack-list">
              {locations.map((item) => (
                <div key={item.id} className="record-card record-card-row">
                  <div>
                    <span className="record-title">{item.countryName}</span>
                    <span className="record-subtitle">
                      {item.isHeadquarters ? "Headquarters" : "Branch location"}
                    </span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDeleteLocation(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mini-form-grid">
              <label>
                Country name
                <input
                  value={countryName}
                  onChange={(event) => setCountryName(event.target.value)}
                />
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={isHeadquarters}
                  onChange={(event) => setIsHeadquarters(event.target.checked)}
                />
                Head office
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={handleAddLocation}
              >
                Add location
              </button>
            </div>
          </section>

          <section className="detail-card admin-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Jobs</span>
                <h2>Job posts</h2>
              </div>
            </div>
            <div className="stack-list">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`record-card record-card-row ${selectedJobId === job.id ? "record-card-selected" : ""}`}
                >
                  <button
                    className="record-card-button"
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div>
                      <span className="record-title">{job.title}</span>
                      <span className="record-subtitle">
                        {job.employmentType} · {job.workplaceType}
                      </span>
                      <span className="record-meta">
                        {job.location || "No location set"}
                      </span>
                    </div>
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="mini-form-grid wide-form-grid">
              <label>
                Job category
                <input
                  value={jobCategory}
                  onChange={(event) => setJobCategory(event.target.value)}
                />
              </label>
              <label>
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label>
                Employment type
                <select
                  value={employmentType}
                  onChange={(event) => setEmploymentType(event.target.value)}
                >
                  {employmentTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Workplace type
                <select
                  value={workplaceType}
                  onChange={(event) => setWorkplaceType(event.target.value)}
                >
                  {workplaceTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Location
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </label>
              <label>
                Openings
                <input
                  value={openings}
                  onChange={(event) => setOpenings(event.target.value)}
                  type="number"
                  min={1}
                />
              </label>
              <label>
                Salary range
                <input
                  value={salaryRange}
                  onChange={(event) => setSalaryRange(event.target.value)}
                />
              </label>
              <label>
                Currency
                <input
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                />
              </label>
              <label>
                HR contact email
                <input
                  value={jobHrContactEmail}
                  onChange={(event) => setJobHrContactEmail(event.target.value)}
                />
              </label>
              <label>
                Application deadline
                <input
                  value={applicationDeadline}
                  onChange={(event) =>
                    setApplicationDeadline(event.target.value)
                  }
                  type="datetime-local"
                />
              </label>
              <label className="wide-field">
                Description
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  rows={3}
                />
              </label>
              <label className="wide-field">
                Responsibilities
                <textarea
                  value={responsibilities}
                  onChange={(event) => setResponsibilities(event.target.value)}
                  rows={3}
                />
              </label>
              <button
                className="primary-button wide-field"
                type="button"
                onClick={handleCreateJob}
              >
                Add job post
              </button>
            </div>
          </section>

          <section className="detail-card admin-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Experience</span>
                <h2>Experience requirements</h2>
              </div>
            </div>
            <div className="stack-list">
              {experienceRequirements.map((item) => (
                <div key={item.id} className="record-card record-card-row">
                  <div>
                    <span className="record-title">{item.levelName}</span>
                    <span className="record-subtitle">
                      {item.minYears} to {item.maxYears ?? "open"} years
                    </span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDeleteExperience(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mini-form-grid">
              <label>
                Level name
                <input
                  value={levelName}
                  onChange={(event) => setLevelName(event.target.value)}
                  disabled={!selectedJobId}
                />
              </label>
              <label>
                Min years
                <input
                  value={minYears}
                  onChange={(event) => setMinYears(event.target.value)}
                  type="number"
                  min={0}
                  disabled={!selectedJobId}
                />
              </label>
              <label>
                Max years
                <input
                  value={maxYears}
                  onChange={(event) => setMaxYears(event.target.value)}
                  type="number"
                  min={0}
                  disabled={!selectedJobId}
                />
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={handleAddExperience}
                disabled={!selectedJobId}
              >
                Add requirement
              </button>
            </div>
          </section>

          <section className="detail-card admin-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Skills</span>
                <h2>Skill requirements</h2>
              </div>
            </div>
            <div className="stack-list">
              {skillRequirements.map((item) => (
                <div key={item.id} className="record-card record-card-row">
                  <div>
                    <span className="record-title">{item.skillName}</span>
                    <span className="record-subtitle">
                      {item.requiredLevel}
                    </span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDeleteSkill(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mini-form-grid">
              <label>
                Skill name
                <input
                  value={skillName}
                  onChange={(event) => setSkillName(event.target.value)}
                  disabled={!selectedJobId}
                />
              </label>
              <label>
                Required level
                <select
                  value={requiredLevel}
                  onChange={(event) => setRequiredLevel(event.target.value)}
                  disabled={!selectedJobId}
                >
                  {skillLevelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={handleAddSkill}
                disabled={!selectedJobId}
              >
                Add skill
              </button>
            </div>
          </section>

          <section className="detail-card admin-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Education</span>
                <h2>Education requirements</h2>
              </div>
            </div>
            <div className="stack-list">
              {educationRequirements.map((item) => (
                <div key={item.id} className="record-card record-card-row">
                  <div>
                    <span className="record-title">{item.degreeName}</span>
                    <span className="record-subtitle">Degree requirement</span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDeleteEducation(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mini-form-grid">
              <label className="wide-field">
                Degree name
                <input
                  value={degreeName}
                  onChange={(event) => setDegreeName(event.target.value)}
                  disabled={!selectedJobId}
                />
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={handleAddEducation}
                disabled={!selectedJobId}
              >
                Add education
              </button>
            </div>
          </section>

          <section className="detail-card admin-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Applications</span>
                <h2>Job applications</h2>
              </div>
            </div>
            <div className="stack-list">
              {applications.map((item) => (
                <div
                  key={item.id}
                  className="record-card record-card-row app-record-row"
                >
                  <div>
                    <span className="record-title">{item.userName}</span>
                    <span className="record-subtitle">{item.userEmail}</span>
                    <span className="record-meta">
                      {item.appliedDate || "Pending date"}
                    </span>
                  </div>
                  <div className="inline-controls">
                    <select
                      value={item.status || "Pending"}
                      onChange={(event) =>
                        handleUpdateApplication(item.id, event.target.value)
                      }
                    >
                      {applicationStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleDeleteApplication(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mini-form-grid wide-form-grid">
              <label>
                Applicant name
                <input
                  value={applicantName}
                  onChange={(event) => setApplicantName(event.target.value)}
                  disabled={!selectedJobId}
                />
              </label>
              <label>
                Applicant email
                <input
                  value={applicantEmail}
                  onChange={(event) => setApplicantEmail(event.target.value)}
                  disabled={!selectedJobId}
                />
              </label>
              <label>
                Status
                <select
                  value={applicationStatus}
                  onChange={(event) => setApplicationStatus(event.target.value)}
                  disabled={!selectedJobId}
                >
                  {applicationStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={handleAddApplication}
                disabled={!selectedJobId}
              >
                Add application
              </button>
            </div>
          </section>

          <section className="detail-card admin-section">
            <div className="section-header">
              <div>
                <span className="eyebrow">Hires</span>
                <h2>Hired records</h2>
              </div>
            </div>
            <div className="stack-list">
              {hiredRecords.map((item) => (
                <div key={item.id} className="record-card record-card-row">
                  <div>
                    <span className="record-title">{item.userName}</span>
                    <span className="record-subtitle">{item.userEmail}</span>
                    <span className="record-meta">
                      {item.hiredDate || "Pending date"}
                    </span>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDeleteHiredRecord(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mini-form-grid">
              <label>
                Person name
                <input
                  value={hiredName}
                  onChange={(event) => setHiredName(event.target.value)}
                  disabled={!selectedJobId}
                />
              </label>
              <label>
                Person email
                <input
                  value={hiredEmail}
                  onChange={(event) => setHiredEmail(event.target.value)}
                  disabled={!selectedJobId}
                />
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={handleAddHiredRecord}
                disabled={!selectedJobId}
              >
                Add hire
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
