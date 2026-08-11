'use client';

import {
  User, Building2, Bell, ShieldCheck, Brain, Save, Camera,
  Globe, Mail, Zap, ChevronRight, Loader2, CheckCircle2,
  AlertCircle, Phone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged, updateProfile, updateEmail, User as FirebaseUser } from 'firebase/auth';
import apiClient from '@/lib/apiClient';
import { useTheme } from '@/context/ThemeContext';

type SectionId = 'profile' | 'company' | 'ai' | 'notifications' | 'security';
type StatusMsg = { type: 'success' | 'error'; text: string | null };

function FieldLabel({ htmlFor, children, isDark }: { htmlFor?: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <label htmlFor={htmlFor} className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; isDark: boolean }) {
  const { icon: Icon, className, isDark, ...rest } = props;
  return (
    <div className="relative">
      {Icon && <Icon size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
      <input
        {...rest}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400'} ${className ?? ''}`}
      />
    </div>
  );
}

function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { isDark: boolean }) {
  const { isDark, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full px-3.5 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400'} ${props.className ?? ''}`}
    />
  );
}

function FieldGroup({ label, htmlFor, children, isDark }: { label: string; htmlFor?: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div>
      <FieldLabel htmlFor={htmlFor} isDark={isDark}>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />;
}

function SectionHeading({ title, subtitle, isDark }: { title: string; subtitle?: string; isDark: boolean }) {
  return (
    <div>
      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      {subtitle && <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{subtitle}</p>}
    </div>
  );
}

function ContentCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-6 space-y-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      {children}
    </div>
  );
}

function Toggle({ on, isDark }: { on: boolean; isDark: boolean }) {
  return (
    <div className={`w-10 h-5 rounded-full relative shrink-0 cursor-pointer transition-colors ${on ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </div>
  );
}

function SettingRow({ label, sub, action, isDark }: { label: string; sub: string; action: React.ReactNode; isDark: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{label}</p>
        <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function StatusBanner({ msg }: { msg: StatusMsg }) {
  if (!msg.text) return null;
  const ok = msg.type === 'success';
  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold border mb-4 ${ok ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
      {ok ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
      <span>{msg.text}</span>
    </div>
  );
}

function LoadingState({ isDark }: { isDark: boolean }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={26} />
        <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading settings…</p>
      </div>
    </div>
  );
}

export default function RecruiterSettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [status, setStatus] = useState<StatusMsg>({ type: 'success', text: null });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [hrContactPhone, setHrContactPhone] = useState('');

  const { isDark } = useTheme();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        setCurrentUser(user);
        setFullName(user.displayName || '');
        setEmail(user.email || '');
        try {
          const res = await apiClient.get('/api/CompanyProfile');
          if (res.data) {
            setCompanyName(res.data.name || '');
            setWebsiteUrl(res.data.siteLink || '');
            setCompanyDescription(res.data.description || '');
            setHrContactPhone(res.data.hrContactPhone || '');
            setProfileImageUrl(res.data.logoUrl || null);
          }
        } catch (e) { console.error('Failed to load company data', e); }
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (file.size > 5 * 1024 * 1024) { setStatus({ type: 'error', text: 'File exceeds 5 MB limit.' }); return; }
    setIsSaving(true); setStatus({ type: 'success', text: null });
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await apiClient.post('/api/CompanyProfile/upload-logo', fd);
      if (res.data.status === 'success') {
        await updateProfile(currentUser, { photoURL: res.data.logoUrl });
        setProfileImageUrl(res.data.logoUrl);
        setStatus({ type: 'success', text: 'Company logo updated.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', text: err.response?.data?.error || 'Upload failed.' });
    } finally { setIsSaving(false); }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true); setStatus({ type: 'success', text: null });
    try {
      if (fullName !== currentUser.displayName) await updateProfile(currentUser, { displayName: fullName });
      if (email !== currentUser.email) await updateEmail(currentUser, email);
      setStatus({ type: 'success', text: 'Account credentials saved.' });
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'Failed to save.' });
    } finally { setIsSaving(false); }
  };

  const handleSaveCompany = async () => {
    if (!currentUser) return;
    setIsSaving(true); setStatus({ type: 'success', text: null });
    try {
      await apiClient.put('/api/CompanyProfile/update', {
        name: companyName, description: companyDescription,
        siteLink: websiteUrl, hrContactPhone, employeeCount: 'SMALL_2_10',
      });
      setStatus({ type: 'success', text: 'Company details updated.' });
    } catch (err: any) {
      setStatus({ type: 'error', text: err.response?.data?.error || 'Update failed.' });
    } finally { setIsSaving(false); }
  };

  const handleSave = () => {
    if (activeSection === 'profile') handleSaveProfile();
    else if (activeSection === 'company') handleSaveCompany();
    else { setIsSaving(true); setTimeout(() => setIsSaving(false), 800); }
  };

  const changeSection = (id: SectionId) => { setActiveSection(id); setStatus({ type: 'success', text: null }); };

  const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'My profile', icon: User },
    { id: 'company', label: 'Company info', icon: Building2 },
    { id: 'ai', label: 'AI preferences', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  const saveable: SectionId[] = ['profile', 'company', 'ai', 'notifications'];

  if (isLoading) return <LoadingState isDark={isDark} />;

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-50';
  const topBarBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Top Bar */}
      <header className={`border-b sticky top-0 z-40 ${topBarBg}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">
          <span className={`text-sm font-semibold hidden sm:block ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recruiter</span>
          <ChevronRight size={14} className={`hidden sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <span className={`text-sm font-semibold hidden sm:block ${subColor}`}>Settings</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 sm:pb-10">
        <div className="mb-5">
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${headingColor}`}>Settings</h1>
          <p className={`text-sm mt-0.5 ${subColor}`}>Manage your account, company, and preferences.</p>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 scrollbar-none">
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => changeSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${active
                  ? isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-900 text-white border-slate-900'
                  : isDark ? 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                <s.icon size={13} /> {s.label}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-5 lg:gap-6 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className={`rounded-2xl border p-2 space-y-0.5 sticky top-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              {SECTIONS.map(s => {
                const active = activeSection === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => changeSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${active
                      ? isDark ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'
                      : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                    <s.icon size={15} />
                    <span className="flex-1">{s.label}</span>
                    {active && <ChevronRight size={13} className="opacity-40" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-4">
            <StatusBanner msg={status} />

            {/* Profile */}
            {activeSection === 'profile' && (
              <>
                <ContentCard isDark={isDark}>
                  <SectionHeading title="Company logo" subtitle="Shown on all job listings and candidate-facing pages." isDark={isDark} />
                  <Divider isDark={isDark} />
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    <label className="relative group cursor-pointer self-start sm:self-auto shrink-0">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSaving} aria-label="Upload logo" />
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Logo" className={`w-16 h-16 rounded-2xl object-cover border group-hover:border-blue-500 transition-colors ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center transition-colors group-hover:border-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                          <Camera size={22} />
                        </div>
                      )}
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                        <Zap size={10} className="text-white" fill="white" />
                      </div>
                    </label>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{profileImageUrl ? 'Logo uploaded' : 'No logo yet'}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PNG or JPG · max 5 MB.</p>
                      <label className="inline-block mt-2 text-xs font-semibold text-blue-500 hover:text-blue-400 cursor-pointer transition-colors">
                        {profileImageUrl ? 'Change logo' : 'Upload logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isSaving} aria-label="Change logo" />
                      </label>
                    </div>
                  </div>
                </ContentCard>

                <ContentCard isDark={isDark}>
                  <SectionHeading title="Login credentials" subtitle="Your name and email used to sign in." isDark={isDark} />
                  <Divider isDark={isDark} />
                  <FieldGroup label="Full name" htmlFor="full-name" isDark={isDark}>
                    <TextInput id="full-name" value={fullName} onChange={e => setFullName(e.target.value)} icon={User} placeholder="Your name" isDark={isDark} />
                  </FieldGroup>
                  <FieldGroup label="Email address" htmlFor="email" isDark={isDark}>
                    <TextInput id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={Mail} placeholder="you@company.com" isDark={isDark} />
                  </FieldGroup>
                </ContentCard>

                <div className={`rounded-2xl border p-4 sm:p-6 ${isDark ? 'bg-slate-900 border-red-900/50' : 'bg-white border-red-100'}`}>
                  <p className={`text-sm font-bold mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Danger zone</p>
                  <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Deleting your account is permanent and cannot be undone. All data will be lost.
                  </p>
                  <button type="button" className={`w-full sm:w-auto text-sm font-semibold border px-5 py-2.5 rounded-xl transition-colors ${isDark ? 'text-red-400 border-red-900/50 bg-red-950/20 hover:bg-red-900/40 hover:text-red-300' : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-600 hover:text-white'}`}>
                    Delete account
                  </button>
                </div>
              </>
            )}

            {/* Company */}
            {activeSection === 'company' && (
              <ContentCard isDark={isDark}>
                <SectionHeading title="Company information" subtitle="These details appear on your public job listings." isDark={isDark} />
                <Divider isDark={isDark} />
                <FieldGroup label="Company name" htmlFor="company-name" isDark={isDark}>
                  <TextInput id="company-name" value={companyName} onChange={e => setCompanyName(e.target.value)} icon={Building2} placeholder="e.g. Acme Corp" isDark={isDark} />
                </FieldGroup>
                <FieldGroup label="Website URL" htmlFor="website" isDark={isDark}>
                  <TextInput id="website" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} icon={Globe} placeholder="https://example.com" isDark={isDark} />
                </FieldGroup>
                <FieldGroup label="HR contact phone" htmlFor="phone" isDark={isDark}>
                  <TextInput id="phone" value={hrContactPhone} onChange={e => setHrContactPhone(e.target.value)} icon={Phone} placeholder="+1 (555) 123-4567" isDark={isDark} />
                </FieldGroup>
                <FieldGroup label="Company description" htmlFor="desc" isDark={isDark}>
                  <TextareaInput id="desc" rows={4} value={companyDescription} onChange={e => setCompanyDescription(e.target.value)} placeholder="Tell candidates about your company's mission and culture…" isDark={isDark} />
                </FieldGroup>
              </ContentCard>
            )}

            {/* AI Preferences */}
            {activeSection === 'ai' && (
              <ContentCard isDark={isDark}>
                <SectionHeading title="AI screening" subtitle="Control how the AI ranks and filters incoming candidates." isDark={isDark} />
                <Divider isDark={isDark} />
                <div className="space-y-4">
                  <SettingRow label="Strictness level" sub="How strictly the AI matches candidate skills to requirements." isDark={isDark}
                    action={
                      <select aria-label="Strictness level"
                        className={`w-full sm:w-auto text-xs font-semibold border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                        <option>Balanced</option><option>Strict</option><option>Flexible</option>
                      </select>
                    } />
                  <Divider isDark={isDark} />
                  <SettingRow label="Auto-reject low matches" sub="Automatically reject candidates scoring below 40%." action={<Toggle on={true} isDark={isDark} />} isDark={isDark} />
                  <Divider isDark={isDark} />
                  <SettingRow label="Prioritise required skills" sub="Weight required skills higher than optional ones in scoring." action={<Toggle on={false} isDark={isDark} />} isDark={isDark} />
                </div>
                <div className={`rounded-xl p-4 border ${isDark ? 'bg-blue-900/20 border-blue-900/40' : 'bg-blue-50 border-blue-100'}`}>
                  <div className="flex items-start gap-2.5">
                    <Brain size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      AI scores are frozen at the time of application. These settings only affect future applications.
                    </p>
                  </div>
                </div>
              </ContentCard>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <ContentCard isDark={isDark}>
                <SectionHeading title="Notification preferences" subtitle="Choose how and when you receive alerts." isDark={isDark} />
                <Divider isDark={isDark} />
                <div className="space-y-4">
                  {[
                    { label: 'New applicant received', sub: 'Alert when someone applies to your posting.', on: true },
                    { label: 'Match score above 80%', sub: 'Notify on high-quality candidate matches.', on: true },
                    { label: 'Deadline approaching', sub: 'Remind 3 days before a posting closes.', on: false },
                    { label: 'Weekly summary digest', sub: 'Email summary of all activity each Monday.', on: false },
                  ].map((item, i, arr) => (
                    <div key={i}>
                      <SettingRow label={item.label} sub={item.sub} action={<Toggle on={item.on} isDark={isDark} />} isDark={isDark} />
                      {i < arr.length - 1 && <Divider isDark={isDark} />}
                    </div>
                  ))}
                </div>
              </ContentCard>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <ContentCard isDark={isDark}>
                <SectionHeading title="Security" subtitle="Manage your password and account access." isDark={isDark} />
                <Divider isDark={isDark} />
                <div className="space-y-4">
                  <SettingRow label="Password" sub="Last changed 30 days ago." isDark={isDark}
                    action={<button type="button" className={`w-full sm:w-auto text-xs font-semibold border px-4 py-2.5 rounded-xl transition-colors ${isDark ? 'text-blue-400 border-blue-900/40 bg-blue-950/20 hover:bg-blue-900/40' : 'text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100'}`}>Change password</button>} />
                  <Divider isDark={isDark} />
                  <SettingRow label="Two-factor authentication" sub="Add an extra layer of protection to your account." isDark={isDark}
                    action={<button type="button" className={`w-full sm:w-auto text-xs font-semibold border px-4 py-2.5 rounded-xl transition-colors ${isDark ? 'text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>Enable 2FA</button>} />
                  <Divider isDark={isDark} />
                  <SettingRow label="Active sessions" sub="1 session currently active on this device." isDark={isDark}
                    action={<button type="button" className={`w-full sm:w-auto text-xs font-semibold border px-4 py-2.5 rounded-xl transition-colors ${isDark ? 'text-red-400 border-red-900/40 bg-red-950/20 hover:bg-red-900/40' : 'text-red-600 border-red-100 bg-red-50 hover:bg-red-100'}`}>Sign out all</button>} />
                </div>
              </ContentCard>
            )}
          </div>
        </div>
      </main>

      {/* Save bar */}
      {saveable.includes(activeSection) && (
        <>
          <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 safe-area-inset-bottom ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <StatusBanner msg={status} />
            <button type="button" onClick={handleSave} disabled={isSaving}
              className={`w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
              {isSaving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save changes</>}
            </button>
          </div>
          <div className="hidden lg:block max-w-5xl mx-auto px-6 pb-8">
            <div className={`ml-[calc(25%+1.5rem)] rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                Changes are saved securely to your account.
              </p>
              <button type="button" onClick={handleSave} disabled={isSaving}
                className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 shadow-sm ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save changes</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}