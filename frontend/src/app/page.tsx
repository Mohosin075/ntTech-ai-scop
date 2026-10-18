'use client';

import { useState } from 'react';
import {
  Server,
  Database,
  Globe,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FolderTree,
  Terminal,
  ExternalLink,
  Layers,
  Code2,
} from 'lucide-react';

interface HealthStatus {
  status: 'idle' | 'loading' | 'connected' | 'error';
  message: string;
  timestamp?: string;
  environment?: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'idle',
    message: 'Backend not tested yet. Click "Test Connection" to ping.',
  });

  const checkBackendHealth = async () => {
    setHealth({ status: 'loading', message: 'Checking backend connection...' });
    try {
      const res = await fetch('http://localhost:5000/health', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth({
        status: 'connected',
        message: 'Backend server is healthy and responding!',
        timestamp: data.timestamp,
        environment: data.environment,
      });
    } catch (err: unknown) {
      setHealth({
        status: 'error',
        message:
          err instanceof Error
            ? `Connection failed: ${err.message}. Make sure backend is running on port 5000.`
            : 'Failed to connect to backend.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-wide text-white">Fullstack Assessment Workspace</h1>
              <p className="text-xs text-slate-400">Next.js + Tailwind + Express + Prisma + PostgreSQL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Industry Standard Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
            <Code2 className="w-3.5 h-3.5" /> Fullstack Architecture Initialized
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Job Assessment <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">Starter Template</span>
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Cleanly decoupled Frontend and Backend setup adhering to industry-standard patterns, typed contracts, modular layered architecture, and scalable database schemas.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Frontend Workspace</h3>
                <p className="text-xs text-slate-400">Directory: /frontend</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Framework</span>
                <span className="font-mono text-slate-200">Next.js 15+ (App Router)</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Styling</span>
                <span className="font-mono text-slate-200">Tailwind CSS + Lucide Icons</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Language</span>
                <span className="font-mono text-slate-200">TypeScript (Strict)</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Path Aliases</span>
                <span className="font-mono text-slate-200">@/* (src/*)</span>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono text-xs text-slate-300">
              <p className="text-slate-500 mb-1">// Start Frontend Dev Server</p>
              <p className="text-sky-400">cd frontend &amp;&amp; npm run dev</p>
            </div>
          </div>

          {/* Backend Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Backend Workspace</h3>
                <p className="text-xs text-slate-400">Directory: /backend</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Runtime / Server</span>
                <span className="font-mono text-slate-200">Node.js + Express + TS</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">ORM / Database</span>
                <span className="font-mono text-slate-200">Prisma + PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Architecture</span>
                <span className="font-mono text-slate-200">Modular (Route-Controller-Service)</span>
              </div>
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Validation</span>
                <span className="font-mono text-slate-200">Zod Schemas</span>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 font-mono text-xs text-slate-300">
              <p className="text-slate-500 mb-1">// Start Backend Dev Server</p>
              <p className="text-indigo-400">cd backend &amp;&amp; npm run dev</p>
            </div>
          </div>
        </div>

        {/* Live Backend Connection Tester */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" /> Live Backend Connection Checker
              </h3>
              <p className="text-sm text-slate-400">Test if your backend server on port 5000 is active and responding.</p>
            </div>
            <button
              id="test-connection-btn"
              onClick={checkBackendHealth}
              disabled={health.status === 'loading'}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${health.status === 'loading' ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            {health.status === 'connected' && <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />}
            {health.status === 'error' && <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />}
            {health.status === 'idle' && <Layers className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />}
            {health.status === 'loading' && <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mt-0.5 shrink-0" />}

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">{health.message}</p>
              {health.timestamp && (
                <p className="text-xs text-slate-400 font-mono">
                  Timestamp: {health.timestamp} | Mode: {health.environment}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Industry Standard Structure Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Architecture Tree */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-sky-400" /> Project Structure Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <p className="font-bold text-sky-400">frontend/</p>
                <p className="text-slate-400 pl-2">├── src/</p>
                <p className="text-slate-300 pl-4">├── app/ <span className="text-slate-500">(Next.js App Router)</span></p>
                <p className="text-slate-300 pl-4">├── components/ <span className="text-slate-500">(UI &amp; Common)</span></p>
                <p className="text-slate-300 pl-4">├── lib/ <span className="text-slate-500">(api.ts &amp; utils.ts)</span></p>
                <p className="text-slate-300 pl-4">└── types/ <span className="text-slate-500">(Shared TS models)</span></p>
                <p className="text-slate-400 pl-2">├── tailwind.config</p>
                <p className="text-slate-400 pl-2">└── .env.local</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                <p className="font-bold text-indigo-400">backend/ (Modular Pattern)</p>
                <p className="text-slate-400 pl-2">├── prisma/ <span className="text-slate-500">(schema.prisma)</span></p>
                <p className="text-slate-400 pl-2">├── src/</p>
                <p className="text-slate-300 pl-4">├── config/ <span className="text-slate-500">(index.ts &amp; prisma.ts)</span></p>
                <p className="text-slate-300 pl-4">└── app/</p>
                <p className="text-slate-300 pl-6">├── modules/ <span className="text-slate-500">(Feature-based)</span></p>
                <p className="text-slate-300 pl-8">├── user/ <span className="text-slate-500">(controller, service, routes, etc.)</span></p>
                <p className="text-slate-300 pl-8">└── task/ <span className="text-slate-500">(controller, service, routes, etc.)</span></p>
                <p className="text-slate-300 pl-6">├── middlewares/ <span className="text-slate-500">(globalError, notFound)</span></p>
                <p className="text-slate-300 pl-6">├── utils/ <span className="text-slate-500">(catchAsync, sendResponse)</span></p>
                <p className="text-slate-300 pl-6">└── routes/ <span className="text-slate-500">(Central router index.ts)</span></p>
              </div>
            </div>
          </div>

          {/* Quick Commands & Reference */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-teal-400" /> Key Commands
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 mb-1 font-medium">Prisma DB Migration:</p>
                  <code className="block bg-slate-950 p-2 rounded-lg border border-slate-800 text-teal-300 font-mono">
                    npm run prisma:migrate
                  </code>
                </div>
                <div>
                  <p className="text-slate-400 mb-1 font-medium">Prisma Visual Studio:</p>
                  <code className="block bg-slate-950 p-2 rounded-lg border border-slate-800 text-teal-300 font-mono">
                    npm run prisma:studio
                  </code>
                </div>
                <div>
                  <p className="text-slate-400 mb-1 font-medium">Build Backend for Production:</p>
                  <code className="block bg-slate-950 p-2 rounded-lg border border-slate-800 text-teal-300 font-mono">
                    npm run build
                  </code>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              Ready for adding auth, business requirements, or assessment specs.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Job Assessment Starter • Next.js &amp; Express &amp; Prisma PostgreSQL Architecture
      </footer>
    </div>
  );
}
