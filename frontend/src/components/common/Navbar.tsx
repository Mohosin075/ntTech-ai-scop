'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Sparkles, Shield, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-800 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-gray-50">ScopeAI</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Engine
              </span>
            </div>
            <p className="text-[11px] text-gray-400 -mt-0.5 hidden sm:block">Intelligent Scoping &amp; Milestones</p>
          </div>
        </Link>

        {/* Right: User Profile & Actions */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-gray-900 border border-gray-800">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                {user.role === 'ADMIN' ? (
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-gray-50 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">{user.email}</p>
              </div>

              {/* Role Badge */}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  user.role === 'ADMIN'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-50 hover:bg-gray-800/80 border border-transparent hover:border-gray-700 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
