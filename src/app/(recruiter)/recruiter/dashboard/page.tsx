'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import {
  Search, Plus, TrendingUp, Users, Briefcase,
  Loader2, AlertCircle, ArrowRight, ArrowUpRight,
  ChevronRight, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';

interface Candidate {
  name: string;
  email: string;
  role: string;
  matchScore: number;
  stage: string;
}

interface DashboardData {
  totalApplications: number;
  averageMatchScore: number;
  openPositions: number;
  applicationTrends: { month: string; count: number }[];
  topCandidates: Candidate[];
}

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; darkBg: string; darkColor: string }> = {
  Interview: { label: 'Interview', color: '#1d4ed8', bg: '#eff6ff', dot: '#3b82f6', darkBg: '#1e3a5f', darkColor: '#60a5fa' },
  'Technical Test': { label: 'Technical Test', color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6', darkBg: '#2e1a4f', darkColor: '#a78bfa' },
  Screening: { label: 'Screening', color: '#b45309', bg: '#fffbeb', dot: '#f59e0b', darkBg: '#3a2a0a', darkColor: '#fbbf24' },
  Pending: { label: 'Pending', color: '#475569', bg: '#f8fafc', dot: '#94a3b8', darkBg: '#1e293b', darkColor: '#94a3b8' },
};

function getStage(stage: string) {
  return STAGE_CONFIG[stage] ?? STAGE_CONFIG['Pending'];
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const colors = [
    ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
    ['#d1fae5', '#065f46'], ['#fef3c7', '#92400e'], ['#e0f2fe', '#0369a1'],
  ];
  const [bg, text] = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ backgroundColor: bg, color: text }}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none">
      {initials}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const { isDark } = useTheme();
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#2563eb' : score >= 40 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color, minWidth: '32px', textAlign: 'right' }}>{score}%</span>
    </div>
  );
}

function StageBadge({ stage, isDark }: { stage: string; isDark: boolean }) {
  const cfg = getStage(stage);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: isDark ? cfg.darkBg : cfg.bg, color: isDark ? cfg.darkColor : cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs font-semibold rounded-xl px-3 py-2 shadow-xl pointer-events-none">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p>{payload[0].value} applicants</p>
    </div>
  );
}

function TrendChart({ data, isDark }: { data: { month: string; count: number }[]; isDark: boolean }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeDasharray="0" />
        <XAxis dataKey="month" axisLine={false} tickLine={false}
          tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
        <YAxis axisLine={false} tickLine={false}
          tick={{ fill: isDark ? '#475569' : '#cbd5e1', fontSize: 10 }} tickCount={4} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#334155' : '#e2e8f0', strokeWidth: 1 }} />
        <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fill="url(#grad)"
          activeDot={{ r: 5, strokeWidth: 2.5, stroke: '#fff', fill: '#2563eb' }} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatCard({ label, value, suffix, icon: Icon, accent, className, isDark }:
  { label: string; value: string | number; suffix?: string; icon: React.ElementType; accent: string; className?: string; isDark: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${className || ''} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent + '20', color: accent }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl sm:text-2xl font-black tabular-nums leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
          {suffix && <span className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton({ isDark }: { isDark: boolean }) {
  const s = isDark ? 'bg-slate-800' : 'bg-slate-100';
  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`rounded-2xl border p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${i === 3 ? 'col-span-2 sm:col-span-1' : ''} ${card}`}>
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${s} shrink-0`}></div>
            <div className="flex-1">
              <div className={`h-3 ${s} rounded w-20 mb-2`}></div>
              <div className={`h-6 ${s} rounded w-12`}></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
        <div className={`lg:col-span-3 rounded-2xl border p-5 sm:p-6 h-64 sm:h-72 flex flex-col ${card}`}>
          <div className={`h-4 ${s} rounded w-32 mb-1`}></div>
          <div className={`h-3 ${s} rounded w-48 mb-8`}></div>
          <div className={`w-full flex-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}></div>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className={`rounded-2xl border p-5 ${card}`}>
            <div className={`h-4 ${s} rounded w-24 mb-6`}></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div className={`h-3 ${s} rounded w-20 mb-2`}></div>
                  <div className={`h-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} rounded-full w-full`}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-600 rounded-2xl p-5">
            <div className="h-3 bg-blue-500 rounded w-16 mb-4"></div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500 shrink-0"></div>
                <div className="min-w-0 flex flex-col">
                  <div className="h-4 bg-blue-500 rounded w-24 sm:w-32 mb-2"></div>
                  <div className="h-3 bg-blue-500 rounded w-20"></div>
                </div>
              </div>
              <div className="h-8 bg-blue-500 rounded w-14"></div>
            </div>
          </div>
        </div>
      </div>
      <div className={`rounded-2xl border p-5 ${card}`}>
        <div className={`h-4 ${s} rounded w-32 mb-1`}></div>
        <div className={`h-3 ${s} rounded w-48 mb-6`}></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s} shrink-0`}></div>
              <div className="flex-1">
                <div className={`h-4 ${s} rounded w-32 mb-2`}></div>
                <div className={`h-3 ${s} rounded w-48 hidden sm:block`}></div>
              </div>
              <div className={`w-24 h-4 ${s} rounded hidden sm:block`}></div>
              <div className={`w-16 h-6 ${s} rounded-lg`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, isDark }: { message: string; isDark: boolean }) {
  return (
    <div className="py-12 flex items-center justify-center">
      <div className={`rounded-2xl border p-8 max-w-sm w-full flex flex-col items-center gap-4 text-center shadow-sm ${isDark ? 'bg-slate-900 border-red-900' : 'bg-white border-red-100'}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-500'}`}>
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard unavailable</h2>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
        </div>
        <button type="button" onClick={() => window.location.reload()}
          className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
          Try again
        </button>
      </div>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/api/CompanyDashboard');
        setData(response.data);
      } catch (err: any) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const topBarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const searchBg = isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-400';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';

  const topBar = (
    <header className={`border-b sticky top-0 z-40 ${topBarBg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recruiter</span>
          <ChevronRight size={14} className={isDark ? 'text-slate-600 hidden sm:block' : 'text-slate-300 hidden sm:block'} />
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Overview</span>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input aria-label="Search candidates or roles" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search candidates or roles…"
            className={`w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${searchBg}`} />
        </div>
        <Link href="/recruiter/post-job"
          className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-900/20">
          <Plus size={15} />
          <span className="hidden sm:inline">Post job</span>
        </Link>
      </div>
    </header>
  );

  const pageHeading = (
    <div>
      <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>Overview</h1>
      <p className={`text-sm mt-0.5 ${subColor}`}>Your recruitment pipeline at a glance.</p>
    </div>
  );

  if (isLoading) return (
    <div className={`min-h-screen ${bg}`}>{topBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">{pageHeading}<DashboardSkeleton isDark={isDark} /></main>
    </div>
  );

  if (error || !data) return (
    <div className={`min-h-screen ${bg}`}>{topBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">{pageHeading}<ErrorState message={error ?? 'Unknown error.'} isDark={isDark} /></main>
    </div>
  );

  const filteredCandidates = data.topCandidates.filter(c =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${bg}`}>
      {topBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {pageHeading}

        {/* Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Total Applications" value={data.totalApplications} icon={Users} accent="#6366f1" isDark={isDark} />
          <StatCard label="Open Roles" value={data.openPositions} icon={Briefcase} accent="#f43f5e" isDark={isDark} />
          <StatCard label="Avg Match Score" value={data.averageMatchScore} suffix="%" icon={TrendingUp} accent="#2563eb" className="col-span-2 sm:col-span-1" isDark={isDark} />
        </div>

        {/* Chart + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
          <div className={`lg:col-span-3 rounded-2xl border p-5 sm:p-6 ${cardBg}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-sm font-bold ${headingColor}`}>Application trends</h2>
                <p className={`text-xs mt-0.5 ${subColor}`}>Applicant volume · last 6 months</p>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 border ${isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                <BarChart2 size={13} /> 6 months
              </div>
            </div>
            <div className="h-48 sm:h-56"><TrendChart data={data.applicationTrends} isDark={isDark} /></div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className={`rounded-2xl border p-5 ${cardBg}`}>
              <h2 className={`text-sm font-bold mb-4 ${headingColor}`}>Pipeline stages</h2>
              <div className="space-y-3">
                {Object.entries(STAGE_CONFIG).map(([stage, cfg]) => {
                  const count = data.topCandidates.filter(c => c.stage === stage).length;
                  const pct = data.topCandidates.length ? Math.round((count / data.topCandidates.length) * 100) : 0;
                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                          <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{stage}</span>
                        </div>
                        <span className="font-bold tabular-nums" style={{ color: isDark ? cfg.darkColor : cfg.color }}>
                          {count} <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({pct}%)</span>
                        </span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cfg.dot }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {data.topCandidates.length > 0 && (() => {
              const top = [...data.topCandidates].sort((a, b) => b.matchScore - a.matchScore)[0];
              return (
                <div className="bg-blue-600 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">Top match</p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                        {top.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{top.name}</p>
                        <p className="text-xs text-blue-200 truncate">{top.role}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0 text-right">
                      <span className="text-3xl font-black tabular-nums leading-none">{top.matchScore}</span>
                      <span className="text-blue-200 font-bold text-sm">% match</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Candidates Table */}
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div>
              <h2 className={`text-sm font-bold ${headingColor}`}>Top candidates</h2>
              <p className={`text-xs mt-0.5 ${subColor}`}>Highest-scoring active applications</p>
            </div>
            <Link href="/recruiter/candidates"
              className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center px-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <Users size={20} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {searchQuery ? 'No candidates match your search.' : 'No candidates yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                      {['Candidate', 'Role', 'Match', 'Stage', ''].map((h, i) => (
                        <th key={i} className={`text-left text-[10px] font-black uppercase tracking-widest px-5 sm:px-6 py-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c, idx) => (
                      <tr key={idx} className={`border-b last:border-0 transition-colors group ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50/60'}`}>
                        <td className="px-5 sm:px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} />
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.name}</p>
                              <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 sm:px-6 py-3.5">
                          <span className={`text-sm font-medium truncate max-w-[180px] block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{c.role}</span>
                        </td>
                        <td className="px-5 sm:px-6 py-3.5 w-44"><ScoreBar score={c.matchScore} /></td>
                        <td className="px-5 sm:px-6 py-3.5"><StageBadge stage={c.stage} isDark={isDark} /></td>
                        <td className="px-5 sm:px-6 py-3.5 text-right">
                          <Link href={`/recruiter/candidates?email=${encodeURIComponent(c.email)}`}
                            className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-600'}`}>
                            Review <ArrowUpRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-800">
                {filteredCandidates.map((c, idx) => (
                  <div key={idx} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.name}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{c.role}</p>
                      </div>
                      <StageBadge stage={c.stage} isDark={isDark} />
                    </div>
                    <ScoreBar score={c.matchScore} />
                    <Link href={`/recruiter/candidates?email=${encodeURIComponent(c.email)}`}
                      className="self-end text-xs font-semibold text-blue-500 flex items-center gap-1">
                      Review profile <ArrowUpRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}