"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
  { href: "/recruiter/candidates", label: "Candidates", icon: Users },
  { href: "/recruiter/interviews", label: "Interviews", icon: Calendar },
];

export default function RecruiterSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="CVNet Logo"
            width={32}
            height={32}
            className="rounded-lg object-cover border border-slate-200"
          />
          <span className="text-slate-900 font-bold text-sm tracking-tight">CVNet</span>
        </div>
        <button 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-slate-200">
          <Image
            src="/logo.jpeg"
            alt="CVNet Logo"
            width={40}
            height={40}
            className="rounded-xl object-cover shadow-sm border border-slate-200"
          />
          <div>
            <p className="text-slate-900 font-bold text-lg leading-tight tracking-tight">CVNet</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Recruiter</p>
          </div>
        </div>

        {/* Home link */}
        <div className="px-4 py-4 border-b border-slate-200 lg:mt-0 mt-16">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
          >
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
              <Home size={16} strokeWidth={2.5} />
            </div>
            Home Portal
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </div>
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
                    <span className="flex-1">{label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto border-t border-slate-200 p-4 space-y-4">
          <Link
            href="/recruiter/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/recruiter/settings"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Settings size={18} className={pathname === "/recruiter/settings" ? "text-blue-600" : "text-slate-400"} />
            Settings
          </Link>

          <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              AM
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 text-sm font-semibold truncate leading-tight">Alex Morgan</p>
              <p className="text-slate-500 text-xs truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
