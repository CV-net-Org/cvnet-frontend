import Link from "next/link";
import Image from "next/image";
import MarketingNav from "@/components/MarketingNav";
import {
  Lightbulb,
  ShieldCheck,
  Zap,
  Globe2,
  Users2,
  ArrowRight
} from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We constantly push the boundaries of AI to solve complex recruitment challenges."
  },
  {
    icon: ShieldCheck,
    title: "Unbiased Matching",
    description: "Our algorithms are designed to evaluate potential based strictly on data, eliminating human bias."
  },
  {
    icon: Zap,
    title: "Velocity",
    description: "We believe in acting fast. Our tools dramatically reduce the time it takes to hire great talent."
  },
  {
    icon: Globe2,
    title: "Global Reach",
    description: "We empower remote and global teams to find the best candidates regardless of geography."
  }
];

export default function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MarketingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Redefining how the world <br className="hidden sm:block" />
            <span className="text-blue-400">connects with talent</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            CVNet was founded on a simple premise: hiring should be based on actual skills and potential, not just what looks good on a resume.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              For decades, the recruitment process has been broken. Recruiters spend countless hours sifting through misaligned resumes, while talented candidates are often overlooked due to unconscious bias or poorly optimized keywords.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              We built CVNet to change that. By leveraging advanced AI and deep learning, we instantly analyze the gap between a candidate's actual competencies and a role's specific requirements. The result is a radically transparent, wildly efficient hiring ecosystem that benefits everyone.
            </p>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-3xl transform rotate-3 scale-105"></div>
            <div className="relative bg-slate-900 rounded-3xl p-10 text-white shadow-xl">
              <Users2 size={48} className="text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Over 2,000+ teams trust CVNet.</h3>
              <p className="text-slate-300">
                From hyper-growth startups to Fortune 500 enterprises, our technology is powering the next generation of workforce strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              These principles guide everything we build and how we operate as a team.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, description }, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            Ready to join the revolution?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?role=recruiter"
              className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Hire Talent <ArrowRight size={18} />
            </Link>
            <Link
              href="/signup?role=candidate"
              className="border-2 border-blue-400 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Find a Job <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

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
              <li>
                <Link
                  href="/features"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
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
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
