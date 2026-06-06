import Link from 'next/link';
import { Search, Plus, TrendingUp, TrendingDown, Users, Briefcase } from 'lucide-react';

const statsData = [
  { label: 'Total Applications', value: '1,248', change: '+12% vs last month', up: true },
  { label: 'Avg Match Score', value: '78%', change: '+5% vs last month', up: true },
  { label: 'Open Positions', value: '12', change: '-2% vs last month', up: false },
];

const topCandidates = [
  { name: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'Senior Product Designer', match: 95, stage: 'Interview' },
  { name: 'Michael Chen', email: 'm.chen@dev.io', role: 'Full Stack Engineer', match: 88, stage: 'Technical Test' },
  { name: 'David Ross', email: 'd.ross@mail.com', role: 'Data Scientist', match: 82, stage: 'Screening' },
];

const skillDistribution = [
  { skill: 'Python (Backend)', pct: 40, color: 'bg-blue-600' },
  { skill: 'React (Frontend)', pct: 30, color: 'bg-indigo-500' },
  { skill: 'UI/UX Design', pct: 20, color: 'bg-violet-500' },
];

const monthlyData = [65, 82, 71, 90, 78, 95];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const stageColors: Record<string, string> = {
  Interview: 'bg-blue-100 text-blue-700',
  'Technical Test': 'bg-violet-100 text-violet-700',
  Screening: 'bg-amber-100 text-amber-700',
};

export default function RecruiterDashboardPage() {
  const maxBar = Math.max(...monthlyData);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Recruitment Overview</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search candidates..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-48" />
          </div>
          <Link href="/recruiter/post-job" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95">
            <Plus size={16} /> Post Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {statsData.map(({ label, value, change, up }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
            <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
              {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Application Trends Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 tracking-tight">Application Trends</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly applicant volume over time</p>
            </div>
            <span className="text-xs text-slate-400 border border-slate-200 px-2.5 py-1 rounded-lg">Last 6 Months</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-36">
            {monthlyData.map((val, i) => (
              <div key={months[i]} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-600 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-default"
                  style={{ height: `${(val / maxBar) * 100}%` }}
                  title={`${months[i]}: ${val}`}
                />
                <span className="text-xs text-slate-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 tracking-tight mb-1">Skill Distribution</h2>
          <p className="text-xs text-slate-400 mb-5">Skills required vs. candidates</p>
          <div className="space-y-4">
            {skillDistribution.map(({ skill, pct, color }) => (
              <div key={skill}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{skill}</span>
                  <span className="text-slate-400">{pct}%</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2.5">
                  <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Top Skill Demand</p>
              <p className="font-bold text-slate-900 tracking-tight text-sm">Python</p>
              <span className="text-xs text-green-600 font-semibold">+15% High demand</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Skills</p>
              <p className="font-bold text-slate-900 tracking-tight text-xl">4,302</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Candidates */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-bold text-slate-900 tracking-tight">Top Ranked Candidates</h2>
            <p className="text-xs text-slate-400 mt-0.5">Based on AI match score and assessment</p>
          </div>
          <Link href="/recruiter/candidates" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role Applied</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Match Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topCandidates.map(({ name, email, role, match, stage }) => (
              <tr key={email} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                      {name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{name}</p>
                      <p className="text-xs text-slate-400">{email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-slate-600">{role}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: `${match}%` }} />
                    </div>
                    <span className="text-xs font-bold text-green-600">{match}%</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stageColors[stage]}`}>{stage}</span>
                </td>
                <td className="px-4 py-4">
                  <Link href="/recruiter/candidates" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Profile</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
