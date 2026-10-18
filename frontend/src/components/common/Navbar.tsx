'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-[#27272A] bg-[#0A0A0B]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
            S
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">ScopeAI</span>
            <span className="text-xs font-mono text-zinc-500 pl-2 border-l border-[#27272A]">
              v1.0
            </span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#121214] border border-[#27272A] text-xs">
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-200 font-medium hidden sm:inline">{user.name}</span>
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                  user.role === 'ADMIN'
                    ? 'text-rose-400 border-rose-800/60 bg-rose-950/40'
                    : 'text-emerald-400 border-emerald-800/60 bg-emerald-950/40'
                }`}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B] border border-[#27272A] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
