'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6 border border-zinc-700 bg-zinc-900 flex items-center justify-center font-mono font-semibold text-zinc-200 text-xs">
            /
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">scope-ai</span>
            <span className="text-xs font-mono text-zinc-500 pl-1.5 border-l border-zinc-800">
              v1.0
            </span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900/60 border border-zinc-800 text-xs">
              <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-200 font-normal hidden sm:inline">{user.name}</span>
              <span
                className={`text-[11px] font-mono px-1 border ${
                  user.role === 'ADMIN'
                    ? 'text-rose-400 border-rose-900/60 bg-rose-950/30'
                    : 'text-zinc-400 border-zinc-800 bg-zinc-950'
                }`}
              >
                {user.role.toLowerCase()}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors"
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
