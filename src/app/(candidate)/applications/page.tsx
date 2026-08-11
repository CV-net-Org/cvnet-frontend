//candidate applications page

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search, ChevronDown, Briefcase, Loader2,
  Building2, CheckCircle2, X, Send, User, Filter,
  AlertTriangle, ArrowLeft, Trash2, Plus, MapPin, DollarSign,
  ChevronRight, Bell, ArrowRight
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";
import apiClient from "@/lib/apiClient"; // Adjust path if necessary

// --- TYPES & CONFIG ---
export type ApplicationRecord = {
  id: string; role: string; company: string; location: string; date: string; status: string;
};

type JobListing = {
  id: string; title: string; companyName: string; companyLogo: string | null;
  categoryName: string;
  location: string | null; workplaceType: string; employmentType: string;
  salaryRange: string | null; currency: string; description: string;
  responsibilities: string; createdAt: string; skillsJson: string;
  educationsJson: string; experienceJson: string;
};

type TargetProfile = {
  id: string; jobRole: string; personalStatement: string;
};

// Review Form State Type
type ReviewData = {
  jobRole: string;
  personalStatement: string;
  aboutMe: string;
  portfolioUrl: string;
  cvUrl: string;
  coverLetter: string;
  matchScore: number;
  industryScore: number;
  skills: { skillName: string; level: string }[];
  experience: { companyName: string; startDate: string; roleDescription: string }[];
};

// ─── Design system (mirrors dashboard) ─────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  "In Review": { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  "Interviewing": { bg: "#f5f3ff", color: "#7c3aed", dot: "#8b5cf6" },
  "Pending": { bg: "#f8fafc", color: "#475569", dot: "#94a3b8" },
  "Rejected": { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e" },
  "Offer Received": { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};
function getStatus(s: string) { return STATUS_CONFIG[s] ?? STATUS_CONFIG["Pending"]; }

function StatusBadge({ status }: { status: string }) {
  const cfg = getStatus(status);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-100 ${className}`}>{children}</div>;
}

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{label}</p>
        <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-none">{value}</span>
      </div>
    </div>
  );
}

const cleanString = (str: string) => {
  if (!str) return "";
  return str.replace(/\s*\([A-Za-z0-9_-]+\)$/, '').trim();
};

export default function UnifiedApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"find-jobs" | "my-applications">("find-jobs");
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [profiles, setProfiles] = useState<TargetProfile[]>([]);

  // UI States
  const [filterStatus, setFilterStatus] = useState("All");
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [selectedJobCategory, setSelectedJobCategory] = useState("All");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Review Application States
  const [isReviewing, setIsReviewing] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    jobRole: "", personalStatement: "", aboutMe: "", portfolioUrl: "", cvUrl: "", coverLetter: "", matchScore: 0, industryScore: 0, skills: [], experience: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const [jobsRes, appsRes, profilesRes] = await Promise.all([
          apiClient.get("/api/CandidateJob/active").catch(() => ({ data: [] })),
          apiClient.get("/api/Application/my-applications").catch(() => ({ data: [] })),
          apiClient.get("/api/Application/my-profiles").catch(() => ({ data: [] }))
        ]);

        setJobs(jobsRes.data || []);
        setApplications(appsRes.data || []);
        setProfiles(profilesRes.data || []);
        if (profilesRes.data?.length > 0) setSelectedProfileId(profilesRes.data[0].id);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => { if (user) fetchData(); });
    return () => unsubscribe();
  }, []);

  const availableCategories = useMemo(() => {
    const cats = jobs.map(j => cleanString(j.categoryName)).filter(Boolean);
    return ["All", ...Array.from(new Set(cats))];
  }, [jobs]);

  const recommendedJobs = useMemo(() => {
    let sortedJobs = [...jobs];
    if (selectedJobCategory !== "All") sortedJobs = sortedJobs.filter(j => cleanString(j.categoryName) === selectedJobCategory);
    if (jobSearchQuery) {
      const q = jobSearchQuery.toLowerCase();
      sortedJobs = sortedJobs.filter(j => cleanString(j.title).toLowerCase().includes(q) || cleanString(j.companyName).toLowerCase().includes(q));
    }
    if (profiles.length > 0 && !jobSearchQuery && selectedJobCategory === "All") {
      const targetRoles = profiles.map(p => cleanString(p.jobRole).toLowerCase());
      sortedJobs.sort((a, b) => {
        const aMatches = targetRoles.some(role => cleanString(a.title).toLowerCase().includes(role));
        const bMatches = targetRoles.some(role => cleanString(b.title).toLowerCase().includes(role));
        return (aMatches === bMatches) ? 0 : aMatches ? -1 : 1;
      });
    }
    return sortedJobs;
  }, [jobs, profiles, jobSearchQuery, selectedJobCategory]);

  const filteredApps = applications.filter((a) => {
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    const matchesSearch = cleanString(a.role).toLowerCase().includes(appSearchQuery.toLowerCase()) || cleanString(a.company).toLowerCase().includes(appSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = useMemo(() => [
    { label: "Total Applied", value: filteredApps.length, icon: Briefcase, accent: "#2563eb" },
    { label: "Rejected Applications", value: filteredApps.filter(a => a.status === "Rejected").length, icon: X, accent: "#e11d48" },
    { label: "Offers Received", value: filteredApps.filter(a => a.status === "Offer Received").length, icon: CheckCircle2, accent: "#16a34a" }
  ], [filteredApps]);

  const parseJson = (jsonStr: string, fallback: any) => { try { return JSON.parse(jsonStr); } catch { return fallback; } };

  // --- REVIEW FLOW METHODS ---
  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !selectedProfileId) return;
    setIsFetchingProfile(true);

    try {
      const [profileRes, matrixRes] = await Promise.all([
        apiClient.get(`/api/Application/profile-details/${selectedProfileId}`),
        apiClient.get(`/api/Dashboard/readiness-matrix?profileId=${selectedProfileId}`).catch(() => ({ data: { matchScore: 0, industryScore: 80 } })) // Fallback if matrix fails
      ]);

      setReviewData({
        jobRole: profileRes.data.jobRole || "",
        personalStatement: profileRes.data.personalStatement || "",
        aboutMe: profileRes.data.aboutMe || "",
        portfolioUrl: profileRes.data.portfolioUrl || "",
        cvUrl: profileRes.data.cvUrl || "",
        coverLetter: `Dear Hiring Team at ${cleanString(selectedJob.companyName)},\n\I am writing to express my interest in the ${cleanString(selectedJob.title)} position. I believe my skills and experience align well with your requirements.\n\nThank you for your consideration.`,
        matchScore: matrixRes.data.matchScore || 0,
        industryScore: matrixRes.data.industryScore || 85,
        skills: profileRes.data.skills || [],
        experience: profileRes.data.experience || []
      });
      setIsReviewing(true);
    } catch (error: any) {
      alert("Failed to load profile details for review.");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!selectedJob) return;
    setIsApplying(true);

    try {
      const token = await auth.currentUser?.getIdToken();

      const payload = {
        JobId: selectedJob.id,
        ProfileId: selectedProfileId,
        CoverLetter: reviewData.coverLetter,
        JobRole: reviewData.jobRole,
        PersonalStatement: reviewData.personalStatement,
        AboutMe: reviewData.aboutMe,
        PortfolioUrl: reviewData.portfolioUrl,
        CvUrl: reviewData.cvUrl,
        MatchScore: reviewData.matchScore,
        IndustryScore: reviewData.industryScore,
        // CompanySkillMatchScore is removed! Backend will calculate it.
        SkillsJson: JSON.stringify(reviewData.skills),
        ExperienceJson: JSON.stringify(reviewData.experience)
      };

      await apiClient.post("/api/Application/apply", payload);

      alert("Application Submitted Successfully!");
      setSelectedJob(null);
      setIsReviewing(false);
      setActiveTab("my-applications");
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to submit application.");
    } finally {
      setIsApplying(false);
    }
  };

  // State Updaters for Editable Form
  const updateField = (field: keyof ReviewData, value: string) => setReviewData(prev => ({ ...prev, [field]: value }));
  const updateArray = (collection: "skills" | "experience", index: number, field: string, value: string) => {
    setReviewData(prev => {
      const newArr = [...prev[collection]] as any[];
      newArr[index] = { ...newArr[index], [field]: value };
      return { ...prev, [collection]: newArr };
    });
  };
  const removeArrayItem = (collection: "skills" | "experience", index: number) => {
    setReviewData(prev => {
      const newArr = [...prev[collection]];
      newArr.splice(index, 1);
      return { ...prev, [collection]: newArr };
    });
  };

  // ── Top bar (mirrors dashboard) ──────────────────────────────────────────────

  const TopBar = (
    <header className="hidden lg:block bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold text-slate-900 hidden sm:block">CVNet</span>
          <ChevronRight size={14} className="text-slate-300 hidden sm:block" />
          <span className="text-sm font-semibold text-slate-400 hidden sm:block">Career Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <Bell size={15} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
          </button>
        </div>
      </div>
    </header>
  );

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50">
      {TopBar}
      <div className="flex items-center justify-center min-h-[70vh]"><Loader2 className="animate-spin text-blue-600" size={36} /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {TopBar}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col flex-1 min-h-0 w-full">
        <div className="mb-5 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Career portal</h1>
          <p className="text-sm text-slate-500 mt-0.5">Browse open roles and track your applications.</p>

          <div className="flex gap-1 mt-5 border-b border-slate-100">
            <button onClick={() => { setActiveTab("find-jobs"); setSelectedJob(null); setIsReviewing(false); }}
              className={`px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === "find-jobs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              Find Jobs
            </button>
            <button onClick={() => setActiveTab("my-applications")}
              className={`px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === "my-applications" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              My Applications
            </button>
          </div>
        </div>

        {activeTab === "find-jobs" && (
          <div className="flex gap-5 flex-1 min-h-0 relative">

            {/* LEFT: JOB LIST */}
            <div className={`flex-1 flex flex-col h-full ${selectedJob ? 'hidden lg:flex lg:max-w-md' : 'w-full'}`}>
              <div className="flex flex-col sm:flex-row gap-2.5 mb-4 shrink-0">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={jobSearchQuery} onChange={(e) => setJobSearchQuery(e.target.value)} placeholder="Search title or company..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
                </div>
                <div className="relative shrink-0 sm:w-48">
                  <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select value={selectedJobCategory} onChange={(e) => setSelectedJobCategory(e.target.value)} className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none cursor-pointer transition-all">
                    {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="overflow-y-auto pr-1 space-y-2.5 pb-6">
                {recommendedJobs.length === 0 ? (
                  <div className="text-center p-8 bg-white rounded-2xl border border-slate-100"><p className="text-sm text-slate-500 font-semibold">No jobs found matching your criteria.</p></div>
                ) : (
                  recommendedJobs.map((job) => (
                    <div key={job.id} onClick={() => { setSelectedJob(job); setIsReviewing(false); }} className={`p-4 rounded-2xl border cursor-pointer transition-colors ${selectedJob?.id === job.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                      <div className="flex items-start gap-3">
                        {job.companyLogo && job.companyLogo.includes("http") ? (
                          <img src={job.companyLogo} alt={job.companyName} className="w-11 h-11 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpeg"; }} />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0"><Building2 size={18} className="text-slate-400" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-slate-900 truncate">{cleanString(job.title)}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{cleanString(job.companyName)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-lg"><Briefcase size={10} /> {job.workplaceType}</span>
                        {job.salaryRange && <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg"><DollarSign size={10} /> {job.currency} {job.salaryRange}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: APPLY PANEL / REVIEW PANEL */}
            {selectedJob ? (
              <SectionCard className="flex-[2] overflow-hidden flex flex-col h-full relative z-10">

                {/* Common Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60 relative shrink-0">
                  <button onClick={() => { setSelectedJob(null); setIsReviewing(false); }} className="lg:hidden absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-slate-500"><X size={15} /></button>
                  <div className="flex items-center gap-3.5">
                    {selectedJob.companyLogo && selectedJob.companyLogo.includes("http") ? (
                      <img src={selectedJob.companyLogo} alt={selectedJob.companyName} className="w-14 h-14 rounded-2xl object-cover bg-white border border-slate-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpeg"; }} />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0"><Building2 size={22} className="text-slate-400" /></div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">{cleanString(selectedJob.title)}</h2>
                      <p className="text-sm font-semibold text-blue-600 mt-0.5">{cleanString(selectedJob.companyName)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto h-full space-y-6">

                  {/* STATE 1: VIEWING JOB DESCRIPTION */}
                  {!isReviewing ? (
                    <>
                      {/* Job Highlights Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                          <MapPin size={13} /> {selectedJob.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                          <Briefcase size={13} /> {selectedJob.workplaceType} · {selectedJob.employmentType}
                        </span>
                        {selectedJob.salaryRange && (
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                            <DollarSign size={13} /> {selectedJob.currency} {selectedJob.salaryRange}
                          </span>
                        )}
                      </div>

                      {selectedJob.description && (
                        <section>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Overview</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.description}</p>
                        </section>
                      )}

                      {/* Qualifications (Skills, Education, Experience) */}
                      <section className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Required Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {parseJson(selectedJob.skillsJson, []).map((s: any, i: number) => (
                              <span key={i} className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-2.5 py-1 rounded-lg">
                                {s.name} {s.showLevel && <span className="text-slate-400 ml-1 font-medium text-[10px]">({s.level})</span>}
                              </span>
                            ))}
                            {parseJson(selectedJob.skillsJson, []).length === 0 && <span className="text-xs text-slate-400">None explicitly stated.</span>}
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Experience</h4>
                            {parseJson(selectedJob.experienceJson, {}).level ? (
                              <p className="text-sm font-semibold text-slate-700">{parseJson(selectedJob.experienceJson, {}).level} <span className="text-slate-400 font-medium ml-1">({parseJson(selectedJob.experienceJson, {}).min}+ years)</span></p>
                            ) : <p className="text-sm text-slate-400">Not specified</p>}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Education</h4>
                            {parseJson(selectedJob.educationsJson, []).map((e: any, i: number) => (
                              <p key={i} className="text-sm font-semibold text-slate-700 flex items-center gap-2 mt-1"><CheckCircle2 size={13} className="text-blue-500" /> {e.degree}</p>
                            ))}
                            {parseJson(selectedJob.educationsJson, []).length === 0 && <p className="text-sm text-slate-400">Not specified</p>}
                          </div>
                        </div>
                      </section>

                      {/* Responsibilities */}
                      {selectedJob.responsibilities && (
                        <section>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Key Responsibilities</h3>
                          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                            {selectedJob.responsibilities}
                          </div>
                        </section>
                      )}

                      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-1.5">Begin application</h3>
                        <p className="text-xs text-slate-600 mb-4">Select a profile track. You will be able to review and edit your data before final submission.</p>

                        {profiles.length > 0 ? (
                          <form onSubmit={handleStartReview} className="space-y-3">
                            <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                              {profiles.map(p => <option key={p.id} value={p.id}>{cleanString(p.jobRole)} (Profile)</option>)}
                            </select>
                            <button type="submit" disabled={isFetchingProfile} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70">
                              {isFetchingProfile ? <Loader2 size={15} className="animate-spin" /> : <User size={15} />}
                              Review Profile Details
                            </button>
                          </form>
                        ) : (
                          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                            <p className="text-sm font-semibold text-slate-700">No target profiles found</p>
                            <Link href="/cv" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">Go to CV Builder <ArrowRight size={11} /></Link>
                          </div>
                        )}
                      </section>
                    </>
                  ) : (

                    /* STATE 2: EDITING AND REVIEWING */
                    <div>
                      <button onClick={() => setIsReviewing(false)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-5 transition-colors">
                        <ArrowLeft size={14} /> Back to job details
                      </button>

                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 mb-6">
                        <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-900">Review your submission</p>
                          <p className="text-xs text-amber-700 mt-1 leading-relaxed">There is no going back once submitted. Please make sure all details below are correct. Editing these fields will only affect this specific application.</p>
                        </div>
                      </div>

                      <div className="space-y-5">

                        {/* Personal Info & Core Details */}
                        <section className="bg-slate-50 border border-slate-100 p-4 sm:p-5 rounded-2xl">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">Core Profile Information</h4>
                          <div className="space-y-3.5">
                            <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Role Title</label><input value={reviewData.jobRole} onChange={(e) => updateField("jobRole", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" /></div>
                            <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Portfolio URL</label><input type="url" value={reviewData.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" /></div>
                            <div><label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Personal Statement</label><textarea value={reviewData.personalStatement} onChange={(e) => updateField("personalStatement", e.target.value)} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" /></div>
                          </div>
                        </section>

                        {/* Cover Letter */}
                        <section className="bg-slate-50 border border-slate-100 p-4 sm:p-5 rounded-2xl">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5">Cover Letter / Note</h4>
                          <textarea value={reviewData.coverLetter} onChange={(e) => updateField("coverLetter", e.target.value)} rows={5} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                        </section>

                        {/* Skills */}
                        <section className="bg-slate-50 border border-slate-100 p-4 sm:p-5 rounded-2xl">
                          <div className="flex items-center justify-between mb-3.5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Targeted Skills</h4>
                            <button onClick={() => setReviewData(prev => ({ ...prev, skills: [...prev.skills, { skillName: "", level: "Beginner" }] }))} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={13} /> Add Skill</button>
                          </div>
                          <div className="space-y-2.5">
                            {reviewData.skills.length === 0 && <p className="text-xs text-slate-400">No skills attached.</p>}
                            {reviewData.skills.map((skill, idx) => (
                              <div key={idx} className="flex gap-2 items-center bg-white p-1.5 rounded-xl border border-slate-200">
                                <input placeholder="Skill Name" value={skill.skillName} onChange={e => updateArray("skills", idx, "skillName", e.target.value)} className="border-0 px-2 py-1.5 text-sm flex-1 outline-none font-semibold" />
                                <select value={skill.level} onChange={e => updateArray("skills", idx, "level", e.target.value)} className="border-l border-slate-100 pl-2 py-1.5 text-xs font-semibold outline-none bg-transparent text-slate-500">
                                  <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                                </select>
                                <button onClick={() => removeArrayItem("skills", idx)} className="text-slate-300 hover:text-red-500 px-2 border-l border-slate-100"><Trash2 size={14} /></button>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Experience */}
                        <section className="bg-slate-50 border border-slate-100 p-4 sm:p-5 rounded-2xl">
                          <div className="flex items-center justify-between mb-3.5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Included Experience</h4>
                            <button onClick={() => setReviewData(prev => ({ ...prev, experience: [...prev.experience, { companyName: "", roleDescription: "", startDate: "" }] }))} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={13} /> Add Experience</button>
                          </div>
                          <div className="space-y-3">
                            {reviewData.experience.length === 0 && <p className="text-xs text-slate-400">No experience attached.</p>}
                            {reviewData.experience.map((exp, idx) => (
                              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 relative group">
                                <button onClick={() => removeArrayItem("experience", idx)} className="absolute top-3.5 right-3.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                <div className="grid grid-cols-2 gap-3 pr-7">
                                  <div><label className="text-[10px] uppercase font-bold text-slate-400">Company</label><input value={exp.companyName || ""} onChange={e => updateArray("experience", idx, "companyName", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500" /></div>
                                  <div><label className="text-[10px] uppercase font-bold text-slate-400">Start Date</label><input type="date" value={exp.startDate || ""} onChange={e => updateArray("experience", idx, "startDate", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none text-slate-600 focus:border-blue-500" /></div>
                                  <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-slate-400">Role / Title</label><input value={exp.roleDescription || ""} onChange={e => updateArray("experience", idx, "roleDescription", e.target.value)} className="w-full border-b border-slate-200 py-1 text-sm outline-none font-semibold focus:border-blue-500" /></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Final Confirm Button */}
                        <button
                          onClick={handleConfirmSubmit}
                          disabled={isApplying}
                          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-70 mt-2"
                        >
                          {isApplying ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                          {isApplying ? "Committing Application..." : "Confirm & Submit Application"}
                        </button>

                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>
            ) : (
              <div className="hidden lg:flex flex-[2] bg-white border border-dashed border-slate-200 rounded-2xl items-center justify-center flex-col text-slate-400">
                <Briefcase size={40} className="mb-3 opacity-40" />
                <p className="text-sm font-semibold">Select a job to view details & apply</p>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: MY APPLICATIONS --- */}
        {activeTab === "my-applications" && (
          <div className="flex-1 overflow-y-auto pb-10 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.map(({ label, value, icon, accent }) => (
                <StatCard key={label} label={label} value={value} icon={icon} accent={accent} />
              ))}
            </div>

            <SectionCard>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-50 bg-slate-50/50 rounded-t-2xl">
                <div className="relative w-full sm:w-auto">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={appSearchQuery} onChange={(e) => setAppSearchQuery(e.target.value)} placeholder="Search your applications..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-full sm:w-64 transition-all" />
                </div>
                <div className="relative w-full sm:w-auto">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="appearance-none w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
                    {["All", ...Object.keys(STATUS_CONFIG)].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-2 text-center px-6">
                  <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <Briefcase size={18} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No applications found</p>
                  <p className="text-xs text-slate-400">Try adjusting your search or filter.</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-50">
                          {["Role & company", "Status", "Applied date", "Action"].map((h, i) => (
                            <th key={i} className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-5 sm:px-6 py-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApps.map((a) => (
                          <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 sm:px-6 py-3.5">
                              <p className="text-sm font-semibold text-slate-900">{cleanString(a.role)}</p>
                              <p className="text-xs text-slate-400">{cleanString(a.company)} · {a.location || "Remote"}</p>
                            </td>
                            <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={a.status} /></td>
                            <td className="px-5 sm:px-6 py-3.5"><span className="text-xs font-medium text-slate-400 whitespace-nowrap">{a.date}</span></td>
                            <td className="px-5 sm:px-6 py-3.5">
                              <Link href={`/applications/${a.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View details</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="sm:hidden divide-y divide-slate-50">
                    {filteredApps.map((a) => (
                      <Link key={a.id} href={`/applications/${a.id}`} className="px-4 py-3.5 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{cleanString(a.role)}</p>
                          <p className="text-xs text-slate-400 truncate">{cleanString(a.company)} · {a.date}</p>
                        </div>
                        <StatusBadge status={a.status} />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}