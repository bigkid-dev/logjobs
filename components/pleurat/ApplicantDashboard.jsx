'use client';

import { useState, useEffect } from 'react';
import { Briefcase, FileText, ExternalLink, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

const STATUS_BADGES = {
  applied: { label: 'Submitted', color: '#045447', bg: '#ecfdf5', border: '#a7f3d0' },
  reviewing: { label: 'In Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  shortlisted: { label: 'Shortlisted', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  rejected: { label: 'Closed', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  hired: { label: 'Offer Sent', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' }
};

export default function ApplicantDashboard({ user, onExploreJobs }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications/my');
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Fetch my applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              Candidate Tracker
            </span>
            <span className="text-xs text-[var(--ink-3)] font-medium">{user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            My Job Applications ({applications.length})
          </h1>
        </div>

        <button
          onClick={onExploreJobs}
          className="btn-primary text-xs py-2 px-5 font-semibold"
        >
          <span>Explore Open Roles</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>

      {/* Application List */}
      {loading ? (
        <div className="text-center py-20 text-xs text-[var(--ink-3)]">
          Loading your application history...
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 p-8 border border-[var(--line)] rounded-2xl bg-[var(--bg-surface)] space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-[var(--ink)]">No Applications Yet</h3>
          <p className="text-sm text-[var(--ink-2)] max-w-sm mx-auto leading-relaxed">
            Browse active Nigerian and global engineering positions, submit your CV, and track your interview progress here.
          </p>
          <button
            onClick={onExploreJobs}
            className="btn-primary text-xs py-2 px-6 font-semibold"
          >
            Explore Open Roles
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const statusConfig = STATUS_BADGES[app.status] || STATUS_BADGES.applied;

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-[var(--ink)]">{app.job_title}</h3>
                    <span
                      className="text-[11px] px-2.5 py-0.5 rounded-full border font-semibold"
                      style={{
                        color: statusConfig.color,
                        backgroundColor: statusConfig.bg,
                        borderColor: statusConfig.border,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="text-[var(--ink-2)] mt-1.5 flex items-center gap-2 font-medium">
                    <span>{app.job_company}</span>
                    <span className="text-[var(--ink-4)]">•</span>
                    <span className="text-[var(--ink-3)]">{app.job_location || 'Remote'}</span>
                    <span className="text-[var(--ink-4)]">•</span>
                    <span className="text-[var(--ink-3)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Submitted {new Date(app.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {app.resume_data && (
                    <a
                      href={app.resume_data}
                      download={app.resume_filename || 'my-resume.pdf'}
                      className="btn-secondary text-xs py-1.5 px-3.5 font-medium"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      <span>View CV</span>
                    </a>
                  )}

                  {app.job_id && (
                    <a
                      href={`/jobs/${app.job_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-xs py-1.5 px-3.5 font-medium flex items-center gap-1"
                    >
                      <span>Role Specs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
