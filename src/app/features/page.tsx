import Link from "next/link";
import Image from "next/image";
import MarketingNav from "@/components/MarketingNav";
import {
  Brain,
  Target,
  LayoutDashboard,
  Calendar,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowRight,
  LineChart
} from "lucide-react";

const recruiterFeatures = [
  {
    icon: Target,
    title: "AI Readiness Score",
    description: "Automatically score and rank candidates against your specific job requirements to highlight the absolute best fits instantly.",
  },
  {
    icon: Brain,
    title: "Skill Gap Analysis",
    description: "Identify exactly which competencies a candidate is missing. Make data-backed hiring decisions without the guesswork.",
  },
  {
    icon: Briefcase,
    title: "Streamlined Job Management",
    description: "Easily post new jobs by uploading requirements or pasting links, and let our AI analyze and extract the core needs.",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Pipeline",
    description: "Track candidates from application to offer in one unified, drag-and-drop dashboard view.",
  },
  {
    icon: Calendar,
    title: "Interview Management",
    description: "Schedule, manage, and track candidate interviews seamlessly, with automated reminders for your hiring team.",
  }
];

const candidateFeatures = [
  {
    icon: LineChart,
    title: "Personalized Skill Gap Analysis",
    description: "Understand exactly what skills you need to develop to land your target roles and get actionable recommendations.",
  },
  {
    icon: FileText,
    title: "Smart CV Management",
    description: "Maintain and optimize your CV with AI-driven feedback to dramatically improve your match rates.",
  },
  {
    icon: LayoutDashboard,
    title: "Application Tracking",
    description: "Never lose track of an opportunity. Monitor the status of all your job applications in one organized place.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth Dashboard",
    description: "Get actionable insights and metrics on how to improve your professional profile over time.",
  }
];

export default function FeaturesPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MarketingNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-blue-50/50 to-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Platform Capabilities
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Everything you need to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">hire or get hired</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover how CVNet&apos;s AI-driven tools empower both recruiters to find top talent and candidates to land their dream roles.
          </p>
        </div>
      </section>

      {/* Features Toggle/Sections */}
      <div className="flex-1 bg-white pb-24">
        {/* Recruiter Section */}
        <section className="py-20 px-4 sm:px-6 border-b border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  For Recruiters & Hiring Managers
                </h2>
                <p className="text-lg text-slate-500">
                  Cut your time-to-hire in half. Use AI to surface the best candidates, automate screening, and build world-class teams faster.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Start Hiring
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recruiterFeatures.map(({ icon: Icon, title, description }, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-white border border-slate-200 rounded-2xl p-8 hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <Icon size={26} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Candidate Section */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  For Job Seekers & Candidates
                </h2>
                <p className="text-lg text-slate-500">
                  Stop guessing why you didn&apos;t get the interview. See how you stack up, identify your skill gaps, and land your next big opportunity.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                Build Your Profile
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {candidateFeatures.map(({ icon: Icon, title, description }, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-6 bg-white border border-slate-200 rounded-2xl p-8 hover:border-indigo-600/30 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300"
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Icon size={26} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-14 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.jpeg"
                alt="CVNet"
                width={28}
                height={28}
                className="rounded-md object-cover"
              />
              <span className="font-bold text-white text-lg">CVNet</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering the world&apos;s best HR teams with data-driven
              recruitment intelligence and skill analysis.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              {["Features"].map((i) => (
                <li key={i}>
                  <Link
                    href="/features"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {i}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {currentYear} CVNet Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
