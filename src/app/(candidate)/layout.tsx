'use client';

import CandidateSidebar from '@/components/CandidateSidebar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function CandidateLayoutInner({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div className={`flex min-h-screen ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <CandidateSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CandidateLayoutInner>{children}</CandidateLayoutInner>
    </ThemeProvider>
  );
}
