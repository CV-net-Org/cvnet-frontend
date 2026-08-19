"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { href: "/recruiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/recruiter/jobs", label: "Jobs", icon: Briefcase },
  { href: "/recruiter/candidates", label: "Candidates", icon: Users },
  { href: "/recruiter/interviews", label: "Interviews", icon: Calendar },
];

export default function RecruiterSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const [userName, setUserName] = useState("CVNet Enterprise");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.displayName) setUserName(user.displayName);
        if (user.photoURL) setUserPhoto(user.photoURL);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = "cvnet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out cleanly:", error);
    }
  };

  // Dark mode class shorthands
  const sidebarBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const headerBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";

  return (
    <>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-40 shadow-sm border-b ${headerBg}`}>
        <div className="flex items-center gap-3">
          <Image src="/logo.jpeg" alt="CVNet Logo" width={32} height={32} className="rounded-lg object-cover" />
          <span className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CVNet</span>
        </div>
        <button type="button" onClick={toggleSidebar} aria-label="Toggle menu"
          className={`p-2 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-50 border-r transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarBg} ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo (Desktop) */}
        <div className={`hidden lg:flex items-center gap-3 px-6 py-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <Image src="/logo.jpeg" alt="CVNet Logo" width={40} height={40} className="rounded-xl object-cover shadow-sm" />
          <div>
            <p className={`font-black text-lg leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CVNet</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Recruiter</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? isDark
                          ? "bg-blue-600/20 text-blue-400"
                          : "bg-blue-50 text-blue-700"
                        : isDark
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className={`mt-auto border-t p-4 space-y-1 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'}`}>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all ${
              isDark
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-3">
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              {isDark ? "Light mode" : "Dark mode"}
            </span>
            <div className={`w-9 h-5 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isDark ? 'left-4' : 'left-0.5'}`} />
            </div>
          </button>

          <Link
            href="/recruiter/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
              pathname === "/recruiter/settings"
                ? isDark ? "bg-slate-800 text-blue-400" : "bg-slate-100 text-blue-600"
                : isDark ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Settings size={18} />
            Settings
          </Link>

          <button type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all mb-2 ${
              isDark ? "text-slate-400 hover:bg-rose-900/40 hover:text-rose-400" : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
            }`}
          >
            <LogOut size={18} />
            Logout
          </button>

          {/* User Profile */}
          <div className={`flex items-center gap-3 px-2 py-3 rounded-2xl border mt-2 shadow-sm ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="w-10 h-10 rounded-xl object-cover shadow-inner border border-slate-100" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
                {getInitials(userName)}
              </div>
            )}
            <div className="min-w-0">
              <p className={`text-xs font-black truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
              <p className={`text-[10px] font-bold uppercase truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Company</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}