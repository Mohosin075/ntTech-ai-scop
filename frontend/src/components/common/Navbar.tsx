'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Layers3, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-[#d5deda] bg-white/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[4.5rem] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#173f52] flex items-center justify-center text-[#8ed0c5] shadow-sm shadow-[#173f52]/20">
            <Layers3 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-5 tracking-tight text-[#182b39]">ScopeAI</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65717a]">
              Project studio
            </span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#d5deda] text-xs">
              <UserIcon className="w-3.5 h-3.5 text-[#526270]" />
              <span className="text-[#263d4a] font-medium hidden md:inline">{user.name}</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded border ${
                  user.role === 'ADMIN'
                    ? 'text-rose-900 border-rose-300 bg-rose-100'
                    : 'text-emerald-900 border-emerald-300 bg-emerald-100'
                }`}
              >
                {user.role === 'ADMIN' ? 'Administrator' : 'Estimator'}
              </span>
            </div>

            <button
              onClick={logout}
              aria-label="Sign out"
              title="Logout"
              className="p-2 rounded-lg text-[#526270] hover:text-[#182b39] hover:bg-[#e3ebe8] border border-[#d5deda] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#173f52] hover:bg-[#102f3e] text-white transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
