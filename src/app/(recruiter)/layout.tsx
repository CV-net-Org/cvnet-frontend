'use client';

import RecruiterSidebar from '@/components/RecruiterSidebar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function RecruiterLayoutInner({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <div className={`flex min-h-screen ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <RecruiterSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RecruiterLayoutInner>{children}</RecruiterLayoutInner>
    </ThemeProvider>
  );
}
