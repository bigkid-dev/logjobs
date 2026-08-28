'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderNav from './HeaderNav';
import ApplyModal from './ApplyModal';
import AuthModal from './AuthModal';
import Footer from './Footer';
import { ArrowLeft, Share2, Check, MapPin, Clock, Building2, ShieldCheck, ArrowRight, ExternalLink, Lock } from 'lucide-react';

export default function JobDetailClient({ initialJob, jobId }) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(!initialJob);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    fetchSession();
    if (!initialJob && jobId) {
      fetchJob();
    }
  }, [initialJob, jobId]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } catch (err) {
      console.error('Session check error:', err);
    }
  };

  const fetchJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load job details');
      setJob(data.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://logjobs.blog/jobs/${jobId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('mode-dark');
    } else {
      document.documentElement.classList.remove('mode-dark');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'mode-dark' : ''} bg-[var(--bg)]`}>
      <HeaderNav
        activeTab="nigerian"
        onTabChange={(tab) => router.push(`/?tab=${tab}`)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPostJob={() => router.push('/?action=post')}
        onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          setUser(null);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center py-24 text-sm text-[var(--ink-3)]">
            Loading position details...
          </div>
        ) : error || !job ? (
          <div className="text-center py-24 space-y-4">
            <h1 className="text-2xl font-bold text-[var(--ink)]">Role Not Found</h1>
            <p className="text-sm text-[var(--ink-2)]">{error || 'This listing may have been closed or removed.'}</p>
            <a
              href="/"
              className="btn-primary text-sm py-2 px-6 inline-flex"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Return to Jobs</span>
            </a>
          </div>
        ) : (
          <article className="space-y-6">
            {/* Top Back Nav & Share Banner */}
            <div className="flex items-center justify-between gap-4 text-xs font-medium">
              <a
                href="/"
                className="text-[var(--ink-2)] hover:text-[var(--primary)] flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to all jobs</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="btn-secondary text-xs py-1.5 px-4 min-h-[34px] shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 mr-1" />
                    <span>Share Role</span>
                  </>
                )}
              </button>
            </div>

            {/* Main Job Header Card */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] p-8 sm:p-10 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.is_anonymous ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-emerald-300 border border-slate-700 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confidential Hiring</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct Employer</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                      <span>{job.job_type || 'Full Time'}</span>
                    </span>
                    <span className="text-xs text-[var(--ink-3)]">
                      Posted {new Date(job.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--ink)] tracking-tight">
                    {job.title}
                  </h1>

                  <div className="text-sm text-[var(--ink-2)] flex items-center gap-3 flex-wrap font-medium">
                    <span className="text-[var(--ink)] font-semibold flex items-center gap-1.5">
                      {job.is_anonymous ? (
                        <Lock className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Building2 className="w-4 h-4 text-[var(--primary)]" />
                      )}
                      <span>{job.company || (job.is_anonymous ? 'Confidential Employer' : 'Hiring Company')}</span>
                    </span>
                    <span className="text-[var(--ink-4)]">•</span>
                    <span className="flex items-center gap-1 text-[var(--ink-3)]">
                      <MapPin className="w-4 h-4 text-[var(--ink-4)]" />
                      {job.location || 'Remote'}
                    </span>
                    {job.salary ? (
                      <>
                        <span className="text-[var(--ink-4)]">•</span>
                        <span className="font-semibold px-2.5 py-0.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200">
                          {job.salary}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                {job.url?.startsWith('http') ? (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-3 px-6 shadow-md shadow-emerald-900/15 self-start sm:self-auto font-semibold inline-flex items-center gap-2"
                  >
                    <span>Apply on Official Site</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => setIsApplyOpen(true)}
                    className="btn-primary text-sm py-3 px-6 shadow-md shadow-emerald-900/15 self-start sm:self-auto font-semibold inline-flex items-center gap-2"
                  >
                    <span>Apply for this Role</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Badges Matrix */}
              <div className="flex items-center flex-wrap gap-2 pt-5 border-t border-[var(--line)] text-xs">
                <span className="px-3 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--line)] text-[var(--ink)] font-medium">
                  Workplace: {job.workplace_type || 'Remote'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--line)] text-[var(--ink)] font-medium">
                  Engagement: {job.job_type || 'Full Time'}
                </span>
                <span className="px-3 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--line)] text-[var(--ink)] font-medium">
                  Region: {job.region || 'Nigeria'}
                </span>
              </div>

              {/* Tech Stack Required */}
              {job.stacks && job.stacks.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-2.5">
                    Category & Key Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.stacks.map((stack) => (
                      <span
                        key={stack}
                        className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description Body */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] p-8 sm:p-10 space-y-6 shadow-sm">
              <h2 className="text-base font-bold text-[var(--ink)] border-b border-[var(--line)] pb-3">
                Role Description & Requirements
              </h2>

              <div className="text-sm text-[var(--ink-2)] leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>

              {/* Screening Questions Preview */}
              {job.custom_questions && job.custom_questions.length > 0 && (
                <div className="pt-6 border-t border-[var(--line)] space-y-3">
                  <h3 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                    Screening Questions:
                  </h3>
                  <div className="space-y-2">
                    {job.custom_questions.map((q, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--line)] text-xs text-[var(--ink)] flex items-start gap-2.5">
                        <span className="text-[var(--primary)] font-bold">{idx + 1}.</span>
                        <span>{q.question} {q.required ? '(Required)' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Apply Trigger */}
              <div className="pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-[var(--ink)]">Ready to submit your application?</div>
                  <div className="text-xs text-[var(--ink-3)]">
                    {job.is_anonymous
                      ? 'Submit your CV and details directly to the hiring team. Your profile will be reviewed privately.'
                      : `Send your CV directly to the hiring team at ${job.company}.`}
                  </div>
                </div>

                <button
                  onClick={() => setIsApplyOpen(true)}
                  className="btn-primary text-sm py-2.5 px-7 shadow-sm font-semibold"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Modals */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        job={job}
        user={user}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
