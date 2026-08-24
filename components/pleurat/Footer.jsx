'use client';

import { Briefcase, ShieldCheck } from 'lucide-react';

export default function Footer({ onOpenAuth }) {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg-surface)] mt-24 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b border-[var(--line)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="LogJobs"
                className="w-7 h-7 object-contain"
              />
              <span className="text-[var(--ink)] font-bold text-base tracking-tight">
                LogJobs
              </span>
            </div>
            <p className="text-[var(--ink-2)] text-xs max-w-md leading-relaxed">
              Curated job opportunities and direct hiring pipelines for professionals across all industries in Nigeria and global remote teams.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('signup_hirer')}
              className="btn-primary text-xs py-2 px-5 min-h-[38px]"
            >
              Post a Job Opening
            </button>
            <button
              onClick={() => onOpenAuth('signup_applicant')}
              className="btn-secondary text-xs py-2 px-5 min-h-[38px]"
            >
              Join as Job Seeker
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <span className="text-[var(--ink)] font-bold block text-sm">Job Categories</span>
            <div className="space-y-2 text-[var(--ink-3)]">
              <div><a href="/" className="hover:text-[var(--primary)]">Marketing & Sales</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Finance & Accounting</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Design & Creative</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Tech & Software</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Customer Support</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Operations & HR</a></div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[var(--ink)] font-bold block text-sm">For Employers</span>
            <div className="space-y-2 text-[var(--ink-3)]">
              <div><button onClick={() => onOpenAuth('signup_hirer')} className="hover:text-[var(--primary)]">Post a Job Listing</button></div>
              <div><button onClick={() => onOpenAuth('login')} className="hover:text-[var(--primary)]">Applicant Pipeline</button></div>
              <div><button onClick={() => onOpenAuth('signup_hirer')} className="hover:text-[var(--primary)]">Employer Studio</button></div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[var(--ink)] font-bold block text-sm">Locations</span>
            <div className="space-y-2 text-[var(--ink-3)]">
              <div><a href="/" className="hover:text-[var(--primary)]">Lagos & Nigeria</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Abuja & Port Harcourt</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Global Remote</a></div>
              <div><a href="/" className="hover:text-[var(--primary)]">Africa Regional</a></div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[var(--ink)] font-bold block text-sm">Platform</span>
            <div className="space-y-2 text-[var(--ink-3)]">
              <div>Verified Companies</div>
              <div>Direct CV Uploads</div>
              <div>Real-time Email Notifications</div>
              <div>Privacy Protection</div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-3)]">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span>© {new Date().getFullYear()} LogJob.ng. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://storyset.com/job"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ink-3)] hover:text-[var(--primary)] transition-colors"
            >
              Job illustrations by Storyset
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--ink-2)] font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Hiring Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
