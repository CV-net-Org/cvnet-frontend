'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Briefcase, Search, ChevronDown, Mail, Phone, Loader2,
  GraduationCap, Clock, Users, FileText, UserCircle, DollarSign,
  Brain, Download, ArrowLeft, Award, BookOpen, FolderGit2,
  Globe2, Microscope, HeartHandshake, User as UserIcon, X, ChevronRight,
  ExternalLink, Code
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { auth } from '@/lib/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const pipelineStatuses = ['Pending', 'Interview', 'Rejected'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScoreRingProps {
  score: number;
  label: string;
  colorClass: string;
  subLabel: string;
  dark?: boolean;
}

type FullApplicantProfileDto = {
  appId: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  gpa?: number | null;
  jobRole: string;
  currentOrg?: string;
  currentPosition?: string;

  matchScore: number;
  industryScore: number;
  companySkillMatchScore: number;

  personalStatement: string;
  aboutMe: string;

  cvUrl: string;
  portfolioUrl: string;

  experience?: any[];
  education?: any[];
  skills?: any[];
  projects?: any[];
  publications?: any[];
  certifications?: any[];
  memberships?: any[];
  languages?: any[];
  teachingExperience?: any[];
  researchExperience?: any[];
  awards?: any[];
  volunteers?: any[];
  socialLinks?: any[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMonthYear = (dateString?: string) => {
  if (!dateString) return 'Present';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
  } catch { return dateString; }
};

const asArray = <T,>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value as T];
};

const firstNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
};

// Fix 1: Handle when 'skill' is a pure string in Inline Quick-View mapping
const getSkillName = (skill: any, index: number) => {
  if (typeof skill === 'string') return skill;
  return firstNonEmpty(skill?.skillName, skill?.skill_name, skill?.name, skill?.title, skill?.label, skill?.skill, skill?.domain) || `Skill ${index + 1}`;
};

const getSkillLevel = (skill: any) => {
  if (typeof skill === 'string') return 'Not specified';
  return firstNonEmpty(skill?.level, skill?.proficiency, skill?.proficiencyLevel, skill?.experienceLevel) || 'Not specified';
};

const getLinkLabel = (link: any, index: number) => {
  if (typeof link === 'string') return link;
  return firstNonEmpty(link?.platformName, link?.platform_name, link?.platform, link?.name, link?.title, link?.label) || `Link ${index + 1}`;
};

const normalizeTextList = (value: any) =>
  asArray(value).map((item) => (typeof item === 'string' ? item : firstNonEmpty(item?.name, item?.title, item?.label, item?.skillName, item?.degreeTitle, item?.organizationName, item?.role) || '')).filter(Boolean);

const normalizeProfile = (raw: any): FullApplicantProfileDto => ({
  appId: firstNonEmpty(raw?.appId, raw?.id),
  fullName: firstNonEmpty(raw?.fullName, raw?.name, raw?.displayName, raw?.candidateName),
  email: firstNonEmpty(raw?.email),
  gpa: raw?.gpa ? Number(raw.gpa) : null,
  phone: firstNonEmpty(raw?.phone, raw?.phoneNumber),
  profileImageUrl: firstNonEmpty(raw?.profileImageUrl, raw?.profile_image_url, raw?.photoUrl, raw?.avatarUrl),
  jobRole: firstNonEmpty(raw?.jobRole, raw?.role, raw?.title),
  currentOrg: firstNonEmpty(raw?.currentOrg, raw?.currentOrganization, raw?.organization),
  currentPosition: firstNonEmpty(raw?.currentPosition, raw?.position, raw?.currentTitle),
  matchScore: Number(raw?.matchScore ?? raw?.match_score ?? 0),
  industryScore: Number(raw?.industryScore ?? raw?.industry_score ?? 0),
  companySkillMatchScore: Number(raw?.companySkillMatchScore ?? raw?.CompanySkillMatchScore ?? raw?.company_skill_match_score ?? 0),
  personalStatement: firstNonEmpty(raw?.personalStatement, raw?.personal_statement),
  aboutMe: firstNonEmpty(raw?.aboutMe, raw?.about_me),
  cvUrl: firstNonEmpty(raw?.cvUrl, raw?.cv_url, raw?.resumeUrl),
  portfolioUrl: firstNonEmpty(raw?.portfolioUrl, raw?.portfolio_url),
  experience: asArray(raw?.experience ?? raw?.snapshotExperience ?? raw?.snapshot_experience),
  education: asArray(raw?.education ?? raw?.snapshotEducation ?? raw?.snapshot_education),
  skills: asArray(raw?.skills ?? raw?.snapshotSkills ?? raw?.snapshot_skills),
  projects: asArray(raw?.projects ?? raw?.snapshotProjects ?? raw?.snapshot_projects),
  publications: asArray(raw?.publications ?? raw?.snapshotPublications ?? raw?.snapshot_publications),
  certifications: asArray(raw?.certifications ?? raw?.snapshotCertifications ?? raw?.snapshot_certifications),
  memberships: asArray(raw?.memberships ?? raw?.snapshotMemberships ?? raw?.snapshot_memberships),
  languages: asArray(raw?.languages ?? raw?.snapshotLanguages ?? raw?.snapshot_languages),
  teachingExperience: asArray(raw?.teachingExperience ?? raw?.snapshotTeachingExperience ?? raw?.snapshot_teaching_experience),
  researchExperience: asArray(raw?.researchExperience ?? raw?.snapshotResearchExperience ?? raw?.snapshot_research_experience),
  awards: asArray(raw?.awards ?? raw?.snapshotAwards ?? raw?.snapshot_awards),
  volunteers: asArray(raw?.volunteers ?? raw?.snapshotVolunteers ?? raw?.snapshot_volunteers),
  socialLinks: asArray(raw?.socialLinks ?? raw?.snapshotSocialLinks ?? raw?.snapshot_social_links),
});
// ─── ScoreRing ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, label, colorClass, subLabel, dark = false }: ScoreRingProps) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score || 0;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl border ${
      dark 
        ? 'bg-white/5 border-white/10 backdrop-blur-sm' 
        : 'bg-white border-slate-100 shadow-sm'
    }`}>
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
            className={dark ? 'text-white/10' : 'text-slate-100'} />
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-xl font-black ${dark ? 'text-white' : 'text-slate-800'}`}>{safeScore}%</span>
      </div>
      <p className={`mt-3 text-sm font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{label}</p>
      <p className={`text-[10px] font-medium text-center ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{subLabel}</p>
    </div>
  );
};

// ─── Full Profile Modal ───────────────────────────────────────────────────────
function FullProfileModal({ appId, jobId, onClose }: { appId: string; jobId: string; onClose: () => void }) {
  const [data, setData] = useState<FullApplicantProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    const fetch = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Token and Base URL are handled automatically by apiClient
        const res = await apiClient.get(`/api/JobDetails/applicant-profile/${appId}`);
        
        setData(normalizeProfile(res.data?.data ?? res.data));
      } catch (e) {
        console.error('Failed to load full profile', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [appId]);

  const availableSections = data ? [
    { key: 'experience',        label: 'Experience',    icon: Briefcase,     hasData: !!data.experience?.length },
    { key: 'education',         label: 'Education',     icon: GraduationCap, hasData: !!data.education?.length },
    { key: 'skills',            label: 'Skills',        icon: Brain,         hasData: !!data.skills?.length },
    { key: 'projects',          label: 'Projects',      icon: FolderGit2,    hasData: !!data.projects?.length },
    { key: 'publications',      label: 'Publications',  icon: BookOpen,      hasData: !!data.publications?.length },
    { key: 'researchExperience',label: 'Research',      icon: Microscope,    hasData: !!data.researchExperience?.length },
    { key: 'teachingExperience',label: 'Teaching',      icon: Code,          hasData: !!data.teachingExperience?.length },
    { key: 'certifications',    label: 'Certifications',icon: Award,         hasData: !!data.certifications?.length },
    { key: 'awards',            label: 'Awards',        icon: Award,         hasData: !!data.awards?.length },
    { key: 'languages',         label: 'Languages',     icon: Globe2,        hasData: !!data.languages?.length },
    { key: 'memberships',       label: 'Memberships',   icon: Users,         hasData: !!data.memberships?.length },
    { key: 'volunteers',        label: 'Volunteer',     icon: HeartHandshake,hasData: !!data.volunteers?.length },
    { key: 'about',             label: 'About',         icon: UserIcon,      hasData: !!data.aboutMe || !!data.personalStatement },
  ].filter(s => s.hasData) : [];

  useEffect(() => {
    if (!data || availableSections.length === 0) return;
    setActiveTab(prev => {
      if (!prev) return availableSections[0].key;
      const stillValid = availableSections.some(section => section.key === prev);
      return stillValid ? prev : availableSections[0].key;
    });
  }, [data, availableSections]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-5xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        
        {/* Panel Header */}
        <div className={`sticky top-0 z-20 backdrop-blur border-b px-8 py-4 flex items-center justify-between ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <button type="button" onClick={onClose} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Job Dashboard
            </button>
            {data && (
              <>
                <ChevronRight size={14} />
                <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>{data.fullName}</span>
              </>
            )}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <X size={16} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        )}

        {!isLoading && !data && (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <p className={`text-xl font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Profile Not Found</p>
            <button type="button" onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold mt-4">Go Back</button>
          </div>
        )}

        {data && (
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Identity Banner */}
            <div className={`rounded-[2rem] p-8 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {data.profileImageUrl ? (
                  <img src={data.profileImageUrl} alt={data.fullName} className={`w-24 h-24 shrink-0 rounded-3xl object-cover shadow-lg border ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                ) : (
                  <div className="w-24 h-24 shrink-0 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                    {data.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 text-center md:text-left pt-1">
                  <h1 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.fullName}</h1>
                  {data.currentPosition || data.currentOrg ? (
                    <p className={`text-sm font-bold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {data.currentPosition || data.jobRole} {data.currentOrg && <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>@ {data.currentOrg}</span>}
                    </p>
                  ) : (
                    <p className={`text-sm font-bold mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{data.jobRole}</p>
                  )}

                  <div className={`flex flex-wrap justify-center md:justify-start gap-3 text-sm font-semibold mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <Mail size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} /> {data.email}
                    </span>
                    {data.phone && (
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <Phone size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} /> {data.phone}
                      </span>
                    )}
                  </div>

                  {/* Socials & Portfolios */}
                  <div className="mt-5 grid gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      <Globe2 size={12} /> Online Presence
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {data.portfolioUrl && (
                        <a
                          href={data.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold shadow-sm transition hover:shadow-md ${isDark ? 'border-emerald-900/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          <ExternalLink size={13} /> Portfolio
                        </a>
                      )}
                      {data.cvUrl && (
                        <a
                          href={data.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold shadow-sm transition hover:shadow-md ${isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                          <Download size={13} /> CV / Resume
                        </a>
                      )}
                      {asArray(data.socialLinks).map((link, i) => {
                        const href = firstNonEmpty(link?.profileUrl, link?.url, link?.href);
                        if (!href) return null;
                        const label = getLinkLabel(link, i);
                        return (
                          <a
                            key={`${label}-${i}`}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold shadow-sm transition hover:shadow-md ${isDark ? 'border-blue-900/50 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                          >
                            <Globe2 size={13} /> {label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {data.gpa !== null && data.gpa !== undefined && data.gpa > 0 && (
                    <div className="mt-5 grid gap-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        <Award size={12} /> Academic Excellence
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold shadow-sm transition hover:shadow-md ${isDark ? 'border-violet-900/50 bg-violet-900/20 text-violet-400 hover:bg-violet-900/40' : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'}`}>
                          <GraduationCap size={13} /> GPA: {data.gpa.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                {data.cvUrl && (
                  <a href={data.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-colors shrink-0 text-sm mt-4 md:mt-0">
                    <Download size={16} /> Original CV
                  </a>
                )}
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className={`rounded-[2rem] border shadow-sm overflow-hidden min-h-[400px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  
                  {/* Tab Bar */}
                  <div className={`flex border-b overflow-x-auto p-3 gap-1.5 scrollbar-none ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    {availableSections.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === tab.key
                              ? (isDark ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')
                              : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700')
                          }`}>
                          <Icon size={13} /> {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="p-7">
                    
                    {activeTab === 'experience' && (
                      <div className="space-y-6">
                        {data.experience?.map((exp, i) => (
                          <div key={i} className="flex gap-4">
                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-900/50' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                              <Briefcase size={16} />
                            </div>
                            <div>
                              <h4 className={`font-extrabold text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{exp.roleDescription}</h4>
                              <p className={`font-bold text-sm mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{exp.companyName}</p>
                              <p className="text-slate-400 text-xs font-semibold">{formatMonthYear(exp.startDate)} — {formatMonthYear(exp.endDate)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'education' && (
                      <div className="space-y-6">
                        {data.education?.map((edu, i) => (
                          <div key={i} className={`flex gap-4 border-b pb-6 last:border-0 last:pb-0 ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${isDark ? 'bg-indigo-900/30 text-indigo-400 border-indigo-900/50' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                              <GraduationCap size={16} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-extrabold text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{edu.degreeTitle} <span className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>in {edu.fieldOfStudy}</span></h4>
                              <p className={`font-bold text-sm mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{edu.organization}</p>
                              <p className="text-slate-400 text-xs font-semibold mb-3">{formatMonthYear(edu.startDate)} — {formatMonthYear(edu.endDate)}</p>
                              
                              {(edu.honors || edu.thesisTitle || edu.relevantCoursework) && (
                                <div className={`rounded-xl p-4 text-sm space-y-2 border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100'}`}>
                                  {edu.honors && <p><span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Honors:</span> {edu.honors}</p>}
                                  {edu.thesisTitle && <p><span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Thesis:</span> {edu.thesisTitle}</p>}
                                  {edu.relevantCoursework && <p><span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Coursework:</span> {edu.relevantCoursework}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'skills' && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {asArray(data.skills).map((skill, i) => {
                          const level = getSkillLevel(skill);
                          const name = getSkillName(skill, i);
                          const levelTone =
                            level === 'Expert' ? (isDark ? 'border-emerald-900/50 bg-emerald-900/20 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-700') :
                            level === 'Intermediate' ? (isDark ? 'border-blue-900/50 bg-blue-900/20 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700') :
                            (isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600');
                          return (
                            <div key={`${name}-${i}`} className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${levelTone}`}>
                              <div className="flex items-start justify-between gap-3">
                                <h4 className={`font-extrabold text-sm leading-snug ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{name}</h4>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-black/20' : 'bg-white/80'}`}>
                                  {level}
                                </span>
                              </div>
                              {skill?.description && (
                                <p className={`mt-3 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{skill.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeTab === 'projects' && (
                      <div className="space-y-4">
                        {data.projects?.map((proj, i) => (
                          <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className={`font-bold text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{proj.name}</h4>
                              {proj.sourceLink && (
                                <a href={proj.sourceLink} target="_blank" rel="noreferrer" className={`p-2 rounded-lg ${isDark ? 'text-blue-400 bg-blue-900/30 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700 bg-blue-50'}`}>
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-bold mb-3">{proj.role} • {proj.organization} • {proj.timePeriod}</p>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'researchExperience' && (
                      <div className="space-y-4">
                        {data.researchExperience?.map((res, i) => (
                          <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <h4 className={`font-bold text-base mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{res.projectName}</h4>
                            <p className={`text-xs font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{res.organization}</p>
                            <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{res.resultsDescription}</p>
                            {(res.labOrFieldWork || res.linkedPublicationTitle) && (
                              <div className={`text-xs border-t pt-3 space-y-1 ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-500 border-slate-200'}`}>
                                {res.labOrFieldWork && <p><strong className={isDark ? 'text-slate-400' : 'text-slate-700'}>Methodology:</strong> {res.labOrFieldWork}</p>}
                                {res.linkedPublicationTitle && <p><strong className={isDark ? 'text-slate-400' : 'text-slate-700'}>Publication:</strong> {res.linkedPublicationTitle}</p>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'teachingExperience' && (
                      <div className="space-y-4">
                        {data.teachingExperience?.map((teach, i) => (
                          <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <h4 className={`font-bold text-base mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{teach.coursesTaught}</h4>
                            <p className="text-xs text-slate-500 font-bold mb-3">{teach.organization} • {teach.timePeriod}</p>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{teach.curriculumDescription}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'about' && (
                      <div className="space-y-8">
                        {data.personalStatement && (
                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Personal Statement</h4>
                            <p className={`text-sm leading-relaxed font-medium p-6 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>{data.personalStatement}</p>
                          </div>
                        )}
                        {data.aboutMe && (
                          <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Me</h4>
                            <p className={`text-sm leading-relaxed font-medium p-6 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>{data.aboutMe}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {['publications','certifications','awards','languages','memberships','volunteers'].includes(activeTab) && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {asArray((data as any)[activeTab]).map((item: any, i: number) => {
                          const title = firstNonEmpty(
                            item?.title, 
                            item?.field, 
                            item?.awardName, 
                            item?.award_name,
                            item?.languageName, 
                            item?.language_name,
                            item?.organizationName, 
                            item?.organization_name,
                            item?.role, 
                            item?.organization
                          ) || `Item ${i + 1}`;
                          const meta = firstNonEmpty(item?.issuer, item?.issuedBy, item?.organization, item?.organizationName);
                          return (
                            <div key={`${title}-${i}`} className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className={`text-sm font-extrabold leading-snug ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h4>
                                  {meta && <p className={`mt-1 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{meta}</p>}
                                </div>
                                {item?.sourceLink && (
                                  <a href={item.sourceLink} target="_blank" rel="noreferrer" className={`rounded-xl p-2 transition ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                              {item?.description && <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>}
                              {item?.role && activeTab !== 'volunteers' && (
                                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{item.role}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Score Column */}
              <div>
                <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2rem] p-7 text-white shadow-xl relative overflow-hidden border border-slate-700">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 bg-white/10 border border-white/5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest mb-6 w-max">
                      <Brain size={13} className="text-blue-400" /> Matrix Analysis
                    </div>
                    
                    <div className="flex flex-col gap-4 mb-5">
                      <ScoreRing
                        score={data.industryScore}
                        label="Company Match"
                        subLabel="Overall industry requirement fit"
                        colorClass="text-emerald-400"
                        dark
                      />

                      <ScoreRing
                        score={data.matchScore}
                        label="Skill Alignment"
                        subLabel="Benchmark against posted skills"
                        colorClass="text-blue-400"
                        dark
                      />
                    </div>
                    
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed text-center">
                        Scores calculated from the frozen snapshot at the exact time of application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Job Detail Page ─────────────────────────────────────────────────────
export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('About');

  const [fullProfileAppId, setFullProfileAppId] = useState<string | null>(null);
  const { isDark } = useTheme();

  const sections = [
    { key: 'aboutMe',    label: 'About' },
    { key: 'experience', label: 'Experience' },
    { key: 'education',  label: 'Education' },
    { key: 'skills',     label: 'Skills' },
    { key: 'projects',   label: 'Projects' },
  ];

  const availableTabs = sections.filter(section => {
    if (section.key === 'aboutMe') return !!selectedApplicant?.aboutMe;
    return selectedApplicant?.[section.key] && selectedApplicant[section.key].length > 0;
  });

  useEffect(() => {
    if (!selectedApplicant) return;
    const firstTab = availableTabs[0]?.key || 'aboutMe';
    setActiveTab(firstTab);
  }, [selectedApplicant?.appId]);


  const fetchJobData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const res = await apiClient.get(`/api/JobDetails/${jobId}`);
      
      setJob(res.data.details);
      setApplicants(res.data.applicants);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => { if (user) fetchJobData(); });
    return () => unsub();
  }, [jobId]);

  const handleCloseJob = async () => {
    if (!confirm("Are you sure? This will close the job and reject all pending applicants.")) return;
    try {
      await apiClient.post(`/api/JobDetails/${jobId}/close`, {});
      alert("Job Closed successfully.");
      fetchJobData();
      setIsStatusOpen(false);
    } catch { alert("Error closing job."); }
  };

  const handleRepostJob = async () => {
    try {
      const res = await apiClient.post(`/api/JobDetails/${jobId}/repost`, {});
      alert("Job Reposted successfully!");
      router.push(`/recruiter/jobs/${res.data.newJobId}`);
    } catch { alert("Error reposting job."); }
  };

  const handleApplicantAction = async (appId: string, action: 'interview' | 'reject') => {
    try {
      const endpoint = action === 'interview' ? 'interview' : 'reject';
      const payload = action === 'interview' ? { message: "Invitation to interview" } : { reason: "Position closed or candidate mismatch" };
      await apiClient.post(`/api/JobDetails/applicant/${appId}/${endpoint}`, payload);
      fetchJobData();
    } catch { alert(`Error processing ${action}`); }
  };

  if (isLoading) return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <header className={`border-b sticky top-0 z-40 h-14 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="animate-pulse">
          <div className={`h-6 rounded w-1/4 mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          <div className={`h-4 rounded w-1/3 mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <div key={i} className={`h-24 border rounded-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div className={`h-[600px] border rounded-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}></div>
            <div className={`h-[600px] border rounded-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}></div>
          </div>
        </div>
      </main>
    </div>
  );
  if (!job) return <div className={`p-10 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Not Found.</div>;

  const filteredCandidates = applicants.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const topBarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* ── Top Bar ── */}
      <header className={`border-b sticky top-0 z-40 ${topBarBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recruiter</span>
            <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <Link href="/recruiter/jobs" className={`text-sm font-semibold transition-colors hidden sm:block ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Jobs</Link>
            <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <span className={`text-sm font-semibold hidden sm:block ${headingColor}`}>{job.title}</span>
            {/* Mobile breadcrumb */}
            <Link href="/recruiter/jobs" className={`text-sm font-semibold transition-colors sm:hidden flex items-center gap-1 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
              <ArrowLeft size={14} /> Back
            </Link>
          </div>

          <div className="relative">
            <button type="button" onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`flex items-center gap-1.5 border text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <span className="hidden sm:inline">Manage Job</span>
              <span className="sm:hidden">Manage</span>
              <ChevronDown size={14} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
            </button>
            {isStatusOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl z-50 p-2 border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 shadow-slate-900/50' : 'bg-white border-slate-100 text-slate-700'}`}>
                {job.status === 1 && <button type="button" onClick={handleCloseJob} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${isDark ? 'hover:bg-red-900/30 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-600'}`}>Close Job</button>}
                {job.status === 0 && <button type="button" onClick={handleRepostJob} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${isDark ? 'hover:bg-green-900/30 hover:text-green-400' : 'hover:bg-green-50 hover:text-green-600'}`}>Repost Job</button>}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* ── Page Heading ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>{job.dept}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                job.status === 1 
                  ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
                  : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${job.status === 1 ? isDark ? 'bg-green-400' : 'bg-green-500' : isDark ? 'bg-slate-500' : 'bg-slate-400'}`} />
                {job.status === 1 ? 'Active' : 'Closed'}
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>{job.title}</h1>
            <p className={`text-sm mt-0.5 flex items-center gap-1.5 ${subColor}`}>
              <MapPin size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} /> {job.location} · Posted {job.posted}
            </p>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Applicants', value: job.totalApplicants, icon: Users, accent: isDark ? '#818cf8' : '#6366f1' },
            { label: 'Avg Match', value: job.totalApplicants > 0 ? `${job.avgMatchScore}%` : '-', icon: Brain, accent: isDark ? '#4ade80' : '#16a34a' },
            { label: 'New Applied', value: job.newApplied, icon: UserIcon, accent: isDark ? '#a78bfa' : '#8b5cf6' },
            { label: 'Days Active', value: job.daysActive, icon: Clock, accent: isDark ? '#fbbf24' : '#d97706' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className={`rounded-2xl border p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${cardBg}`}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accent + (isDark ? '20' : '15'), color: accent }}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{label}</p>
                <p className={`text-xl sm:text-2xl font-black tabular-nums leading-none ${headingColor}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          
          {/* LEFT: Job Specs Panel */}
          <div className={`rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-[5.5rem] shadow-sm max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-thin ${isDark ? 'bg-slate-900 border-slate-800 scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600' : 'bg-white border-slate-100 scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300'}`}>
            <h2 className={`text-sm font-bold mb-5 pb-4 border-b flex items-center gap-2 ${isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100'}`}>
              <FileText size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} /> Job Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}><Briefcase size={14} /></div>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Employment</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{job.employmentType} · {job.workplaceType}</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{job.openings} Opening{job.openings > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}><DollarSign size={14} /></div>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Compensation</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{job.currency} {job.salaryRange || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}><Clock size={14} /></div>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Experience</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {job.experience ? `${job.experience.levelName} (${job.experience.minYears}${job.experience.maxYears ? `-${job.experience.maxYears}` : '+'} yrs)` : 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}><GraduationCap size={14} /></div>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Education</p>
                  {job.education.length > 0
                    ? job.education.map((e: string, i: number) => <p key={i} className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{e}</p>)
                    : <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Not specified</p>}
                </div>
              </div>
            </div>

            <div className={`mt-6 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s: any, i: number) => (
                  <span key={i} className={`border text-[11px] font-bold px-2.5 py-1 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                    {firstNonEmpty(s?.name, s?.skillName, s?.title, s?.label) || `Skill ${i + 1}`}
                  </span>
                ))}
              </div>
            </div>
            
            <div className={`mt-6 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
               <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>About the Role</h3>
               <p className={`text-xs whitespace-pre-line leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{job.description}</p>
               
               <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Responsibilities</h3>
               <p className={`text-xs whitespace-pre-line leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{job.responsibilities}</p>
            </div>
          </div>

          {/* RIGHT: Applicants Panel */}
          <div className="space-y-4">
            
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
              <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <h2 className={`text-sm font-bold ${headingColor}`}>Applicants</h2>
                
                <div className={`flex items-center border rounded-xl p-1 gap-0.5 overflow-x-auto scrollbar-none ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  {['All', ...pipelineStatuses].map(tab => (
                    <button type="button" key={tab} onClick={() => setSelectedStatus(tab)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                        tab === selectedStatus 
                          ? isDark ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'bg-white text-slate-900 shadow-sm border border-slate-200'
                          : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                      }`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-4 sm:p-5 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="relative max-w-md">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input aria-label="Search candidates" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search candidates by name..."
                    className={`w-full pl-8 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-400'
                    }`} />
                </div>
              </div>

              <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                {filteredCandidates.map(c => (
                  <div key={c.appId}
                    className={`p-4 sm:p-5 transition-colors cursor-pointer group ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/60'
                    } ${selectedApplicant?.appId === c.appId ? (isDark ? 'bg-slate-800/30' : 'bg-blue-50/30') : ''}`}
                    onClick={() => {
                      if (selectedApplicant?.appId === c.appId) {
                        setSelectedApplicant(null);
                      } else {
                        setSelectedApplicant(c);
                        setActiveTab('About');
                      }
                    }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {c.profileImageUrl ? (
                          <img src={c.profileImageUrl} alt={c.fullName} className={`w-10 h-10 shrink-0 rounded-xl object-cover border ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
                        ) : (
                          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            {c.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={`font-bold text-sm truncate ${headingColor}`}>{c.fullName}</h3>
                            <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              c.status === 'Pending'  ? isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600' :
                              c.status === 'Interview'? isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600' :
                              c.status === 'Rejected' ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600' : 
                              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                            }`}>{c.status}</span>
                          </div>
                          <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.email}</p>
                        </div>
                      </div>

                      <div className={`flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-bold uppercase tracking-wider sm:hidden ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Match</span>
                           <span className={`text-sm font-black tabular-nums ${c.industryScore >= 75 ? (isDark ? 'text-green-400' : 'text-green-600') : c.industryScore >= 50 ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>
                             {c.industryScore}%
                           </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button type="button"
                            onClick={e => { e.stopPropagation(); setFullProfileAppId(c.appId); }}
                            className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'}`}
                          >
                            <UserCircle size={14} /> <span className="hidden sm:inline">Profile</span>
                          </button>
                          
                          <div className="relative">
                            <select aria-label="Applicant action" value="" onChange={e => handleApplicantAction(c.appId, e.target.value as any)} onClick={e => e.stopPropagation()}
                              className={`appearance-none text-xs font-semibold pl-2 pr-6 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:border-blue-500 shadow-sm ${
                                isDark ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/50' : 'bg-white border-slate-200 text-slate-700 focus:ring-blue-500'
                              }`}>
                              <option value="" disabled>Action</option>
                              {c.status !== 'Rejected' && <option value="reject">Reject</option>}
                              {c.status === 'Pending' && <option value="interview">Call</option>}
                            </select>
                            <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredCandidates.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <Search size={20} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                    </div>
                    <p className={`text-sm font-semibold ${headingColor}`}>No candidates found</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try adjusting your filters or search query.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inline Quick-View Panel */}
            {selectedApplicant && (
              <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${cardBg}`}>
                <div className="flex justify-between items-start mb-5">
                  <div className="min-w-0">
                    <h3 className={`text-base font-bold truncate ${headingColor}`}>{selectedApplicant.fullName}</h3>
                    <p className={`text-xs truncate mt-0.5 ${subColor}`}>{selectedApplicant.jobRole}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <button type="button"
                      onClick={() => setFullProfileAppId(selectedApplicant.appId)}
                      className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}>
                      <Brain size={13} /> Full AI Profile
                    </button>
                    <div className="text-right">
                       <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Match</p>
                       <p className={`text-sm font-black tabular-nums leading-none ${selectedApplicant.industryScore >= 75 ? (isDark ? 'text-green-400' : 'text-green-600') : selectedApplicant.industryScore >= 50 ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>
                         {selectedApplicant.industryScore}%
                       </p>
                    </div>
                  </div>
                </div>

                <div className={`flex gap-1.5 overflow-x-auto border-b mb-4 pb-0.5 scrollbar-none ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  {availableTabs.map(tab => (
                    <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tab.key 
                          ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white' 
                          : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className={`text-xs min-h-[100px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {activeTab === 'aboutMe' && <p className="whitespace-pre-line leading-relaxed">{selectedApplicant.aboutMe}</p>}
                  
                  {activeTab === 'experience' && selectedApplicant.experience && (
                    <div className="space-y-4">
                      {selectedApplicant.experience.map((exp: any, i: number) => (
                        <div key={i} className="flex gap-3">
                           <div className={`w-1.5 rounded-full shrink-0 ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`} />
                           <div>
                             <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{exp.title}</p>
                             <p className={`mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{exp.company}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {activeTab === 'skills' && selectedApplicant.skills && (
                    <div className="flex flex-wrap gap-1.5">
                      {asArray(selectedApplicant.skills).map((s: any, i: number) => (
                        <span key={`${getSkillName(s, i)}-${i}`} className={`inline-flex items-center gap-1.5 border px-2 py-1 rounded-md text-[11px] font-semibold ${
                          isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                        }`}>
                          {getSkillName(s, i)}
                          {firstNonEmpty(s?.level, s?.proficiency) && (
                            <span className={`text-[9px] uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {firstNonEmpty(s?.level, s?.proficiency)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`mt-5 pt-4 border-t flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <button type="button"
                    onClick={() => setFullProfileAppId(selectedApplicant.appId)}
                    className={`sm:hidden flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    <Brain size={13} /> Full AI Profile
                  </button>
                  <button type="button" onClick={() => setSelectedApplicant(null)} className={`text-xs font-semibold transition-colors ml-auto ${
                    isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                  }`}>
                    Close preview
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>

      {fullProfileAppId && (
        <FullProfileModal
          appId={fullProfileAppId}
          jobId={jobId}
          onClose={() => setFullProfileAppId(null)}
        />
      )}
    </div>
  );
}