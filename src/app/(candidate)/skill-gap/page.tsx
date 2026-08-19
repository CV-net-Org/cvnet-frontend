//candidate skill-gap page

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  Loader2,
  PlusCircle,
  ChevronRight,
  Bell,
  Search,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { auth } from "@/lib/firebaseConfig";
import apiClient from "@/lib/apiClient";
import { useTheme } from "@/context/ThemeContext";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  "Critical Gap": { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e" },
  "Moderate Gap": { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  "Matched": { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
};
function getStatus(s: string) { return STATUS_CONFIG[s] ?? STATUS_CONFIG["Moderate Gap"]; }

// Safe level mapping to prevent JS alphabet sorting bugs
const levelMap: Record<string, number> = {
  "None Detected": 0,
  "Missing": 0,
  "Beginner": 1,
  "Intermediate": 2,
  "Advanced": 3,
  "Expert": 4,
};

function computeStatus(yourLevel: string, required: string) {
  const u = levelMap[yourLevel] ?? 0;
  const e = levelMap[required] ?? 1;

  if (u === 0) return "Critical Gap";
  if (u >= e) return "Matched";
  if (u === 1 && e >= 3) return "Critical Gap";
  return "Moderate Gap";
}

// ─── Shared primitives (mirrors dashboard design system) ───────────────────────

function Divider() { 
  const { isDark } = useTheme();
  return <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />; 
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { isDark } = useTheme();
  return <div className={`rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} ${className}`}>{children}</div>;
}

function StatCard({ label, value, suffix, icon: Icon, accent, sub, className = "" }: {
  label: string; value: string | number; suffix?: string;
  icon: React.ElementType; accent: string; sub?: string; className?: string;
}) {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${className} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: isDark ? accent + "30" : accent + "18", color: accent }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl sm:text-2xl font-black tabular-nums leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
          {suffix && <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{suffix}</span>}
        </div>
        {sub && <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  const { isDark } = useTheme();
  return (
    <div className="animate-pulse space-y-5">
      <div className={`rounded-2xl border p-5 h-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`rounded-2xl border p-4 flex gap-3 items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`w-10 h-10 rounded-xl shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-2.5 rounded w-16 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <div className={`h-5 rounded w-10 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border h-72 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} />
        <div className={`rounded-2xl border h-72 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} />
      </div>
      <div className={`rounded-2xl border h-56 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SkillGapPage() {
  const { isDark } = useTheme();
  const [data, setData] = useState<any>(null);
  const [activeProfileId, setActiveProfileId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkillGapData = async (profileId?: string) => {
    try {
      if (!auth.currentUser) return;

      // Token and Base URL are automatically handled by apiClient
      const endpoint = profileId ? `/api/SkillGap/analysis?profileId=${profileId}` : `/api/SkillGap/analysis`;
      const res = await apiClient.get(endpoint);

      setData(res.data);
      if (res.data.activeProfileId) setActiveProfileId(res.data.activeProfileId);
    } catch (err: any) {
      console.error("C# Backend Network Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchSkillGapData();
      else setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Top bar (mirrors dashboard) ──────────────────────────────────────────────

  const TopBar = (
    <header className={`hidden lg:block sticky top-0 z-40 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>CVNet</span>
          <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Skill Gap</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/applications"
            className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold border px-3.5 py-2 rounded-xl transition-colors ${isDark ? 'text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'}`}>
            <Search size={13} /> Search jobs
          </Link>
          <Link href="/applications"
            className={`sm:hidden w-9 h-9 flex items-center justify-center rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-white text-slate-500'}`}>
            <Search size={15} />
          </Link>
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
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {TopBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Skill gap analysis</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading your market readiness…</p>
        </div>
        <Skeleton />
      </main>
    </div>
  );

  if (!data) return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {TopBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center gap-2">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <AlertCircle size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
        </div>
        <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Couldn't load skill gap data</p>
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ensure your C# backend is running on port 5167.</p>
      </main>
    </div>
  );

  const matchScore = data.matchScore || 0;
  const industryScore = data.industryScore || 80;
  const matchedCount = data.matchedCount || 0;
  const missingCount = data.missingCount || 0;
  const matchedSkills = data.matchedSkills || [];
  const missingSkills = data.missingSkills || [];
  const breakdown = data.breakdown || [];
  const totalSkills = matchedCount + missingCount || 1;
  const matchedPct = Math.round((matchedCount / totalSkills) * 100);
  const isAboveIndustry = matchScore >= industryScore;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {TopBar}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">

        {/* ── Heading ── */}
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Skill gap analysis</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Deep dive into your market readiness and personalized development roadmap.</p>
        </div>

        {/* ── Target role selector ── */}
        <SectionCard className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <Target size={12} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Target job role</p>
            </div>
            <Link href="/dashboard"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}>
              <PlusCircle size={13} /> Build new target
            </Link>
          </div>

          <select
            value={activeProfileId}
            onChange={(e) => {
              setActiveProfileId(e.target.value);
              setIsLoading(true);
              fetchSkillGapData(e.target.value);
            }}
            className={`w-full sm:max-w-md px-3.5 py-2.5 text-sm font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-slate-200 text-blue-700'}`}
          >
            {(data.profiles || []).map((p: any) => <option key={p.id} value={p.id}>{p.jobRole}</option>)}
          </select>

          <p className={`text-xs mt-2.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
            Analytics adjusted for <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{data.jobRole || "selected role"}</span>. Evaluated against industry-standard job categories using weighted readiness algorithms.
          </p>
        </SectionCard>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Match score" value={matchScore} suffix="%" icon={TrendingUp} accent="#2563eb" sub="your readiness" />
          <StatCard label="Industry expected" value={industryScore} suffix="%" icon={Zap} accent="#7c3aed" sub="benchmark level" />
          <StatCard label="Matched skills" value={matchedCount} icon={CheckCircle2} accent="#16a34a" sub="verified" />
          <StatCard label="Missing skills" value={missingCount} icon={AlertCircle} accent="#e11d48" sub="critical gaps" />
        </div>

        {/* ── Charts row ── */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Readiness gauge */}
          <SectionCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Readiness gauge</h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Your score vs. the industry benchmark</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-36 h-36 shrink-0">
                <svg viewBox="0 0 80 80" className="w-36 h-36 -rotate-90 drop-shadow-sm">
                  <circle cx="40" cy="40" r="34" fill="none" stroke={isDark ? '#334155' : '#e2e8f0'} strokeWidth="7" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke={isDark ? '#1e3a8a' : '#bfdbfe'} strokeWidth="7"
                    strokeDasharray={`${(2 * Math.PI * 34 * industryScore) / 85} ${2 * Math.PI * 34}`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke={isAboveIndustry ? (isDark ? "#22c55e" : "#22c55e") : (isDark ? "#3b82f6" : "#2563eb")}
                    strokeWidth="7"
                    strokeDasharray={`${(2 * Math.PI * 34 * matchScore) / 85} ${2 * Math.PI * 34}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <g style={{ transform: `rotate(${(industryScore / 85) * 360}deg)`, transformOrigin: '40px 40px' }}>
                    <line x1="40" y1="2" x2="40" y2="10" stroke={isDark ? "#94a3b8" : "#1e293b"} strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{matchScore}%</span>
                  <span className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Score</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className={`flex items-center justify-between border px-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-1.5">
                    <Zap size={13} className="text-blue-500" />
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Max expertise</span>
                  </div>
                  <span className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>85%</span>
                </div>

                <div className={`flex items-center justify-between border px-3 py-2.5 rounded-xl ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-1.5">
                    <Target size={13} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Industry expected</span>
                  </div>
                  <span className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{industryScore}%</span>
                </div>

                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: isAboveIndustry ? (isDark ? "#052e16" : "#f0fdf4") : (isDark ? "#4c0519" : "#fff1f2") }}>
                  <div className="flex items-center gap-1.5">
                    {isAboveIndustry ? <CheckCircle2 size={13} className={isDark ? "text-green-500" : "text-green-600"} /> : <AlertCircle size={13} className={isDark ? "text-red-400" : "text-red-500"} />}
                    <span className="text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: isAboveIndustry ? (isDark ? "#4ade80" : "#15803d") : (isDark ? "#fb7185" : "#be123c") }}>Your readiness</span>
                  </div>
                  <span className="text-[11px] font-black" style={{ color: isAboveIndustry ? (isDark ? "#4ade80" : "#15803d") : (isDark ? "#fb7185" : "#be123c") }}>{matchScore}%</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Skill distribution */}
          <SectionCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Skill match breakdown</h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Matched vs. missing across your target role</p>
            </div>

            <div className="flex items-center justify-center gap-8">
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 80 80" className="-rotate-90 w-32 h-32">
                  <circle cx="40" cy="40" r="34" fill="none" stroke={isDark ? '#4c0519' : '#fecdd3'} strokeWidth="10" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke={isDark ? '#22c55e' : '#22c55e'} strokeWidth="10"
                    strokeDasharray={`${(2 * Math.PI * 34 * matchedPct) / 100} ${2 * Math.PI * 34}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{matchedCount}/{matchedCount + missingCount}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                  <div>
                    <p className={`text-sm font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{matchedCount}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Matched</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                  <div>
                    <p className={`text-sm font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{missingCount}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Missing</p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Learning path banner ── */}
        <SectionCard className="p-5 sm:p-6 !bg-blue-600 border-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-sm font-bold text-white">Accelerate your growth</h2>
                <span className="text-[9px] uppercase tracking-widest bg-white text-blue-600 px-2 py-0.5 rounded-full font-bold">AI recommended</span>
              </div>
              <p className="text-xs text-blue-100">Focus on your critical gaps — we've mapped a personalized learning roadmap for your target role.</p>
            </div>
            <Link href="/dashboard"
              className="shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white hover:bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap w-full sm:w-auto">
              Start learning path <ArrowRight size={12} />
            </Link>
          </div>
        </SectionCard>

        {/* ── Matched / Missing skills ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          <SectionCard className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <CheckCircle2 size={12} className={isDark ? 'text-green-500' : 'text-green-600'} />
              </div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Matched skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length === 0 ? (
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No specific skills matched yet.</p>
              ) : matchedSkills.map((s: string) => (
                <span key={s} className={`text-xs border px-3 py-1.5 rounded-lg font-semibold ${isDark ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-green-50 text-green-700 border-green-100'}`}>
                  {s}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <AlertCircle size={12} className={isDark ? 'text-red-400' : 'text-red-500'} />
              </div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Missing critical skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length === 0 ? (
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>All skills matched!</p>
              ) : missingSkills.map((s: string) => (
                <span key={s} className={`text-xs border px-3 py-1.5 rounded-lg font-semibold ${isDark ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {s}
                </span>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── Detailed breakdown table ── */}
        <SectionCard>
          <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
            <div>
              <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Skill gap breakdown</h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Your level against the required level, skill by skill</p>
            </div>
          </div>

          {breakdown.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-2 text-center px-6">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <Target size={18} className={isDark ? 'text-slate-500' : 'text-slate-300'} />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No breakdown available</p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Select a target role to see a detailed skill gap analysis.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                      {["Skill / tool", "Your level", "Required level", "Status"].map((h, i) => (
                        <th key={i} className={`text-left text-[10px] font-black uppercase tracking-widest px-5 sm:px-6 py-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((item: any, idx: number) => {
                      const status = computeStatus(item.yourLevel, item.required);
                      return (
                        <tr key={idx} className={`border-b last:border-0 transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50/60'}`}>
                          <td className="px-5 sm:px-6 py-3.5">
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.skill}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.category}</p>
                          </td>
                          <td className="px-5 sm:px-6 py-3.5">
                            <span className={`text-xs font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.yourLevel}</span>
                          </td>
                          <td className="px-5 sm:px-6 py-3.5">
                            <span className={`text-xs font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.required}</span>
                          </td>
                          <td className="px-5 sm:px-6 py-3.5">
                            <StatusBadge status={status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className={`sm:hidden divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                {breakdown.map((item: any, idx: number) => {
                  const status = computeStatus(item.yourLevel, item.required);
                  return (
                    <div key={idx} className="px-4 py-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.skill}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.category} · You: {item.yourLevel} · Needs: {item.required}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SectionCard>

        <div className="h-4 sm:h-0" />
      </main>
    </div>
  );
}