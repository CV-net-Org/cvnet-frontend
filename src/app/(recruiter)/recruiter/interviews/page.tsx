'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Video, UserX, CalendarCheck2,
  Loader2, X, AlertCircle, Share2, CheckCircle2, Copy, Users,
  Settings2, Trash2, ExternalLink, ChevronRight,
  ChevronLeft, ChevronDown, ChevronUp
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { auth } from '@/lib/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';

interface InterviewCandidate {
  callId: string; appId: string; userId: string; fullName: string;
  email: string; profileImageUrl: string | null; jobId: string;
  jobTitle: string; interviewDate: string | null;
}

interface ActivePortal {
  portalId: string; interviewDate: string; expiresAt: string;
  password: string; link: string; jobTitles: string[];
}

const getInitials = (name: string) =>
  name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

function Avatar({ name, imageUrl, size = 10 }: { name: string; imageUrl: string | null; size?: number }) {
  const colors = [
    ['#e0e7ff', '#4338ca'], ['#fce7f3', '#be185d'],
    ['#d1fae5', '#065f46'], ['#fef3c7', '#92400e'], ['#e0f2fe', '#0369a1'],
  ];
  const [bg, color] = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  const cls = `w-${size} h-${size} rounded-xl flex items-center justify-center text-xs font-bold shrink-0`;
  if (imageUrl) return <img src={imageUrl} alt={name} className={`${cls} object-cover border border-slate-700`} />;
  return <div className={cls} style={{ backgroundColor: bg, color }}>{getInitials(name)}</div>;
}

function Modal({ onClose, children, maxWidth = 'max-w-lg', isDark }: {
  onClose: () => void; children: React.ReactNode; maxWidth?: string; isDark: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 bg-slate-900/70 backdrop-blur-sm">
      <div className={`w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, isDark }: {
  title: string; subtitle?: string; onClose: () => void; isDark: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
      <div>
        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        {subtitle && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{subtitle}</p>}
      </div>
      <button type="button" aria-label="Close" onClick={onClose}
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700'}`}>
        <X size={15} />
      </button>
    </div>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />;
}

function InterviewsSkeleton({ isDark }: { isDark: boolean }) {
  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const s = isDark ? 'bg-slate-800' : 'bg-slate-100';
  return (
    <div className="grid lg:grid-cols-5 gap-5 items-start animate-pulse">
      <div className="lg:col-span-3 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <div className={`h-4 w-32 rounded mb-1.5 ${s}`}></div>
                <div className={`h-3 w-20 rounded ${s}`}></div>
              </div>
              <div className={`w-4 h-4 rounded ${s}`}></div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-2">
        <div className={`rounded-2xl border p-4 sm:p-5 sticky top-20 ${card}`}>
          <div className={`h-4 w-32 rounded mb-4 ${s}`}></div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewsPage() {
  const [candidates, setCandidates] = useState<InterviewCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState<InterviewCandidate | null>(null);
  const [rejectModal, setRejectModal] = useState<InterviewCandidate | null>(null);
  const [selectedDateView, setSelectedDateView] = useState<string | null>(null);
  const [shareStep, setShareStep] = useState<'summary' | 'select_jobs' | 'result'>('summary');
  const [selectedJobsToShare, setSelectedJobsToShare] = useState<string[]>([]);
  const [generatedPortal, setGeneratedPortal] = useState<{ link: string; password: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [managePortalsOpen, setManagePortalsOpen] = useState(false);
  const [activePortals, setActivePortals] = useState<ActivePortal[]>([]);
  const [loadingPortals, setLoadingPortals] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { isDark } = useTheme();

  const toggleGroup = (jobTitle: string) => setExpandedGroups(prev => ({ ...prev, [jobTitle]: !prev[jobTitle] }));

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const fetchInterviews = async () => {
    try {
      const res = await apiClient.get('/api/interviews');
      setCandidates(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchActivePortals = async () => {
    setLoadingPortals(true);
    try {
      const res = await apiClient.get('/api/interviews/portals');
      setActivePortals(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingPortals(false); }
  };

  const deletePortal = async (portalId: string) => {
    try {
      await apiClient.delete(`/api/interviews/portals/${portalId}`);
      setActivePortals(prev => prev.filter(p => p.portalId !== portalId));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => { if (user) fetchInterviews(); });
    return () => unsub();
  }, []);

  const handleSchedule = async () => {
    if (!scheduleModal || !selectedDate) return;
    setActionLoading(true);
    try {
      await apiClient.put(`/api/interviews/${scheduleModal.callId}/schedule`, {
        interviewDate: new Date(selectedDate).toISOString()
      });
      setScheduleModal(null); fetchInterviews();
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason) return;
    setActionLoading(true);
    try {
      await apiClient.post(`/api/interviews/${rejectModal.callId}/reject`, { reason: rejectReason });
      setRejectModal(null); fetchInterviews();
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  };

  const handleGeneratePortal = async () => {
    if (!selectedDateView || selectedJobsToShare.length === 0) return;
    setIsGenerating(true);
    try {
      const res = await apiClient.post('/api/interviews/share-portal', {
        interviewDate: new Date(selectedDateView).toISOString(), jobIds: selectedJobsToShare
      });
      setShareStep('result');
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const groupedInterviews = candidates.reduce((acc, curr) => {
    if (!acc[curr.jobTitle]) acc[curr.jobTitle] = [];
    acc[curr.jobTitle].push(curr);
    return acc;
  }, {} as Record<string, InterviewCandidate[]>);

  const scheduledDates = candidates.filter(c => c.interviewDate).map(c => new Date(c.interviewDate!).toDateString());
  const candidatesForSelectedDate = selectedDateView ? candidates.filter(c => c.interviewDate && new Date(c.interviewDate).toDateString() === selectedDateView) : [];
  const groupedDaySummary = candidatesForSelectedDate.reduce((acc, curr) => {
    if (!acc[curr.jobId]) acc[curr.jobId] = { title: curr.jobTitle, candidates: [] };
    acc[curr.jobId].candidates.push(curr);
    return acc;
  }, {} as Record<string, { title: string; candidates: InterviewCandidate[] }>);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const startDayOfWeek = currentMonth.getDay();
  const calendarGrid: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarGrid.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarGrid.push(i);

  const handleDateClick = (day: number) => {
    const clicked = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    if (!scheduledDates.includes(clicked)) return;
    setSelectedDateView(clicked);
    setShareStep('summary');
    setGeneratedPortal(null);
    setSelectedJobsToShare(Array.from(new Set(
      candidates.filter(c => c.interviewDate && new Date(c.interviewDate).toDateString() === clicked).map(c => c.jobId)
    )));
  };

  const scheduledCount = candidates.filter(c => c.interviewDate).length;
  const pendingCount = candidates.filter(c => !c.interviewDate).length;

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const topBarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const divider = isDark ? 'border-slate-800' : 'border-slate-100';
  const pillBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Top Bar */}
      <header className={`border-b sticky top-0 z-40 ${topBarBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recruiter</span>
            <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <span className={`text-sm font-semibold hidden sm:block ${subColor}`}>Interviews</span>
          </div>
          <button type="button" onClick={() => { setManagePortalsOpen(true); fetchActivePortals(); }}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-3.5 py-2 rounded-xl transition-colors ${isDark ? 'text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'}`}>
            <Settings2 size={13} />
            <span className="hidden sm:inline">Manage portals</span>
            <span className="sm:hidden">Portals</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>Interview schedule</h1>
            <p className={`text-sm mt-0.5 ${subColor}`}>Manage and schedule pending interview calls.</p>
          </div>
          {!loading && (
            <div className="flex gap-2 shrink-0">
              <div className={`rounded-xl border px-3.5 py-2 flex items-center gap-2 ${pillBg}`}>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className={`text-xs font-bold tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{scheduledCount} scheduled</span>
              </div>
              <div className={`rounded-xl border px-3.5 py-2 flex items-center gap-2 ${pillBg}`}>
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className={`text-xs font-bold tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{pendingCount} pending</span>
              </div>
            </div>
          )}
        </div>

        {loading ? <InterviewsSkeleton isDark={isDark} /> : (
          <div className="grid lg:grid-cols-5 gap-5 items-start">
            {/* Left: candidate list */}
            <div className="lg:col-span-3 space-y-4">
              {candidates.length === 0 ? (
                <div className={`rounded-2xl border py-16 flex flex-col items-center gap-3 text-center ${cardBg}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <CalendarCheck2 size={20} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                  </div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No pending interview calls</p>
                  <p className={`text-xs max-w-[200px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Candidates moved to the interview stage will appear here.</p>
                </div>
              ) : (
                Object.keys(groupedInterviews).map(jobTitle => {
                  const isExpanded = expandedGroups[jobTitle];
                  return (
                    <div key={jobTitle} className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                      <button type="button" onClick={() => toggleGroup(jobTitle)}
                        className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors focus:outline-none ${isExpanded ? `border-b ${divider}` : ''} ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                        <div>
                          <p className={`text-sm font-bold ${headingColor}`}>{jobTitle}</p>
                          <p className={`text-xs mt-0.5 ${subColor}`}>{groupedInterviews[jobTitle].length} candidate{groupedInterviews[jobTitle].length !== 1 ? 's' : ''}</p>
                        </div>
                        {isExpanded ? <ChevronUp size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} /> : <ChevronDown size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />}
                      </button>

                      {isExpanded && (
                        <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                          {groupedInterviews[jobTitle].map(c => (
                            <div key={c.callId} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <Avatar name={c.fullName} imageUrl={c.profileImageUrl} size={10} />
                                <div className="min-w-0 flex flex-col gap-1.5 sm:gap-0 sm:flex-row sm:items-center">
                                  <div>
                                    <p className={`text-sm font-semibold truncate ${headingColor}`}>{c.fullName}</p>
                                    <p className={`text-xs truncate ${subColor}`}>{c.email}</p>
                                  </div>
                                  <div className="sm:ml-4">
                                    {c.interviewDate ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500 text-[10px] sm:text-xs font-semibold border border-green-500/20">
                                        <Clock size={11} />
                                        {new Date(c.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] sm:text-xs font-semibold border border-amber-500/20">
                                        <Calendar size={11} /> Pending scheduling
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                <button type="button" onClick={() => { setScheduleModal(c); setSelectedDate(''); }}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:py-2.5 rounded-xl transition-colors">
                                  <CalendarCheck2 size={13} /> Book date
                                </button>
                                <button type="button" onClick={() => { setRejectModal(c); setRejectReason(''); }}
                                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-semibold border px-4 py-2 sm:py-2.5 rounded-xl transition-colors ${isDark ? 'bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}>
                                  <UserX size={13} /> Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: calendar */}
            <div className="lg:col-span-2">
              <div className={`rounded-2xl border p-4 sm:p-5 sticky top-20 ${cardBg}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-sm font-bold ${headingColor}`}>
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Previous month"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
                      <ChevronLeft size={15} />
                    </button>
                    <button type="button" aria-label="Next month"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className={`text-center text-[10px] font-bold uppercase py-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {calendarGrid.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} className="aspect-square" />;
                    const gridDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isToday = gridDate.toDateString() === today.toDateString();
                    const hasInterview = scheduledDates.includes(gridDate.toDateString());
                    return (
                      <button key={day} type="button" onClick={() => handleDateClick(day)} disabled={!hasInterview}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold relative transition-all
                        ${hasInterview ? 'cursor-pointer' : 'cursor-default'}
                        ${isToday && hasInterview ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${isToday && !hasInterview ? isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500' : ''}
                        ${!isToday && hasInterview ? isDark ? 'text-slate-200 hover:bg-blue-600/20' : 'text-slate-800 hover:bg-blue-50' : ''}
                        ${!isToday && !hasInterview ? isDark ? 'text-slate-700' : 'text-slate-300' : ''}
                      `}>
                        {day}
                        {hasInterview && (
                          <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-blue-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className={`mt-4 rounded-xl border p-3.5 flex items-start gap-2.5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <AlertCircle size={13} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Blue dot = interview day. Tap to view the day summary and generate a judge board link.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Manage portals modal */}
      {managePortalsOpen && (
        <Modal onClose={() => setManagePortalsOpen(false)} maxWidth="max-w-2xl" isDark={isDark}>
          <ModalHeader title="Active judge boards" subtitle="Manage and revoke active secure portals." onClose={() => setManagePortalsOpen(false)} isDark={isDark} />
          <div className="p-5 sm:p-6 space-y-4">
            {loadingPortals ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
            ) : activePortals.length === 0 ? (
              <div className={`rounded-xl border py-10 text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No active portals</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Generate a portal from a scheduled interview day.</p>
              </div>
            ) : activePortals.map(portal => {
              const linkUrl = `${window.location.origin}${portal.link}`;
              return (
                <div key={portal.portalId} className={`rounded-2xl border p-4 space-y-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-500 mb-1.5">{new Date(portal.interviewDate).toDateString()}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {portal.jobTitles.map((jt, i) => (
                          <span key={i} className={`text-[10px] font-semibold border px-2 py-0.5 rounded-lg ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{jt}</span>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => deletePortal(portal.portalId)} title="Revoke portal"
                      className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isDark ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Divider isDark={isDark} />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Access link</p>
                      <a href={linkUrl} target="_blank" rel="noreferrer"
                        className="text-xs font-medium text-blue-500 hover:text-blue-400 truncate block flex items-center gap-1">
                        <span className="truncate">{linkUrl}</span><ExternalLink size={10} className="shrink-0" />
                      </a>
                    </div>
                    <div className="shrink-0">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PIN</p>
                      <p className={`text-sm font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{portal.password}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => copyToClipboard(`Judge Board Link: ${linkUrl}\nPIN: ${portal.password}`)}
                    className={`w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                    <Copy size={13} /> Copy link + PIN
                  </button>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* Day summary modal */}
      {selectedDateView && (
        <Modal onClose={() => setSelectedDateView(null)} maxWidth="max-w-xl" isDark={isDark}>
          <ModalHeader
            title={shareStep === 'summary' ? 'Daily summary' : shareStep === 'select_jobs' ? 'Create judge board' : 'Portal ready'}
            subtitle={selectedDateView} onClose={() => setSelectedDateView(null)} isDark={isDark} />
          <div className="p-5 sm:p-6 space-y-4">
            {shareStep === 'summary' && (
              <>
                <div className="space-y-4">
                  {Object.keys(groupedDaySummary).map(jobId => (
                    <div key={jobId}>
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={13} className="text-blue-500" />
                        <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{groupedDaySummary[jobId].title}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupedDaySummary[jobId].candidates.map(c => (
                          <div key={c.appId} className={`flex items-center gap-3 rounded-xl border p-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <Avatar name={c.fullName} imageUrl={c.profileImageUrl} size={8} />
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.fullName}</p>
                              <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                                {new Date(c.interviewDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setShareStep('select_jobs')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors">
                  <Share2 size={15} /> Create shareable judge board
                </button>
              </>
            )}

            {shareStep === 'select_jobs' && (
              <>
                <div className={`rounded-xl border p-4 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                  <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    Select which roles to include. Judges will only see candidates for the chosen positions.
                  </p>
                </div>
                <div className="space-y-2">
                  {Object.keys(groupedDaySummary).map(jobId => {
                    const sel = selectedJobsToShare.includes(jobId);
                    return (
                      <label key={jobId} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${sel
                        ? isDark ? 'border-blue-700 bg-blue-900/20' : 'border-blue-300 bg-blue-50'
                        : isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={sel} aria-label={`Select ${groupedDaySummary[jobId].title}`}
                          onChange={e => {
                            if (e.target.checked) setSelectedJobsToShare([...selectedJobsToShare, jobId]);
                            else setSelectedJobsToShare(selectedJobsToShare.filter(id => id !== jobId));
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{groupedDaySummary[jobId].title}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{groupedDaySummary[jobId].candidates.length} candidate(s)</p>
                        </div>
                        {sel && <CheckCircle2 size={15} className="text-blue-500 shrink-0" />}
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShareStep('summary')}
                    className={`flex-1 text-sm font-semibold border py-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'}`}>
                    Back
                  </button>
                  <button type="button" onClick={handleGeneratePortal} disabled={isGenerating || selectedJobsToShare.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl transition-colors">
                    {isGenerating ? <Loader2 className="animate-spin" size={15} /> : 'Generate secure link'}
                  </button>
                </div>
              </>
            )}

            {shareStep === 'result' && generatedPortal && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} className="text-green-500" />
                </div>
                <div>
                  <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure link generated</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Share this link and PIN with interview judges. Expires in 7 days.</p>
                </div>
                <div className={`rounded-2xl border p-4 text-left space-y-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Portal link</p>
                    <p className="text-xs font-medium text-blue-500 break-all">{generatedPortal.link}</p>
                  </div>
                  <Divider isDark={isDark} />
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Access PIN</p>
                    <p className={`text-2xl font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{generatedPortal.password}</p>
                  </div>
                </div>
                <button type="button" onClick={() => copyToClipboard(`Judge Board Link: ${generatedPortal.link}\nPIN: ${generatedPortal.password}`)}
                  className={`w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-colors ${copied
                    ? 'bg-green-600 text-white' : isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                  {copied ? <><CheckCircle2 size={15} /> Copied!</> : <><Copy size={15} /> Copy link + PIN</>}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Schedule modal */}
      {scheduleModal && (
        <Modal onClose={() => setScheduleModal(null)} isDark={isDark}>
          <ModalHeader title="Schedule interview" subtitle={`${scheduleModal.fullName} · ${scheduleModal.jobTitle}`} onClose={() => setScheduleModal(null)} isDark={isDark} />
          <div className="p-5 sm:p-6 space-y-4">
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Candidate</p>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{scheduleModal.fullName}</p>
              <p className="text-xs text-blue-500 font-medium mt-0.5">{scheduleModal.jobTitle}</p>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date &amp; time</label>
              <input type="datetime-local" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} aria-label="Select date and time"
                className={`w-full px-3.5 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setScheduleModal(null)}
                className={`flex-1 text-sm font-semibold border py-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'}`}>
                Cancel
              </button>
              <button type="button" onClick={handleSchedule} disabled={!selectedDate || actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl transition-colors">
                {actionLoading ? <Loader2 className="animate-spin" size={15} /> : 'Confirm booking'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <Modal onClose={() => setRejectModal(null)} isDark={isDark}>
          <ModalHeader title="Reject application" subtitle="This action cannot be undone." onClose={() => setRejectModal(null)} isDark={isDark} />
          <div className="p-5 sm:p-6 space-y-4">
            <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rejectModal.fullName}</p>
              <p className="text-xs text-blue-500 font-medium mt-0.5">{rejectModal.jobTitle}</p>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rejection reason</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Provide a brief reason…"
                className={`w-full px-3.5 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'}`} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setRejectModal(null)}
                className={`flex-1 text-sm font-semibold border py-3 rounded-xl transition-colors ${isDark ? 'text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'}`}>
                Cancel
              </button>
              <button type="button" onClick={handleReject} disabled={!rejectReason || actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl transition-colors">
                {actionLoading ? <Loader2 className="animate-spin" size={15} /> : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}