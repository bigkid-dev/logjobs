'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Globe, Sparkles, Plus, Sun, Moon, LogOut } from 'lucide-react';

export default function HeaderNav({
  activeTab,
  onTabChange,
  user,
  onOpenAuth,
  onOpenPostJob,
  onLogout,
  theme,
  onToggleTheme
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--line)] shadow-sm'
          : 'bg-[var(--bg-surface)]/80 backdrop-blur-sm border-b border-[var(--line)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <a
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <img
              src="/logo.png"
              alt="LogJobs"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-[var(--ink)] font-bold tracking-tight text-lg">
              LogJobs
            </span>
          </a>

          {/* Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[var(--bg-subtle)] p-1 rounded-full border border-[var(--line)]">
            <button
              onClick={() => onTabChange('nigerian')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'nigerian'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <span>Nigeria Roles</span>
            </button>
            <button
              onClick={() => onTabChange('global')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'global'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <span>🌍</span>
              <span>Global Remote</span>
            </button>
            <button
              onClick={() => onTabChange('my-jobs')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'my-jobs'
                  ? 'bg-[var(--ink)] text-white shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <span>💼</span>
              <span>Workspace</span>
              {user && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700">
                  {user.role === 'hirer' ? 'Hirer' : 'Candidate'}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full border border-[var(--line)] bg-[var(--bg-surface)] text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--ink-4)] flex items-center justify-center transition-colors shadow-sm"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Auth / Post Job CTA */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'hirer' && (
                <button
                  onClick={onOpenPostJob}
                  className="btn-primary text-xs py-1.5 px-4 min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post a Role</span>
                </button>
              )}

              <div className="flex items-center gap-3 pl-3 border-l border-[var(--line)]">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-[var(--ink)]">{user.name}</div>
                  <div className="text-[10px] text-[var(--ink-3)] capitalize">{user.role}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg border border-[var(--line)] text-xs text-[var(--ink-3)] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="btn-secondary text-xs py-1.5 px-4 min-h-[36px]"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup_hirer')}
                className="btn-primary text-xs py-1.5 px-4 min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post a Job</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Subnav */}
      <div className="md:hidden flex items-center justify-around border-t border-[var(--line)] bg-[var(--bg-surface)] py-2.5 px-4 text-xs">
        <button
          onClick={() => onTabChange('nigerian')}
          className={`px-3 py-1.5 rounded-full font-medium ${
            activeTab === 'nigerian' ? 'bg-[var(--primary)] text-white font-semibold' : 'text-[var(--ink-3)]'
          }`}
        >
          Nigeria
        </button>
        <button
          onClick={() => onTabChange('global')}
          className={`px-3 py-1.5 rounded-full font-medium ${
            activeTab === 'global' ? 'bg-[var(--primary)] text-white font-semibold' : 'text-[var(--ink-3)]'
          }`}
        >
          🌍 Global Remote
        </button>
        <button
          onClick={() => onTabChange('my-jobs')}
          className={`px-3 py-1.5 rounded-full font-medium ${
            activeTab === 'my-jobs' ? 'bg-[var(--ink)] text-white font-semibold' : 'text-[var(--ink-3)]'
          }`}
        >
          💼 Workspace
        </button>
      </div>
    </header>
  );
}
