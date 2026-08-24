'use client';

import { ArrowRight, Globe, Plus, Building2, TrendingUp, Briefcase, ShieldCheck, Layers } from 'lucide-react';

export default function HeroSection({ onExploreStream, onOpenPostJob, totalJobs = 0 }) {
  const stats = [
    {
      value: `${totalJobs > 0 ? totalJobs : 540}+`,
      label: 'Active Opportunities',
      desc: 'Verified job openings',
      icon: TrendingUp,
    },
    {
      value: '48+',
      label: 'Hiring Companies',
      desc: 'Local & global employers',
      icon: Building2,
    },
    {
      value: 'All Fields',
      label: 'Diverse Industries',
      desc: 'Marketing, Finance, Tech & more',
      icon: Layers,
    },
    {
      value: '100%',
      label: 'Direct Applications',
      desc: 'No recruiter middlemen',
      icon: ShieldCheck,
    }
  ];

  return (
    <section className="relative pt-16 pb-16 overflow-hidden">
      {/* Soft Ambient Light Glow in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-200/25 via-emerald-100/10 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--ink)] leading-[1.1]">
              Find your next career in{' '}
              <span className="bg-gradient-to-r from-[var(--primary)] via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Nigeria & worldwide.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--ink-2)] leading-relaxed max-w-xl">
              Discover verified positions across Marketing, Finance, Design, Sales, Healthcare, Operations, Tech, and more. Apply directly to hiring teams with zero middleman spam.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onExploreStream('nigerian')}
                className="btn-primary text-sm py-3 px-6 shadow-md shadow-emerald-900/15"
              >
                <span>Explore Nigeria Jobs</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onExploreStream('global')}
                className="btn-secondary text-sm py-3 px-6"
              >
                <Globe className="w-4 h-4 text-[var(--primary)] mr-1" />
                <span>Global Remote Jobs</span>
              </button>

              <button
                onClick={onOpenPostJob}
                className="btn-ghost text-sm py-2.5 px-5 text-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Post a Job Opening</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              <img
                src="/job-hunt.svg"
                alt="Job hunting illustration"
                className="w-full h-full object-contain drop-shadow-sm select-none"
              />
            </div>
            <a
              href="https://storyset.com/job"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[var(--ink-4)] hover:text-[var(--primary)] transition-colors mt-2"
            >
              Job illustrations by Storyset
            </a>
          </div>
        </div>

        {/* Minimalist Stats Grid */}
        <div className="pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
                      {stat.value}
                    </div>
                    <Icon className="w-5 h-5 text-[var(--primary)] group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-[var(--ink)]">
                      {stat.label}
                    </div>
                    <div className="text-[11px] text-[var(--ink-3)] mt-0.5">
                      {stat.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
