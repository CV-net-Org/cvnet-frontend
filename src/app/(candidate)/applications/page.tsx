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
import { useTheme } from "@/context/ThemeContext";

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
  const { isDark } = useTheme();
  const cfg = getStatus(status);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: isDark ? cfg.color + "30" : cfg.bg, color: isDark ? cfg.bg : cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { isDark } = useTheme();
  return <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} ${className}`}>{children}</div>;
}

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string;
}) {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: isDark ? accent + "30" : accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <span className={`text-xl sm:text-2xl font-black tabular-nums leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      </div>
    </div>
  );
}

const cleanString = (str: string) => {
  if (!str) return "";
  return str.replace(/\s*\([A-Za-z0-9_-]+\)$/, '').trim();
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  const { isDark } = useTheme();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col flex-1 min-h-0 w-full">
      <div className="mb-5 shrink-0">
        <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Career portal</h1>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Browse open roles and track your applications.</p>
        <div className={`flex gap-1 mt-5 border-b animate-pulse ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`h-5 w-20 rounded my-2.5 mx-4 sm:mx-5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-5 w-32 rounded my-2.5 mx-4 sm:mx-5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-[60vh] animate-pulse">
        {/* Left List Skeleton */}
        <div className="flex-1 flex flex-col h-full lg:max-w-md w-full">
          <div className={`h-10 w-full rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`p-4 rounded-2xl border flex gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className={`w-11 h-11 rounded-xl shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className="flex-1 space-y-2 py-1">
                  <div className={`h-3 w-3/4 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className={`h-2.5 w-1/2 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right Panel Skeleton */}
        <div className={`hidden lg:flex flex-[2] border rounded-2xl p-6 flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex gap-4 items-center mb-8">
            <div className={`w-14 h-14 rounded-2xl shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="space-y-2">
              <div className={`h-5 w-48 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <div className={`h-3 w-32 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            </div>
          </div>
          <div className="space-y-4">
            <div className={`h-4 w-full rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-4 w-11/12 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-4 w-4/5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-4 w-full rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedApplicationsPage() {
  const { isDark } = useTheme();
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
    <header className={`hidden lg:block sticky top-0 z-40 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>CVNet</span>
          <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Career Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Notifications"
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <Bell size={15} />
            <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 border ${isDark ? 'border-slate-800' : 'border-white'}`} />
          </button>
        </div>
      </div>
    </header>
  );

  if (isLoading) return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {TopBar}
      <Skeleton />
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {TopBar}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col flex-1 min-h-0 w-full">
        <div className="mb-5 shrink-0">
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Career portal</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Browse open roles and track your applications.</p>

          <div className={`flex gap-1 mt-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button onClick={() => { setActiveTab("find-jobs"); setSelectedJob(null); setIsReviewing(false); }}
              className={`px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === "find-jobs" ? "border-blue-600 text-blue-600" : (isDark ? "border-transparent text-slate-500 hover:text-slate-300" : "border-transparent text-slate-500 hover:text-slate-800")}`}>
              Find Jobs
            </button>
            <button onClick={() => setActiveTab("my-applications")}
              className={`px-4 sm:px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === "my-applications" ? "border-blue-600 text-blue-600" : (isDark ? "border-transparent text-slate-500 hover:text-slate-300" : "border-transparent text-slate-500 hover:text-slate-800")}`}>
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
                  <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input value={jobSearchQuery} onChange={(e) => setJobSearchQuery(e.target.value)} placeholder="Search title or company..." className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200'}`} />
                </div>
                <div className="relative shrink-0 sm:w-48">
                  <Filter size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <select value={selectedJobCategory} onChange={(e) => setSelectedJobCategory(e.target.value)} className={`w-full pl-9 pr-8 py-2.5 border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 appearance-none cursor-pointer transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                    {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </div>

              <div className="overflow-y-auto pr-1 space-y-2.5 pb-6">
                {recommendedJobs.length === 0 ? (
                  <div className={`text-center p-8 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}><p className={`text-sm font-semibold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>No jobs found matching your criteria.</p></div>
                ) : (
                  recommendedJobs.map((job) => (
                    <div key={job.id} onClick={() => { setSelectedJob(job); setIsReviewing(false); }} className={`p-4 rounded-2xl border cursor-pointer transition-colors ${selectedJob?.id === job.id ? (isDark ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50 border-blue-200') : (isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-blue-200')}`}>
                      <div className="flex items-start gap-3">
                        {job.companyLogo && job.companyLogo.includes("http") ? (
                          <img src={job.companyLogo} alt={job.companyName} className={`w-11 h-11 rounded-xl object-cover border shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpeg"; }} />
                        ) : (
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}><Building2 size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{cleanString(job.title)}</h3>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{cleanString(job.companyName)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}><Briefcase size={10} /> {job.workplaceType}</span>
                        {job.salaryRange && <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}><DollarSign size={10} /> {job.currency} {job.salaryRange}</span>}
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
                <div className={`p-5 sm:p-6 border-b relative shrink-0 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/60 border-slate-100'}`}>
                  <button onClick={() => { setSelectedJob(null); setIsReviewing(false); }} className={`lg:hidden absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}><X size={15} /></button>
                  <div className="flex items-center gap-3.5">
                    {selectedJob.companyLogo && selectedJob.companyLogo.includes("http") ? (
                      <img src={selectedJob.companyLogo} alt={selectedJob.companyName} className={`w-14 h-14 rounded-2xl object-cover border shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} onError={(e) => { (e.target as HTMLImageElement).src = "/logo.jpeg"; }} />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}><Building2 size={22} className={isDark ? 'text-slate-500' : 'text-slate-400'} /></div>
                    )}
                    <div className="min-w-0">
                      <h2 className={`text-lg sm:text-xl font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{cleanString(selectedJob.title)}</h2>
                      <p className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{cleanString(selectedJob.companyName)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto h-full space-y-6">

                  {/* STATE 1: VIEWING JOB DESCRIPTION */}
                  {!isReviewing ? (
                    <>
                      {/* Job Highlights Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          <MapPin size={13} /> {selectedJob.location || "Remote"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          <Briefcase size={13} /> {selectedJob.workplaceType} · {selectedJob.employmentType}
                        </span>
                        {selectedJob.salaryRange && (
                          <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'}`}>
                            <DollarSign size={13} /> {selectedJob.currency} {selectedJob.salaryRange}
                          </span>
                        )}
                      </div>

                      {selectedJob.description && (
                        <section>
                          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Overview</h3>
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{selectedJob.description}</p>
                        </section>
                      )}

                      {/* Qualifications (Skills, Education, Experience) */}
                      <section className="grid sm:grid-cols-2 gap-3">
                        <div className={`border p-4 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Required Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {parseJson(selectedJob.skillsJson, []).map((s: any, i: number) => (
                              <span key={i} className={`border text-xs font-semibold px-2.5 py-1 rounded-lg ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                                {s.name} {s.showLevel && <span className={`ml-1 font-medium text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({s.level})</span>}
                              </span>
                            ))}
                            {parseJson(selectedJob.skillsJson, []).length === 0 && <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>None explicitly stated.</span>}
                          </div>
                        </div>

                        <div className={`border p-4 rounded-2xl space-y-4 ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Experience</h4>
                            {parseJson(selectedJob.experienceJson, {}).level ? (
                              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{parseJson(selectedJob.experienceJson, {}).level} <span className={`font-medium ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({parseJson(selectedJob.experienceJson, {}).min}+ years)</span></p>
                            ) : <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Not specified</p>}
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Education</h4>
                            {parseJson(selectedJob.educationsJson, []).map((e: any, i: number) => (
                              <p key={i} className={`text-sm font-semibold flex items-center gap-2 mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}><CheckCircle2 size={13} className={isDark ? 'text-blue-400' : 'text-blue-500'} /> {e.degree}</p>
                            ))}
                            {parseJson(selectedJob.educationsJson, []).length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Not specified</p>}
                          </div>
                        </div>
                      </section>

                      {/* Responsibilities */}
                      {selectedJob.responsibilities && (
                        <section>
                          <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Key Responsibilities</h3>
                          <div className={`text-sm leading-relaxed whitespace-pre-line p-4 rounded-2xl border ${isDark ? 'bg-blue-900/10 border-blue-900/30 text-slate-400' : 'bg-blue-50/40 border-blue-100 text-slate-600'}`}>
                            {selectedJob.responsibilities}
                          </div>
                        </section>
                      )}

                      <section className={`border rounded-2xl p-5 ${isDark ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50 border-blue-100'}`}>
                        <h3 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Begin application</h3>
                        <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Select a profile track. You will be able to review and edit your data before final submission.</p>

                        {profiles.length > 0 ? (
                          <form onSubmit={handleStartReview} className="space-y-3">
                            <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-800'}`}>
                              {profiles.map(p => <option key={p.id} value={p.id}>{cleanString(p.jobRole)} (Profile)</option>)}
                            </select>
                            <button type="submit" disabled={isFetchingProfile} className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                              {isFetchingProfile ? <Loader2 size={15} className="animate-spin" /> : <User size={15} />}
                              Review Profile Details
                            </button>
                          </form>
                        ) : (
                          <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No target profiles found</p>
                            <Link href="/cv" className={`text-xs font-semibold hover:underline inline-flex items-center gap-1 mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Go to CV Builder <ArrowRight size={11} /></Link>
                          </div>
                        )}
                      </section>
                    </>
                  ) : (

                    /* STATE 2: EDITING AND REVIEWING */
                    <div>
                      <button onClick={() => setIsReviewing(false)} className={`flex items-center gap-1.5 text-xs font-semibold mb-5 transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}>
                        <ArrowLeft size={14} /> Back to job details
                      </button>

                      <div className={`border rounded-2xl p-4 flex gap-3 mb-6 ${isDark ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-100'}`}>
                        <AlertTriangle size={17} className={`shrink-0 mt-0.5 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
                        <div>
                          <p className={`text-sm font-bold ${isDark ? 'text-amber-500' : 'text-amber-900'}`}>Review your submission</p>
                          <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-amber-500/70' : 'text-amber-700'}`}>There is no going back once submitted. Please make sure all details below are correct. Editing these fields will only affect this specific application.</p>
                        </div>
                      </div>

                      <div className="space-y-5">

                        {/* Personal Info & Core Details */}
                        <section className={`border p-4 sm:p-5 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Core Profile Information</h4>
                          <div className="space-y-3.5">
                            <div><label className={`text-[10px] uppercase font-bold mb-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Role Title</label><input value={reviewData.jobRole} onChange={(e) => updateField("jobRole", e.target.value)} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`} /></div>
                            <div><label className={`text-[10px] uppercase font-bold mb-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Portfolio URL</label><input type="url" value={reviewData.portfolioUrl} onChange={(e) => updateField("portfolioUrl", e.target.value)} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${isDark ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-600'}`} /></div>
                            <div><label className={`text-[10px] uppercase font-bold mb-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Personal Statement</label><textarea value={reviewData.personalStatement} onChange={(e) => updateField("personalStatement", e.target.value)} rows={3} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`} /></div>
                          </div>
                        </section>

                        {/* Cover Letter */}
                        <section className={`border p-4 sm:p-5 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Cover Letter / Note</h4>
                          <textarea value={reviewData.coverLetter} onChange={(e) => updateField("coverLetter", e.target.value)} rows={5} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`} />
                        </section>

                        {/* Skills */}
                        <section className={`border p-4 sm:p-5 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-3.5">
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Targeted Skills</h4>
                            <button onClick={() => setReviewData(prev => ({ ...prev, skills: [...prev.skills, { skillName: "", level: "Beginner" }] }))} className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}><Plus size={13} /> Add Skill</button>
                          </div>
                          <div className="space-y-2.5">
                            {reviewData.skills.length === 0 && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No skills attached.</p>}
                            {reviewData.skills.map((skill, idx) => (
                              <div key={idx} className={`flex gap-2 items-center p-1.5 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <input placeholder="Skill Name" value={skill.skillName} onChange={e => updateArray("skills", idx, "skillName", e.target.value)} className={`border-0 px-2 py-1.5 text-sm flex-1 outline-none font-semibold bg-transparent ${isDark ? 'text-white' : ''}`} />
                                <select value={skill.level} onChange={e => updateArray("skills", idx, "level", e.target.value)} className={`border-l pl-2 py-1.5 text-xs font-semibold outline-none bg-transparent ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                  <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                                </select>
                                <button onClick={() => removeArrayItem("skills", idx)} className={`px-2 border-l ${isDark ? 'border-slate-700 text-slate-500 hover:text-red-400' : 'border-slate-100 text-slate-300 hover:text-red-500'}`}><Trash2 size={14} /></button>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Experience */}
                        <section className={`border p-4 sm:p-5 rounded-2xl ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-3.5">
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Included Experience</h4>
                            <button onClick={() => setReviewData(prev => ({ ...prev, experience: [...prev.experience, { companyName: "", roleDescription: "", startDate: "" }] }))} className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}><Plus size={13} /> Add Experience</button>
                          </div>
                          <div className="space-y-3">
                            {reviewData.experience.length === 0 && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No experience attached.</p>}
                            {reviewData.experience.map((exp, idx) => (
                              <div key={idx} className={`p-3.5 rounded-xl border relative group ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <button onClick={() => removeArrayItem("experience", idx)} className={`absolute top-3.5 right-3.5 ${isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}><Trash2 size={14} /></button>
                                <div className="grid grid-cols-2 gap-3 pr-7">
                                  <div><label className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Company</label><input value={exp.companyName || ""} onChange={e => updateArray("experience", idx, "companyName", e.target.value)} className={`w-full border-b py-1 text-sm outline-none font-semibold focus:border-blue-500 bg-transparent ${isDark ? 'border-slate-700 text-white' : 'border-slate-200'}`} /></div>
                                  <div><label className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Start Date</label><input type="date" value={exp.startDate || ""} onChange={e => updateArray("experience", idx, "startDate", e.target.value)} className={`w-full border-b py-1 text-sm outline-none focus:border-blue-500 bg-transparent ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-600'}`} /></div>
                                  <div className="col-span-2"><label className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Role / Title</label><input value={exp.roleDescription || ""} onChange={e => updateArray("experience", idx, "roleDescription", e.target.value)} className={`w-full border-b py-1 text-sm outline-none font-semibold focus:border-blue-500 bg-transparent ${isDark ? 'border-slate-700 text-white' : 'border-slate-200'}`} /></div>
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
              <div className={`hidden lg:flex flex-[2] border border-dashed rounded-2xl items-center justify-center flex-col ${isDark ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
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
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b rounded-t-2xl ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="relative w-full sm:w-auto">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input value={appSearchQuery} onChange={(e) => setAppSearchQuery(e.target.value)} placeholder="Search your applications..." className={`pl-9 pr-4 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-full sm:w-64 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200'}`} />
                </div>
                <div className="relative w-full sm:w-auto">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`appearance-none w-full pl-3 pr-8 py-2 text-sm font-semibold border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                    {["All", ...Object.keys(STATUS_CONFIG)].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-2 text-center px-6">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Briefcase size={18} className={isDark ? 'text-slate-500' : 'text-slate-300'} />
                  </div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No applications found</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try adjusting your search or filter.</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                          {["Role & company", "Status", "Applied date", "Action"].map((h, i) => (
                            <th key={i} className={`text-left text-[10px] font-black uppercase tracking-widest px-5 sm:px-6 py-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApps.map((a) => (
                          <tr key={a.id} className={`border-b last:border-0 transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50/60'}`}>
                            <td className="px-5 sm:px-6 py-3.5">
                              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{cleanString(a.role)}</p>
                              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cleanString(a.company)} · {a.location || "Remote"}</p>
                            </td>
                            <td className="px-5 sm:px-6 py-3.5"><StatusBadge status={a.status} /></td>
                            <td className="px-5 sm:px-6 py-3.5"><span className={`text-xs font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{a.date}</span></td>
                            <td className="px-5 sm:px-6 py-3.5">
                              <Link href={`/applications/${a.id}`} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 hover:text-blue-700'}`}>View details</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className={`sm:hidden divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                    {filteredApps.map((a) => (
                      <Link key={a.id} href={`/applications/${a.id}`} className="px-4 py-3.5 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{cleanString(a.role)}</p>
                          <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cleanString(a.company)} · {a.date}</p>
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