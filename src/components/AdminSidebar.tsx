"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Users, Menu, X, LogOut } from "lucide-react";
import { auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";

const navItems = [{ href: "/admin/users", label: "Users", icon: Users }];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((current) => !current);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = "cvnet_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out cleanly:", error);
    }
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpeg" alt="CVNet Logo" width={32} height={32} className="rounded-lg object-cover" />
          <span className="text-slate-900 font-bold text-sm tracking-tight">CVNet Admin</span>
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-50 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-slate-200">
          <Image src="/logo.jpeg" alt="CVNet Logo" width={40} height={40} className="rounded-xl object-cover shadow-sm" />
          <div>
            <p className="text-slate-900 font-black text-lg leading-tight tracking-tight">CVNet</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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

        <div className="mt-auto border-t border-slate-200 p-4 space-y-2 bg-slate-50/50">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all mb-2"
          >
            <LogOut size={18} />
            Logout
          </button>

          <div className="flex items-center gap-3 px-2 py-3 bg-white rounded-2xl border border-slate-200 mt-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-inner">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 text-xs font-black truncate leading-tight">Administrator</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase truncate">Admin Account</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}