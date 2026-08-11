//candidate applications>[id] page

'use client';

import {
  Mail,
  Phone,
  MapPin,
  Download,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  ChevronRight,
  Brain,
  ArrowLeft,
  Loader2,
  User as UserIcon,
  Bell,
  Target
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { auth } from '@/lib/firebaseConfig';
import apiClient from "@/lib/apiClient";

// --- TYPES ---
type SnapshotSkill = { skillName: string; level: string; };
type SnapshotExperience = { companyName: string; startDate: string; endDate?: string; roleDescription: string; };
type SnapshotEducation = { degreeTitle: string; fieldOfStudy?: string; organization: string; year: string; };

type ApplicationData = {
  id: string;
  appliedDate: string;
  status: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    profileImageUrl?: string | null;
  };
  snapshot: {
    jobRole: string;
    personalStatement: string;
    aboutMe: string;
    cvUrl: string;
    matchScore: number;
    industryScore: number;
    skills: SnapshotSkill[];
    experience: SnapshotExperience[];
    education: SnapshotEducation[];
  };
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

// Helper to format dates cleanly (e.g., "2021-05-01" -> "May 2021")
const formatMonthYear = (dateString?: string) => {
  if (!dateString) return 'Present';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback if invalid
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
};

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('experience');
  const [data, setData] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        if (!auth.currentUser) return;

        const response = await apiClient.get(`/api/Application/${params.id}`);
        setData(response.data);
      } catch (error) {
        console.error("Failed to load application details", error);
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchApplicationDetails();
    });

    return () => unsubscribe();
  }, [params.id]);

  // ── Top bar (mirrors dashboard) ──────────────────────────────────────────────

  const TopBar = (
    <header className="hidden lg:block bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-900 hidden sm:block shrink-0">CVNet</span>
          <ChevronRight size={14} className="text-slate-300 hidden sm:block shrink-0" />
          <Link href="/applications" className="text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors shrink-0">Applications</Link>
          {data && (
            <>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
              <span className="text-sm font-semibold text-slate-900 truncate">{data.snapshot.jobRole}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" aria-label="Notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <Bell size={15} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
          </button>
        </div>
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {TopBar}
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="animate-spin text-blue-600" size={36} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50">
        {TopBar}
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
          <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <Briefcase size={18} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Application not found</h2>
          <p className="text-sm text-slate-500 mb-5">We couldn't locate the details for this application.</p>
          <button onClick={() => router.push('/applications')} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { user, snapshot } = data;
  const initials = user.fullName ? user.fullName.charAt(0).toUpperCase() : '?';
  const isAboveIndustry = (snapshot.matchScore || 0) >= (snapshot.industryScore || 80);

  return (
    <div className="min-h-screen bg-slate-50">
      {TopBar}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* Back link (mobile-friendly, mirrors breadcrumb intent) */}
        <Link href="/applications" className="sm:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft size={13} /> My applications
        </Link>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* LEFT COLUMN: Main Profile Info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero Section */}
            <SectionCard className="p-5 sm:p-6">
              <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">

                {/* Profile Image (Dynamic fallback) */}
                <div className="w-24 h-24 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-black relative overflow-hidden">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerHTML = `${initials}`;
                        }
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 text-center md:text-left min-w-0 w-full">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">{user.fullName}</h1>
                    <div className="flex justify-center md:justify-start">
                      <StatusBadge status={data.status} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 mb-4">{snapshot.jobRole}</p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs font-semibold text-slate-600">
                    {user.address && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <MapPin size={13} className="text-slate-400" /> {user.address}
                      </div>
                    )}
                    {user.email && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Mail size={13} className="text-slate-400" /> {user.email}
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <Phone size={13} className="text-slate-400" /> {user.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Action */}
                {snapshot.cvUrl && (
                  <a
                    href={snapshot.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 w-full md:w-auto"
                  >
                    <Download size={16} /> Original CV
                  </a>
                )}
              </div>
            </SectionCard>

            {/* Detailed Info Tabs */}
            <SectionCard className="overflow-hidden">
              <div className="flex border-b border-slate-100 overflow-x-auto">
                {['Experience', 'Education', 'Skills', 'About'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`px-5 sm:px-6 py-3.5 text-sm font-semibold transition-colors relative whitespace-nowrap border-b-2 -mb-px ${activeTab === tab.toLowerCase() ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">
                {/* EXPERIENCE TAB */}
                {activeTab === 'experience' && (
                  <div className="space-y-4">
                    {(!snapshot.experience || snapshot.experience.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Briefcase size={22} className="text-slate-300 mb-2.5" />
                        <p className="text-slate-500 font-semibold text-sm">No experience recorded in this snapshot.</p>
                      </div>
                    )}
                    {snapshot.experience?.map((exp, i) => (
                      <div key={i} className="flex gap-4 group relative">
                        {/* Timeline Icon & Line */}
                        <div className="flex flex-col items-center mt-0.5">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 z-10">
                            <Briefcase size={16} />
                          </div>
                          {i !== snapshot.experience.length - 1 && (
                            <div className="w-px h-full bg-slate-100 mt-2" />
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="pb-6 w-full">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight">
                                  {exp.roleDescription}
                                </h4>
                                <p className="text-blue-600 font-semibold text-xs mt-1">
                                  {exp.companyName}
                                </p>
                              </div>
                              <span className="inline-flex items-center bg-white text-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 whitespace-nowrap shrink-0">
                                {formatMonthYear(exp.startDate)} — {formatMonthYear(exp.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* EDUCATION TAB */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    {(!snapshot.education || snapshot.education.length === 0) && (
                      <p className="text-slate-400 font-medium text-sm text-center py-8">No education recorded in this snapshot.</p>
                    )}
                    {snapshot.education?.map((edu, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <GraduationCap size={17} />
                          </div>
                          {i !== snapshot.education.length - 1 && <div className="w-px h-full bg-slate-100 my-2" />}
                        </div>
                        <div className="pb-5 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">{edu.degreeTitle} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h4>
                            <span className="inline-block bg-slate-50 text-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-100 whitespace-nowrap shrink-0">
                              {edu.year || 'N/A'}
                            </span>
                          </div>
                          <p className="text-indigo-600 font-semibold text-xs mt-1">{edu.organization}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SKILLS TAB */}
                {activeTab === 'skills' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(!snapshot.skills || snapshot.skills.length === 0) && (
                      <p className="text-slate-400 font-medium text-sm text-center col-span-full py-8">No skills recorded in this snapshot.</p>
                    )}
                    {snapshot.skills?.map((skill, i) => (
                      <div key={i} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{skill.level}</p>
                        <h4 className="font-semibold text-sm text-slate-800">{skill.skillName}</h4>
                      </div>
                    ))}
                  </div>
                )}

                {/* ABOUT TAB */}
                {activeTab === 'about' && (
                  <div className="space-y-4">
                    {snapshot.personalStatement && (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><UserIcon size={14} /> Personal Statement</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{snapshot.personalStatement}</p>
                      </div>
                    )}
                    {snapshot.aboutMe && (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Briefcase size={14} /> About Me</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{snapshot.aboutMe}</p>
                      </div>
                    )}
                    {!snapshot.personalStatement && !snapshot.aboutMe && (
                      <p className="text-slate-400 font-medium text-sm text-center py-8">No additional details recorded.</p>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT COLUMN: AI Analysis */}
          <div className="space-y-5">

            <SectionCard className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Brain size={12} className="text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">CVNet Matrix</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36 mb-5">
                  <svg viewBox="0 0 80 80" className="w-36 h-36 -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke={isAboveIndustry ? "#22c55e" : "#2563eb"}
                      strokeWidth="7"
                      strokeDasharray={`${(2 * Math.PI * 34 * (snapshot.matchScore || 0)) / 100} ${2 * Math.PI * 34}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{snapshot.matchScore || 0}%</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">Match score</span>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Target size={13} className="text-slate-500" />
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Industry expected</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-800">{snapshot.industryScore || 80}%</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed px-1 pt-1">
                    Snapshot captured at application time.
                  </p>
                </div>
              </div>
            </SectionCard>

          </div>
        </div>
      </main>
    </div>
  );
}