'use client';

import { useState } from 'react';
import { MapPin, Building2, Clock, Share2, Check, ArrowRight, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

export default function JobCard({ job, onApply, onCopyLink }) {
  const [copied, setCopied] = useState(false);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const handleCopyLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://logjob.ng';
    const link = job.url?.startsWith('http') ? job.url : `${appUrl}/jobs/${job.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (onCopyLink) onCopyLink(link);
  };

  const initials = job.company
    ? job.company
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DJ';

  const isCustomJob = Boolean(job.hirer_id);
  const isAnonymous = Boolean(job.is_anonymous);

  return (
    <div className={`group relative rounded-2xl border bg-[var(--bg-surface)] p-6 transition-all duration-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between shadow-sm ${
      isAnonymous ? 'border-slate-300/80 dark:border-slate-800' : 'border-[var(--line)]'
    }`}>
      {/* Top Details */}
      <div>
        <div className="flex items-start gap-3.5 mb-4">
          {/* Logo / Stealth Icon / Initials */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold overflow-hidden">
            {isAnonymous ? (
              <div className="w-full h-full rounded-xl bg-slate-900 text-emerald-400 border border-slate-700 flex items-center justify-center shadow-inner">
                <Lock className="w-4 h-4" />
              </div>
            ) : job.logo_url || job.logo ? (
              <img
                src={job.logo_url || job.logo}
                alt={job.company}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-[var(--bg-muted)] border border-[var(--line)] flex items-center justify-center text-[var(--primary)]">
                <span>{initials}</span>
              </div>
            )}
          </div>

          {/* Title + Company */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[var(--ink)] tracking-tight leading-snug group-hover:text-[var(--primary)] transition-colors">
                {job.title}
              </h3>
              {isAnonymous ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-slate-900 text-emerald-300 border border-slate-700 px-2 py-0.5 rounded-full shadow-sm">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Confidential</span>
                </span>
              ) : isCustomJob || job.source === 'Direct Employer' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Direct Hiring</span>
                </span>
              ) : job.source ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--bg-muted)] text-[var(--ink-3)] border border-[var(--line)] px-2 py-0.5 rounded-full">
                  <span>via {job.source}</span>
                </span>
              ) : null}
            </div>
            <div className="text-xs text-[var(--ink-2)] mt-1 flex items-center gap-2 font-medium">
              <span className={isAnonymous ? 'italic text-[var(--ink-2)] font-semibold' : ''}>
                {job.company || (isAnonymous ? 'Confidential Employer' : 'Direct Employer')}
              </span>
              <span className="text-[var(--ink-4)]">•</span>
              <span className="text-[var(--ink-3)] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[var(--ink-4)]" />
                <span>{job.location || 'Remote'}</span>
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-[11px] text-[var(--ink-3)] flex-shrink-0 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--ink-4)]" />
            <span>{timeAgo(job.postedAt || job.created_at)}</span>
          </span>
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center flex-wrap gap-2 mb-4 text-xs">
          {job.region && (
            <span className="px-2.5 py-0.5 rounded-full border border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink-2)] font-medium">
              {job.region}
            </span>
          )}

          <span className="px-2.5 py-0.5 rounded-full border border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink-3)] font-medium">
            {job.job_type || job.type || 'Full Time'}
          </span>

          {job.salary ? (
            <span className="px-2.5 py-0.5 rounded-full border border-emerald-200/80 bg-emerald-50 text-emerald-700 font-semibold">
              {job.salary}
            </span>
          ) : null}
        </div>

        {/* Stack Tags */}
        {job.stacks && job.stacks.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 mb-5">
            {[...new Set(job.stacks)]
              .filter((stack) => stack && !stack.toLowerCase().includes('confidential'))
              .slice(0, 5)
              .map((stack) => (
              <span
                key={stack}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[var(--bg-muted)] border border-[var(--line)] text-[var(--ink-2)]"
              >
                {stack}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs">
        <button
          onClick={handleCopyLink}
          className="text-[var(--ink-3)] hover:text-[var(--primary)] transition-colors flex items-center gap-1.5 font-medium"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-3">
          <a
            href={job.url?.startsWith('http') ? job.url : `/jobs/${job.id}`}
            target={job.url?.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="text-[var(--ink-2)] hover:text-[var(--primary)] font-medium flex items-center gap-1"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3 text-[var(--ink-4)]" />
          </a>

          {job.url?.startsWith('http') ? (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-1.5 px-3.5 min-h-[32px] shadow-sm font-semibold inline-flex items-center gap-1"
            >
              <span>Apply on Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={() => onApply(job)}
              className="btn-primary text-xs py-1.5 px-3.5 min-h-[32px] shadow-sm font-semibold inline-flex items-center gap-1"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
