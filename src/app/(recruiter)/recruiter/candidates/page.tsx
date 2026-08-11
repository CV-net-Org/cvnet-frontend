'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, ChevronDown, Loader2, Users, ChevronRight, X, ArrowUpRight
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { auth } from '@/lib/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';

interface Candidate {
  appId: string; userId: string; fullName: string; email: string;
  profileImageUrl: string | null; jobTitle: string; industryScore: number;
  status: string; skills: string[];
}

interface JobFilter { id: string; title: string; }

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  Interview: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  'Technical Test': { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6' },
  Screening: { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
  Applied: { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
  Rejected: { bg: '#fff1f2', color: '#be123c', dot: '#f43f5e' },
  Pending: { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['Pending'];
}

const SORT_OPTIONS = [
  { value: 'desc', label: 'Highest match' }, { value: 'asc', label: 'Lowest match' },
  { value: 'gpa_desc', label: 'Highest GPA' }, { value: 'gpa_asc', label: 'Lowest GPA' },
];

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() ?? '??';
  const colors = [
    ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
    ['#d1fae5', '#065f46'], ['#fef3c7', '#92400e'], ['#e0f2fe', '#0369a1'],
  ];
  const [bg, color] = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  if (imageUrl) return <img src={imageUrl} alt={name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />;
  return <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none" style={{ backgroundColor: bg, color }}>{initials}</div>;
}

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

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#16a34a' : score >= 50 ? '#2563eb' : score >= 30 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-black tabular-nums" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobFilter[]>([]);
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        apiClient.get('/api/candidates/jobs').then(r => setJobs(r.data)).catch(console.error);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!auth.currentUser) return;
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedJobId) params.append('jobId', selectedJobId);
      if (search) params.append('search', search);
      params.append('sortOrder', sortOrder);
      apiClient.get(`/api/candidates?${params}`)
        .then(r => setCandidates(r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [selectedJobId, search, sortOrder]);

  const hasFilters = !!search || !!selectedJobId;
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const topBarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500'
    : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-400';
  const selectCls = isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700';
  const rowHover = isDark ? 'hover:bg-slate-800/50 border-slate-800' : 'hover:bg-slate-50/60 border-slate-50';
  const thCls = isDark ? 'text-slate-600' : 'text-slate-400';
  const divider = isDark ? 'border-slate-800' : 'border-slate-50';

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className={`border-b sticky top-0 z-40 ${topBarBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recruiter</span>
            <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <span className={`text-sm font-semibold hidden sm:block ${subColor}`}>Candidates</span>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input aria-label="Search candidates" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className={`w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${inputCls}`} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-5">
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>Candidates</h1>
          <p className={`text-sm mt-0.5 ${subColor}`}>
            {selectedJob ? `Showing applicants for "${selectedJob.title}"` : 'All applicants across your job postings.'}
          </p>
        </div>

        <div className="flex-1 min-w-0 w-full space-y-4">
          {!loading && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative shrink-0">
                  <select aria-label="Filter by job" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-2.5 text-sm font-semibold border rounded-xl focus:outline-none cursor-pointer max-w-[250px] ${selectCls}`}>
                    {[{ id: '', title: 'All jobs' }, ...jobs].map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <div className="relative shrink-0">
                  <select aria-label="Sort candidates" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-2.5 text-sm font-semibold border rounded-xl focus:outline-none cursor-pointer ${selectCls}`}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                {hasFilters && (
                  <button type="button" onClick={() => { setSearch(''); setSelectedJobId(''); }}
                    className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                    <X size={12} /> Clear filters
                  </button>
                )}
              </div>
              <p className={`text-xs font-semibold tabular-nums ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {loading ? (
            <>
              <div className={`hidden sm:block rounded-2xl border overflow-hidden ${cardBg}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${divider}`}>
                      {['Candidate', 'Applying for', 'Match', 'Stage', ''].map((h, i) => (
                        <th key={i} className={`text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest ${thCls}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map(i => (
                      <tr key={i} className={`border-b ${divider} last:border-0`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl animate-pulse shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                            <div className="space-y-2 flex-1">
                              <div className={`h-3.5 rounded animate-pulse w-32 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                              <div className={`h-2.5 rounded animate-pulse w-24 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><div className={`h-3 rounded animate-pulse w-28 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div></td>
                        <td className="px-5 py-3.5"><div className={`h-1.5 rounded-full animate-pulse w-20 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div></td>
                        <td className="px-5 py-3.5"><div className={`h-6 rounded-lg animate-pulse w-20 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div></td>
                        <td className="px-5 py-3.5 text-right"><div className={`h-4 rounded animate-pulse w-14 ml-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl animate-pulse shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                      <div className="space-y-2 flex-1 pt-1">
                        <div className={`h-3.5 rounded animate-pulse w-3/4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                        <div className={`h-2.5 rounded animate-pulse w-1/2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : candidates.length === 0 ? (
            <div className={`rounded-2xl border py-16 flex flex-col items-center gap-2 text-center ${cardBg}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <Users size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No candidates found</p>
              <p className={`text-xs max-w-[220px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {hasFilters ? 'Try adjusting your search or job filter.' : 'Post a job to start receiving applications.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className={`hidden sm:block rounded-2xl border overflow-hidden ${cardBg}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${divider}`}>
                      {['Candidate', 'Applying for', 'Match', 'Stage', ''].map((h, i) => (
                        <th key={i} className={`text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest ${thCls}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(c => (
                      <React.Fragment key={c.appId}>
                        <tr onClick={() => setExpandedAppId(prev => prev === c.appId ? null : c.appId)}
                          className={`border-b last:border-0 transition-colors group cursor-pointer ${rowHover}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={c.fullName} imageUrl={c.profileImageUrl} />
                              <div className="min-w-0">
                                <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.fullName}</p>
                                <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-medium truncate max-w-[140px] block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{c.jobTitle}</span>
                          </td>
                          <td className="px-5 py-3.5"><ScoreBar score={c.industryScore} /></td>
                          <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                          <td className="px-5 py-3.5 text-right">
                            <Link href={`/recruiter/candidates/${c.appId}`} onClick={e => e.stopPropagation()}
                              className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}>
                              Review <ArrowUpRight size={13} />
                            </Link>
                          </td>
                        </tr>
                        {expandedAppId === c.appId && (
                          <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
                            <td colSpan={5} className="px-5 py-4">
                              <div className="flex flex-col gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Candidate Skills</span>
                                {c.skills?.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {c.skills.map((s, i) => (
                                      <span key={i} className={`text-xs font-medium px-2.5 py-1 rounded-lg shadow-sm ${isDark ? 'bg-slate-700 border border-slate-600 text-slate-200' : 'bg-white border border-slate-200 text-slate-700'}`}>{s}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>No skills listed.</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {candidates.map(c => (
                  <div key={c.appId} className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
                    <div className="flex items-start gap-3">
                      <Avatar name={c.fullName} imageUrl={c.profileImageUrl} />
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.fullName}</p>
                        <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{c.email}</p>
                        <p className="text-xs font-medium text-blue-500 mt-0.5 truncate">{c.jobTitle}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 4).map((s, i) => (
                          <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-slate-50 border border-slate-100 text-slate-600'}`}>{s}</span>
                        ))}
                        {c.skills.length > 4 && <span className={`text-[10px] font-semibold self-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>+{c.skills.length - 4}</span>}
                      </div>
                    )}
                    <div className={`flex items-center justify-between pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Match score</p>
                        <ScoreBar score={c.industryScore} />
                      </div>
                      <Link href={`/recruiter/candidates/${c.appId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600/10 text-blue-500 px-3 py-2 rounded-xl">
                        Review <ArrowUpRight size={12} />
                      </Link>
                    </div>
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