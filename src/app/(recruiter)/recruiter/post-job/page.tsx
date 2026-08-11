'use client';

import { useState, useEffect } from 'react';
import {
  X, MapPin, Briefcase, Calendar, Loader2, EyeOff,
  GraduationCap, Banknote, ListChecks, ChevronRight,
  Plus, Check, AlertTriangle
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { auth } from '@/lib/firebaseConfig';
import { useTheme } from '@/context/ThemeContext';

type CategoryData = { id: string; name: string; roles: string[] };
type SkillData = { name: string; level: string; isVisible: boolean; showLevel: boolean };

const WORLD_CURRENCIES = [
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const STEPS = [{ number: 1, label: 'Basics' }, { number: 2, label: 'Requirements' }, { number: 3, label: 'Details' }];

function StepBar({ step, isDark }: { step: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done = step > s.number;
        const active = step === s.number;
        return (
          <div key={s.number} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-blue-600 text-white' : active ? isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                {done ? <Check size={13} /> : s.number}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${active ? isDark ? 'text-white' : 'text-slate-900' : done ? 'text-blue-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors ${step > s.number ? 'bg-blue-500' : isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workplaceType, setWorkplaceType] = useState('REMOTE');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  const [newSkillIsVisible, setNewSkillIsVisible] = useState(true);
  const [newSkillShowLevel, setNewSkillShowLevel] = useState(true);
  const [expLevelName, setExpLevelName] = useState('');
  const [expMinYears, setExpMinYears] = useState(0);
  const [expMaxYears, setExpMaxYears] = useState(0);
  const [educations, setEducations] = useState<string[]>([]);
  const [newDegree, setNewDegree] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [openings, setOpenings] = useState(1);
  const [hrEmail, setHrEmail] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState(
    new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  );
  const { isDark } = useTheme();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (user) {
        setHrEmail(user.email || '');
        const token = await user.getIdToken(true).catch(() => null);
        if (token) {
          apiClient.get('/api/CompanyJob/categories').then(res => {
            setCategories(res.data);
            if (res.data.length > 0) { setCategoryId(res.data[0].id); setJobTitle(res.data[0].roles[0] || ''); }
          }).catch(console.error);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat?.roles.length) setJobTitle(cat.roles[0]);
  }, [categoryId, categories]);

  const addSkill = () => {
    const name = newSkillName.trim();
    if (name && !skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setSkills([...skills, { name, level: newSkillLevel, isVisible: newSkillIsVisible, showLevel: newSkillShowLevel }]);
      setNewSkillName(''); setNewSkillIsVisible(true); setNewSkillShowLevel(true);
    }
  };

  const addEducation = () => {
    const deg = newDegree.trim();
    if (deg && !educations.includes(deg)) { setEducations([...educations, deg]); setNewDegree(''); }
  };

  const handlePostJob = async () => {
    setIsLoading(true);
    try {
      let token = await auth.currentUser?.getIdToken();
      if (!token) { const m = document.cookie.match(/(?:^|; )cvnet_token=([^;]*)/); token = m?.[1]; }
      if (!token) { alert('Authentication lost. Please reload.'); setIsLoading(false); return; }
      await apiClient.post('/api/CompanyJob/create', {
        categoryId, jobTitle, employmentType, workplaceType,
        location: location || null, openings, description: description || null,
        responsibilities: responsibilities || null, salaryRange: salaryRange || null,
        currency, applicationDeadline: new Date(applicationDeadline).toISOString(),
        hrContactEmail: hrEmail, skills,
        experience: expLevelName ? { levelName: expLevelName, minYears: expMinYears, maxYears: expMaxYears } : null,
        educations,
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Job posted successfully!');
      window.location.href = '/recruiter/dashboard';
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to post job.');
      setIsLoading(false);
    }
  };

  const deptName = categories.find(c => c.id === categoryId)?.name ?? 'Department';
  const currencySymbol = WORLD_CURRENCIES.find(c => c.code === currency)?.symbol ?? currency;
  const visibleSkills = skills.filter(s => s.isVisible);

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const topBarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const labelCls = `block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const inputCls = `w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400'}`;
  const selectCls = `w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-700 focus:border-blue-400'}`;
  const textareaCls = `w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400'}`;
  const sectionCardCls = `rounded-2xl border p-5 sm:p-6 space-y-4 ${cardBg}`;

  return (
    <div className={`min-h-screen ${bg}`}>
      <header className={`border-b sticky top-0 z-40 ${topBarBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recruiter</span>
          <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <span className={`text-sm font-semibold hidden sm:block ${subColor}`}>Post job</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>Post a new position</h1>
          <p className={`text-sm mt-0.5 ${subColor}`}>Fill in the details to publish this role to the network.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5 lg:gap-6 items-start">
          {/* Form */}
          <div className="lg:col-span-3 space-y-4">
            <StepBar step={step} isDark={isDark} />

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Role</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>Select the department and job title for this posting.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Department</label>
                      <select aria-label="Department" value={categoryId} onChange={e => setCategoryId(e.target.value)} className={selectCls}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select></div>
                    <div><label className={labelCls}>Job title</label>
                      <select aria-label="Job title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className={selectCls}>
                        {(categories.find(c => c.id === categoryId)?.roles ?? []).map(r => <option key={r} value={r}>{r}</option>)}
                      </select></div>
                  </div>
                </div>

                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Work arrangement</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>How and where will this role be performed?</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Employment type</label>
                      <select aria-label="Employment type" value={employmentType} onChange={e => setEmploymentType(e.target.value)} className={selectCls}>
                        <option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option>
                      </select></div>
                    <div><label className={labelCls}>Workplace type</label>
                      <select aria-label="Workplace type" value={workplaceType} onChange={e => setWorkplaceType(e.target.value)} className={selectCls}>
                        <option value="REMOTE">Remote</option><option value="HYBRID">Hybrid</option><option value="ONSITE">On-Site</option>
                      </select></div>
                  </div>
                  <div><label className={labelCls}>Location <span className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span></label>
                    <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className={inputCls} /></div>
                </div>

                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Description</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>Give candidates a clear overview of the role.</p>
                  </div>
                  <div><label className={labelCls}>Job description <span className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span></label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="General overview of the role and its impact…" className={textareaCls} /></div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Responsibilities</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>What will this person do day-to-day?</p>
                  </div>
                  <textarea value={responsibilities} onChange={e => setResponsibilities(e.target.value)} rows={5}
                    placeholder={'• Lead the development of…\n• Collaborate with cross-functional teams…'} className={textareaCls} />
                </div>

                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Technical skills</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>Add required skills — control what candidates see.</p>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-2">
                      {skills.map(skill => (
                        <span key={skill.name} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${skill.isVisible
                          ? isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-100'
                          : isDark ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {!skill.isVisible && <EyeOff size={10} />}
                          {skill.name}
                          {skill.showLevel && <span className="opacity-60 text-[10px]">({skill.level.toLowerCase()})</span>}
                          <button type="button" aria-label="Remove skill" onClick={() => setSkills(skills.filter(s => s.name !== skill.name))}
                            className={`hover:text-red-500 transition-colors ml-0.5`}><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={`rounded-xl border p-4 space-y-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex gap-2">
                      <input value={newSkillName} onChange={e => setNewSkillName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()}
                        placeholder="e.g. React.js" className={`${inputCls} flex-1 min-w-0`} />
                      <select aria-label="Skill level" value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} className={`${selectCls} !w-36 shrink-0`}>
                        <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="EXPERT">Expert</option>
                      </select>
                      <button type="button" onClick={addSkill} disabled={!newSkillName.trim()}
                        className={`shrink-0 inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                        <Plus size={13} /> Add
                      </button>
                    </div>
                    <div className={`flex gap-5 pt-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newSkillIsVisible} onChange={e => setNewSkillIsVisible(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Show to candidates</span>
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer ${!newSkillIsVisible ? 'opacity-40 pointer-events-none' : ''}`}>
                        <input type="checkbox" checked={newSkillShowLevel} onChange={e => setNewSkillShowLevel(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Show level</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Education</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>Specify any required degrees or qualifications.</p>
                  </div>
                  {educations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {educations.map(deg => (
                        <span key={deg} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${isDark ? 'bg-violet-900/30 text-violet-400 border-violet-800' : 'bg-violet-50 text-violet-700 border-violet-100'}`}>
                          <GraduationCap size={11} />{deg}
                          <button type="button" aria-label="Remove education" onClick={() => setEducations(educations.filter(e => e !== deg))} className="hover:text-red-500 ml-0.5"><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input value={newDegree} onChange={e => setNewDegree(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEducation()}
                      placeholder="e.g. BSc Hons in Computer Science" className={`${inputCls} flex-1 min-w-0`} />
                    <button type="button" onClick={addEducation} disabled={!newDegree.trim()}
                      className={`shrink-0 inline-flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </div>

                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Experience</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>Set the experience level required for this role.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-1"><label className={labelCls}>Level name <span className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span></label>
                      <input value={expLevelName} onChange={e => setExpLevelName(e.target.value)} placeholder="e.g. Mid-Level" className={inputCls} /></div>
                    <div><label className={labelCls}>Min years</label><input type="number" value={expMinYears} onChange={e => setExpMinYears(Number(e.target.value))} min={0} className={inputCls} /></div>
                    <div><label className={labelCls}>Max years</label><input type="number" value={expMaxYears} onChange={e => setExpMaxYears(Number(e.target.value))} min={0} className={inputCls} /></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Compensation</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>Salary details help attract the right candidates.</p>
                  </div>
                  <div><label className={labelCls}>Salary range <span className={`font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span></label>
                    <div className="flex gap-2">
                      <select aria-label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} className={`${selectCls} !w-28 shrink-0`}>
                        {WORLD_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                      </select>
                      <input value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="80,000 – 120,000" className={`${inputCls} flex-1 min-w-0`} />
                    </div></div>
                </div>
                <div className={sectionCardCls}>
                  <div>
                    <h3 className={`text-sm font-bold ${headingColor}`}>Listing settings</h3>
                    <p className={`text-xs mt-0.5 ${subColor}`}>Configure deadline, openings, and contact details.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><label className={labelCls}>Application deadline</label><input type="date" value={applicationDeadline} onChange={e => setApplicationDeadline(e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Number of openings</label><input type="number" value={openings} onChange={e => setOpenings(Number(e.target.value))} min={1} className={inputCls} /></div>
                  </div>
                  <div><label className={labelCls}>HR contact email</label><input type="email" value={hrEmail} onChange={e => setHrEmail(e.target.value)} placeholder="hr@company.com" className={inputCls} /></div>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 1}
                className={`px-5 py-2.5 text-sm font-semibold border rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors ${isDark ? 'text-slate-300 border-slate-700 hover:bg-slate-800' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                Back
              </button>
              <button type="button" onClick={() => step < 3 ? setStep(s => s + 1) : setShowConfirmModal(true)} disabled={isLoading}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors disabled:opacity-70 ${step === 3 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {step === 3 ? 'Publish position' : 'Continue'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl border overflow-hidden sticky top-20 ${cardBg}`}>
              <div className="bg-slate-900 px-5 py-3.5 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs font-bold text-white uppercase tracking-widest">Candidate preview</p>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h4 className={`font-bold text-base leading-snug truncate ${headingColor}`}>{jobTitle || 'Job title'}</h4>
                    <p className="text-xs font-semibold text-blue-500 mt-0.5">{deptName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { icon: Briefcase, text: employmentType.replace('_', ' ') },
                    location ? { icon: MapPin, text: location } : null,
                    salaryRange ? { icon: Banknote, text: `${currencySymbol} ${salaryRange}` } : null,
                    applicationDeadline ? { icon: Calendar, text: `Deadline ${applicationDeadline}` } : null,
                  ].map((pill, i) => {
                    if (!pill) return null;
                    const Icon = pill.icon;
                    return (
                      <span key={i} className={`inline-flex items-center gap-1.5 border text-[11px] font-semibold px-2.5 py-1.5 rounded-lg ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                        <Icon size={11} className={isDark ? 'text-slate-500' : 'text-slate-400'} /> {pill.text}
                      </span>
                    );
                  })}
                </div>
                {responsibilities && (
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <ListChecks size={11} /> Responsibilities
                    </p>
                    <p className={`text-xs whitespace-pre-line leading-relaxed rounded-xl border p-3.5 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                      {responsibilities}
                    </p>
                  </div>
                )}
                {visibleSkills.length > 0 && (
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Required skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleSkills.map(s => (
                        <span key={s.name} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                          {s.name}{s.showLevel && <span className="text-slate-400 text-[9px] ml-0.5">({s.level.toLowerCase()})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button type="button" disabled className={`w-full text-sm font-semibold py-3 rounded-xl opacity-40 cursor-default mt-2 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 text-white'}`}>
                  Apply for this position
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-xl w-full max-w-sm overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-amber-600" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${headingColor}`}>Publish this position?</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Posted jobs cannot be edited later. Please review your details before publishing.
              </p>
            </div>
            <div className={`p-4 border-t flex items-center gap-3 justify-end ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <button type="button" onClick={() => setShowConfirmModal(false)} disabled={isLoading}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                Cancel
              </button>
              <button type="button" onClick={() => { setShowConfirmModal(false); handlePostJob(); }} disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors disabled:opacity-70">
                {isLoading && <Loader2 size={14} className="animate-spin" />} Yes, publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}