'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Plus, Eye, ChevronDown, Loader2,
  Briefcase, Users, TrendingUp, ChevronRight, SlidersHorizontal, X
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { auth } from '@/lib/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';

type JobStatus = 'Active' | 'Closed';

type JobListing = {
  id: string; title: string; dept: string; posted: string;
  applicants: number; newApplicants: number; matchAvg: number; status: JobStatus;
};

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  Design: { bg: '#f5f3ff', color: '#6d28d9' },
  Engineering: { bg: '#eff6ff', color: '#1d4ed8' },
  Marketing: { bg: '#fdf2f8', color: '#be185d' },
  Data: { bg: '#ecfeff', color: '#0e7490' },
  'Human Resources': { bg: '#fffbeb', color: '#b45309' },
  Product: { bg: '#f0fdf4', color: '#15803d' },
};

function getDeptStyle(dept: string) {
  return DEPT_COLORS[dept] ?? { bg: '#f8fafc', color: '#475569' };
}

const STATUS_CONFIG: Record<JobStatus, { bg: string; color: string; dot: string }> = {
  Active: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  Closed: { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
};

const FILTER_STATUSES = ['All', 'Active', 'Closed'] as const;
const SORT_OPTIONS = ['Newest first', 'Most applicants', 'Best match avg'] as const;

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {status}
    </span>
  );
}

function DeptBadge({ dept }: { dept: string }) {
  const { bg, color } = getDeptStyle(dept);
  return (
    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: bg, color }}>
      {dept}
    </span>
  );
}

function MatchRing({ value }: { value: number }) {
  if (!value) return <span className="text-sm text-slate-500 font-semibold">—</span>;
  const color = value >= 75 ? '#16a34a' : value >= 55 ? '#2563eb' : value >= 35 ? '#d97706' : '#dc2626';
  return <span className="text-sm font-bold tabular-nums" style={{ color }}>{value}%</span>;
}

function SummaryPill({ label, value, color, isDark }: { label: string; value: number; color: string; isDark: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 min-w-[130px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20', color }}>
        {label === 'Total' ? <Briefcase size={15} /> : label === 'Active' ? <TrendingUp size={15} /> : <Users size={15} />}
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-lg font-black leading-none tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobsList, setJobsList] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof FILTER_STATUSES[number]>('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]>('Newest first');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        apiClient.get('/api/CompanyJob/list')
          .then(r => setJobsList(r.data))
          .catch(e => console.error(e))
          .finally(() => setIsLoading(false));
      }
    });
    return () => unsubscribe();
  }, []);

  const deptOptions = ['All', ...Array.from(new Set(jobsList.map(j => j.dept)))];

  const filteredJobs = jobsList
    .filter(job => {
      const q = search.toLowerCase();
      return (!search || job.title.toLowerCase().includes(q) || job.id.toLowerCase().includes(q))
        && (statusFilter === 'All' || job.status === statusFilter)
        && (deptFilter === 'All' || job.dept === deptFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'Most applicants') return b.applicants - a.applicants;
      if (sortBy === 'Best match avg') return b.matchAvg - a.matchAvg;
      return 0;
    });

  const totalActive = jobsList.filter(j => j.status === 'Active').length;
  const totalApplicants = jobsList.reduce((s, j) => s + j.applicants, 0);
  const hasActiveFilters = search || statusFilter !== 'All' || deptFilter !== 'All';

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const topBarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500'
    : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-400';
  const selectCls = isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700';
  const dividerCls = isDark ? 'border-slate-800' : 'border-slate-50';

  const topBar = (
    <header className={`border-b sticky top-0 z-40 ${topBarBg}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recruiter</span>
          <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <span className={`text-sm font-semibold hidden sm:block ${subColor}`}>Jobs</span>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input aria-label="Search jobs" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search title or job ID…"
            className={`w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${inputCls}`} />
        </div>
        <Link href="/recruiter/post-job"
          className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
          <Plus size={15} /><span className="hidden sm:inline">Post job</span>
        </Link>
      </div>
    </header>
  );

  if (isLoading) return (
    <div className={`min-h-screen ${bg}`}>{topBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <div><h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>Job postings</h1></div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className={`h-16 rounded-2xl border ${cardBg}`} />)}
        </div>
      </main>
    </div>
  );

  return (
    <div className={`min-h-screen ${bg}`}>
      {topBar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>Job postings</h1>
          <p className={`text-sm mt-0.5 ${subColor}`}>Manage active and past listings.</p>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-none">
          <SummaryPill label="Total" value={jobsList.length} color="#6366f1" isDark={isDark} />
          <SummaryPill label="Active" value={totalActive} color="#16a34a" isDark={isDark} />
          <SummaryPill label="Applicants" value={totalApplicants} color="#2563eb" isDark={isDark} />
        </div>

        {/* Desktop filters */}
        <div className="hidden sm:flex items-center gap-2.5 flex-wrap">
          <div className={`flex items-center rounded-xl p-1 gap-0.5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            {FILTER_STATUSES.map(f => (
              <button type="button" key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${f === statusFilter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <select aria-label="Filter by department" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className={`appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border rounded-xl focus:outline-none cursor-pointer ${selectCls}`}>
              {deptOptions.map(d => <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>)}
            </select>
            <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <div className="relative ml-auto">
            <select aria-label="Sort jobs" value={sortBy} onChange={e => setSortBy(e.target.value as typeof SORT_OPTIONS[number])}
              className={`appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold border rounded-xl focus:outline-none cursor-pointer ${selectCls}`}>
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          {hasActiveFilters && (
            <button type="button" onClick={() => { setSearch(''); setStatusFilter('All'); setDeptFilter('All'); }}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <div className="sm:hidden flex items-center gap-2">
          <button type="button" onClick={() => setShowMobileFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${showMobileFilters || hasActiveFilters
              ? 'bg-slate-900 text-white border-slate-900'
              : isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>
            <SlidersHorizontal size={13} /> Filters
          </button>
        </div>

        {showMobileFilters && (
          <div className={`sm:hidden rounded-2xl border p-4 space-y-4 ${cardBg}`}>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</p>
              <div className="flex gap-2">
                {FILTER_STATUSES.map(f => (
                  <button type="button" key={f} onClick={() => setStatusFilter(f)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${f === statusFilter
                      ? 'bg-slate-900 text-white border-slate-900'
                      : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className={`text-xs font-semibold tabular-nums ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {filteredJobs.length === jobsList.length ? `${jobsList.length} postings` : `${filteredJobs.length} of ${jobsList.length} postings`}
        </p>

        {/* Desktop table */}
        <div className={`hidden sm:block rounded-2xl border overflow-hidden ${cardBg}`}>
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${dividerCls}`}>
                {['Job title', 'Department', 'Applicants', 'Match avg', 'Status', ''].map((h, i) => (
                  <th key={i} className={`text-left px-5 lg:px-6 py-3 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? filteredJobs.map(job => (
                <tr key={job.id} className={`border-b last:border-0 transition-colors group ${isDark ? `border-slate-800 hover:bg-slate-800/50` : 'border-slate-50 hover:bg-slate-50/60'}`}>
                  <td className="px-5 lg:px-6 py-4">
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.title}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{job.posted}</p>
                  </td>
                  <td className="px-5 lg:px-6 py-4"><DeptBadge dept={job.dept} /></td>
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.applicants}</span>
                      {job.newApplicants > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500">+{job.newApplicants}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-4"><MatchRing value={job.matchAvg} /></td>
                  <td className="px-5 lg:px-6 py-4"><StatusBadge status={job.status} /></td>
                  <td className="px-5 lg:px-6 py-4 text-right">
                    <Link href={`/recruiter/jobs/${job.id}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDark ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-600'}`}>
                      <Eye size={13} /> View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <Search size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No jobs found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
          {filteredJobs.length > 0 && (
            <div className={`px-6 py-3.5 border-t ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-50 bg-slate-50/40'}`}>
              <p className={`text-xs font-semibold tabular-nums ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {filteredJobs.length} of {jobsList.length} postings shown
              </p>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-3">
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
            <div key={job.id} className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`font-semibold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.title}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{job.posted}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
              <DeptBadge dept={job.dept} />
              <div className={`flex items-center gap-4 pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Applicants</span>
                  <span className={`text-base font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.applicants}</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Match avg</span>
                  <MatchRing value={job.matchAvg} />
                </div>
                <Link href={`/recruiter/jobs/${job.id}`}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600/10 text-blue-500 px-3 py-2 rounded-xl">
                  <Eye size={13} /> View
                </Link>
              </div>
            </div>
          )) : (
            <div className={`rounded-2xl border py-14 flex flex-col items-center gap-2 text-center ${cardBg}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <Search size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No jobs found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}