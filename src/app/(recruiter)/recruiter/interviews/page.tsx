import { ReactElement } from 'react';
import { Plus, Video, MapPin, Phone, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const todaySchedule = [
  {
    time: '10:00 AM',
    duration: '60 min',
    type: 'Video',
    candidate: 'Michael Chen',
    role: 'Full Stack Engineer – Round 2',
    platform: 'Zoom Meeting',
    typeIcon: 'video',
  },
  {
    time: '01:00 PM',
    duration: '45 min',
    type: 'Office',
    candidate: 'Sarah Jenkins',
    role: 'Product Designer – Debrief',
    platform: 'Office 4B',
    typeIcon: 'office',
  },
  {
    time: '01:00 PM',
    duration: '30 min',
    type: 'Done',
    candidate: 'David Ross',
    role: 'Data Scientist – Screening',
    platform: 'Phone Call',
    typeIcon: 'phone',
    done: true,
  },
];

const upcomingRequests = [
  { role: 'UX Lead Interview', pending: '3 candidates pending' },
];

const calendarDays = [
  { day: 'Mon', date: 16, events: ['Tec', 'Deb'] },
  { day: 'Tue', date: 17, events: ['Onsi'] },
  { day: 'Wed', date: 18, events: [] },
  { day: 'Thu', date: 19, events: [] },
  { day: 'Fri', date: 20, events: ['Zoom'] },
  { day: 'Sat', date: 21, events: [] },
  { day: 'Sun', date: 22, events: [] },
];

const typeIconMap: Record<string, ReactElement> = {
  video: <Video size={14} className="text-blue-600" />,
  office: <MapPin size={14} className="text-emerald-500" />,
  phone: <Phone size={14} className="text-amber-500" />,
};

export default function InterviewsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Interview Schedule</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interviews</h1>
          <p className="text-sm text-slate-500 mt-0.5">October 2023 · GMT+1</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 w-full sm:w-auto">
          <Plus size={15} /> Schedule New
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Mini Calendar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><ChevronLeft size={16} className="text-slate-600" /></button>
              <h2 className="font-bold text-slate-900 tracking-tight">October 2023</h2>
              <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><ChevronRight size={16} className="text-slate-600" /></button>
            </div>
            <div className="flex gap-2">
              {/* View toggles */}
              <div className="flex gap-1 mb-5 ml-auto">
                {['Day', 'Week', 'Month'].map(v => (
                  <button key={v} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${v === 'Week' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{v}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map(({ day, date, events }) => (
                <div key={date} className={`rounded-xl p-2 min-h-20 border transition-colors cursor-pointer hover:bg-blue-50 hover:border-blue-200 ${date === 17 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-xs text-slate-400 font-semibold mb-1">{day}</div>
                  <div className={`text-sm font-bold mb-2 ${date === 17 ? 'text-blue-600' : 'text-slate-900'}`}>{date}</div>
                  <div className="space-y-1">
                    {events.map(e => (
                      <div key={e} className="text-xs bg-blue-100 text-blue-700 rounded px-1 py-0.5 truncate font-medium">{e}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="font-bold text-slate-900 tracking-tight">Today&apos;s Schedule</h2>
                <p className="text-xs text-slate-400 mt-0.5">{todaySchedule.length} Meetings</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {todaySchedule.map(({ time, duration, candidate, role, platform, typeIcon, done }) => (
                <div key={time + candidate} className={`flex items-start gap-4 px-6 py-5 ${done ? 'opacity-60' : ''}`}>
                  {/* Time Column */}
                  <div className="flex-shrink-0 w-16 text-right">
                    <p className="text-xs font-bold text-slate-900 tracking-tight">{time}</p>
                  </div>

                  {/* Timeline dot */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full border-2 mt-0.5 ${done ? 'bg-green-500 border-green-500' : 'bg-blue-600 border-blue-600'}`} />
                    <div className="flex-1 w-0.5 bg-slate-100 mt-1 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {typeIconMap[typeIcon]}
                          <span className="text-xs text-slate-400 font-medium">{platform}</span>
                          <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} /> {duration}</span>
                        </div>
                        <p className="font-bold text-slate-900 tracking-tight text-sm">{candidate}</p>
                        <p className="text-xs text-slate-400">{role}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {done ? (
                          <button className="text-xs font-semibold text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">Add Feedback</button>
                        ) : (
                          <button className="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">View Details</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Requests */}
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 tracking-tight">Upcoming Requests</h3>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-3">
              {upcomingRequests.map(({ role, pending }) => (
                <div key={role} className="bg-blue-50 border border-blue-100 rounded-xl p-4 transition-all hover:-translate-y-1 hover:shadow-md">
                  <p className="text-sm font-bold text-slate-900 tracking-tight">{role}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{pending}</p>
                  <button className="mt-3 w-full text-xs font-semibold text-blue-600 border border-blue-200 py-1.5 rounded-lg hover:bg-blue-100 transition-colors active:scale-[0.98]">Schedule Now</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 tracking-tight text-sm mb-3">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Scheduled This Week', value: '8' },
                { label: 'Completed Today', value: '1' },
                { label: 'Pending Feedback', value: '3' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-sm font-bold text-slate-900 tracking-tight">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
