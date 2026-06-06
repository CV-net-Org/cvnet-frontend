import { Download, TrendingDown, TrendingUp, Zap } from 'lucide-react';

const kpis = [
  { label: 'Avg. Time to Hire', value: '18 Days', change: '-2.5 days vs last month', up: true },
  { label: 'Cost per Hire', value: '$1,250', change: '-12% vs industry avg', up: true },
  { label: 'Offer Acceptance Rate', value: '89%', change: 'Stable', up: true },
  { label: 'Pipeline Velocity', value: '4.2', sub: 'candidates/day', change: '+8% vs last month', up: true },
];

const heatmapData = [
  { category: 'Frontend Dev', high: 'Critical Shortage', med: 'Balanced', low: 'Surplus' },
  { category: 'Data Science', high: 'Shortage', med: 'Tight Market', low: 'Surplus' },
  { category: 'Product Mgmt', high: 'Balanced', med: 'High Supply', low: 'Surplus' },
  { category: 'UX Design', high: 'Balanced', med: 'Good Supply', low: '—' },
];

const heatmapCellColors: Record<string, string> = {
  'Critical Shortage': 'bg-red-100 text-red-700',
  'Shortage': 'bg-red-50 text-red-600',
  'Tight Market': 'bg-amber-100 text-amber-700',
  'Balanced': 'bg-green-100 text-green-700',
  'High Supply': 'bg-blue-100 text-blue-700',
  'Good Supply': 'bg-blue-50 text-blue-600',
  'Surplus': 'bg-slate-100 text-slate-500',
  '—': 'text-slate-300',
};

const weeklyPipeline = [
  { week: 'Week 1', screening: 40, interview: 22, offer: 12, hired: 6 },
  { week: 'Week 2', screening: 52, interview: 30, offer: 18, hired: 9 },
  { week: 'Week 3', screening: 35, interview: 20, offer: 14, hired: 7 },
  { week: 'Week 4', screening: 60, interview: 38, offer: 22, hired: 11 },
];

const aiRecommendations = [
  {
    title: 'Sourcing Alert: Data Science',
    description: 'Data Science applications are down 15%. Recommend boosting job posts on niche platforms like Kaggle.',
    action: 'Generate Full Strategy Report',
    color: 'border-l-red-500 bg-red-50',
  },
  {
    title: 'Improve Frontend Pipeline',
    description: 'Frontend candidates drop off at the technical screening stage (65% drop rate). Consider reviewing assessment difficulty.',
    action: 'View Recommendations',
    color: 'border-l-amber-500 bg-amber-50',
  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Advanced Analytics</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Oct 1, 2023 – Oct 31, 2023</p>
        </div>
        <button className="flex items-center justify-center gap-2 border border-slate-200 text-slate-600 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors w-full sm:w-auto">
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, sub, change, up }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-slate-400">{sub}</p>}
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Hiring Pipeline Velocity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 tracking-tight mb-1">Hiring Pipeline Velocity</h2>
          <p className="text-xs text-slate-400 mb-5">Candidate movement across stages by week</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-400 font-semibold"></th>
                  {weeklyPipeline.map(({ week }) => (
                    <th key={week} className="text-center py-2 text-slate-400 font-semibold">{week}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Screening', key: 'screening', color: 'bg-blue-600' },
                  { label: 'Interview', key: 'interview', color: 'bg-indigo-500' },
                  { label: 'Offer', key: 'offer', color: 'bg-violet-500' },
                  { label: 'Hired', key: 'hired', color: 'bg-green-500' },
                ].map(({ label, key, color }) => (
                  <tr key={label} className="border-b border-slate-50">
                    <td className="py-3 pr-4 text-slate-600 font-medium">{label}</td>
                    {weeklyPipeline.map(row => (
                      <td key={row.week} className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min((row[key as keyof typeof row] as number) * 1.2, 60)}px` }} />
                          <span className="text-slate-700 font-semibold">{row[key as keyof typeof row]}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Quality Trends */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 tracking-tight mb-1">Candidate Quality Trends</h2>
          <p className="text-xs text-slate-400 mb-5">Average assessment scores over time</p>
          <div className="space-y-5">
            {[
              { dept: 'Engineering', techScore: [82, 88, 79, 91], cultureScore: [70, 74, 68, 80] },
            ].map(({ dept, techScore, cultureScore }) => (
              <div key={dept}>
                <p className="text-sm font-semibold text-slate-700 mb-3">{dept}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Technical Score</span>
                      <span className="font-semibold text-slate-800">{techScore[techScore.length - 1]}</span>
                    </div>
                    <div className="flex items-end gap-1 h-10">
                      {techScore.map((v, i) => (
                        <div key={i} className="flex-1 bg-blue-600 rounded-t opacity-80" style={{ height: `${v}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      {['Week 1','Week 2','Week 3','Week 4'].map(w => <span key={w}>{w}</span>)}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Culture Fit</span>
                      <span className="font-semibold text-slate-800">{cultureScore[cultureScore.length - 1]}</span>
                    </div>
                    <div className="flex items-end gap-1 h-10">
                      {cultureScore.map((v, i) => (
                        <div key={i} className="flex-1 bg-violet-500 rounded-t opacity-80" style={{ height: `${v}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Demand Heatmap */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="font-bold text-slate-900 tracking-tight">Skill Demand vs. Supply</h2>
            <p className="text-xs text-slate-400 mt-0.5">Market availability heatmap by skill category</p>
          </div>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Full Report →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Category</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">High Demand</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Med Demand</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {heatmapData.map(({ category, high, med, low }) => (
                <tr key={category} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-semibold text-slate-900 text-sm">{category}</td>
                  {[high, med, low].map((cell, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${heatmapCellColors[cell] || ''}`}>{cell}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-yellow-500" />
          <h2 className="font-bold text-slate-900 tracking-tight">AI Recommendations</h2>
          <span className="text-xs text-slate-400">Actionable insights based on data</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {aiRecommendations.map(({ title, description, action, color }) => (
            <div key={title} className={`border-l-4 rounded-r-xl p-5 ${color}`}>
              <p className="font-bold text-slate-900 tracking-tight text-sm mb-1">{title}</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{description}</p>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">{action} →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
