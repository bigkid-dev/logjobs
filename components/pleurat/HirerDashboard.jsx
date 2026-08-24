'use client';

import { useState, useEffect } from 'react';
import { Plus, Copy, Check, Users, Eye, Briefcase, ExternalLink, FileText, Globe, CheckCircle2 } from 'lucide-react';

export default function HirerDashboard({ user, onOpenPostJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs?category=my-jobs');
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobs || []);
        if (data.jobs?.length > 0 && !selectedJob) {
          fetchApplications(data.jobs[0].id);
          setSelectedJob(data.jobs[0]);
        }
      }
    } catch (err) {
      console.error('Fetch my jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    setLoadingApps(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`);
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Fetch applications error:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    fetchApplications(job.id);
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
        if (selectedJob?.id === job.id) {
          setSelectedJob({ ...selectedJob, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Toggle job status error:', err);
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      console.error('Update app status error:', err);
    }
  };

  const handleCopyLink = (jobId) => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://logjob.ng';
    const link = `${appUrl}/jobs/${jobId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedId(jobId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const totalApplications = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
  const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);
  const activeListings = jobs.filter(j => j.status === 'active').length;

  return (
    <div className="py-10 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              Employer Workspace
            </span>
            <span className="text-xs text-[var(--ink-3)] font-medium">{user?.company_name || 'Direct Employer'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Job Listings & Candidate Pipeline
          </h1>
        </div>

        <button
          onClick={onOpenPostJob}
          className="btn-primary text-xs py-2.5 px-6 font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Create Engineering Role</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-3)] uppercase tracking-wider">Active Listings</span>
            <Briefcase className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)]">{activeListings}</div>
          <span className="text-xs text-[var(--ink-3)]">of {jobs.length} total created</span>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-3)] uppercase tracking-wider">Applications Received</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700">{totalApplications}</div>
          <span className="text-xs text-[var(--ink-3)]">Candidate submissions</span>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--ink-3)] uppercase tracking-wider">Specification Views</span>
            <Eye className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-[var(--ink)]">{totalViews}</div>
          <span className="text-xs text-[var(--ink-3)]">Total job page impressions</span>
        </div>
      </div>

      {/* Main Grid: Job List on Left, Candidate Details on Right */}
      {loading ? (
        <div className="text-center py-20 text-xs text-[var(--ink-3)]">
          Loading workspace details...
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 p-8 border border-[var(--line)] rounded-2xl bg-[var(--bg-surface)] space-y-4 shadow-sm">
          <h3 className="text-lg font-bold text-[var(--ink)]">No Active Roles Published</h3>
          <p className="text-sm text-[var(--ink-2)] max-w-sm mx-auto leading-relaxed">
            Create an engineering listing to generate a public sharable URL and start receiving candidate CVs.
          </p>
          <button
            onClick={onOpenPostJob}
            className="btn-primary text-xs py-2 px-6 font-semibold"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Create First Role</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Posted Jobs List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase text-[var(--ink-3)] px-1 tracking-wider">
              Published Roles ({jobs.length})
            </h2>

            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isCopied = copiedId === job.id;

              return (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--bg-surface)] shadow-md ring-2 ring-emerald-100'
                      : 'border-[var(--line)] bg-[var(--bg-surface)] hover:border-emerald-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">{job.title}</h3>
                      <div className="text-xs text-[var(--ink-3)] mt-1 font-medium">
                        {job.location} • {job.job_type || 'Full Time'}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${
                        job.status === 'active'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink-3)]'
                      }`}
                    >
                      {job.status === 'active' ? 'Active' : 'Closed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--line)] text-xs">
                    <div className="flex items-center gap-3 text-[var(--ink-2)] text-xs font-medium">
                      <span>{job.applications_count || 0} applicants</span>
                      <span>•</span>
                      <span>{job.views || 0} views</span>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleCopyLink(job.id)}
                        className="text-xs text-[var(--ink-3)] hover:text-[var(--primary)] font-medium flex items-center gap-1"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)] font-medium"
                      >
                        {job.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Applications Pipeline for Selected Job */}
          <div className="lg:col-span-7 rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] p-6 space-y-5 shadow-sm">
            {selectedJob ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
                  <div>
                    <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider block">
                      Applicant Submissions
                    </span>
                    <h2 className="text-lg font-bold text-[var(--ink)] mt-0.5">
                      {selectedJob.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/jobs/${selectedJob.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-xs py-1.5 px-3.5 font-medium flex items-center gap-1"
                    >
                      <span>Public Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {loadingApps ? (
                  <div className="text-center py-16 text-xs text-[var(--ink-3)]">
                    Loading candidate submissions...
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-16 text-xs text-[var(--ink-3)] space-y-2">
                    <div className="font-semibold text-sm text-[var(--ink)]">No candidate submissions yet</div>
                    <div>Share your public link to start receiving CV files directly.</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--bg-muted)] space-y-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-sm text-[var(--ink)]">{app.name}</div>
                            <div className="text-[var(--ink-2)] mt-0.5 flex items-center gap-2 font-medium">
                              <span>{app.email}</span>
                              {app.phone && <span>• {app.phone}</span>}
                            </div>
                          </div>

                          {/* Status Selector */}
                          <select
                            value={app.status || 'applied'}
                            onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)}
                            className="bg-[var(--bg-surface)] border border-[var(--line)] rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--primary)] focus:border-[var(--primary)] outline-none shadow-sm"
                          >
                            <option value="applied">Applied</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Offer Sent</option>
                          </select>
                        </div>

                        {/* Attachments & Links */}
                        <div className="flex items-center flex-wrap gap-2.5 pt-3 border-t border-[var(--line)]">
                          {app.resume_data ? (
                            <a
                              href={app.resume_data}
                              download={app.resume_filename || 'candidate-resume.pdf'}
                              className="btn-primary text-xs py-1 px-3 min-h-[30px] font-semibold"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" />
                              <span>Download CV ({app.resume_filename || 'PDF'})</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-[var(--ink-3)]">No CV attached</span>
                          )}

                          {app.github && (
                            <a
                              href={app.github.startsWith('http') ? app.github : `https://${app.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-xs py-1 px-3 min-h-[30px]"
                            >
                              <span>GitHub</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}

                          {app.linkedin && (
                            <a
                              href={app.linkedin.startsWith('http') ? app.linkedin : `https://${app.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-xs py-1 px-3 min-h-[30px]"
                            >
                              <span>LinkedIn</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}

                          {app.portfolio && (
                            <a
                              href={app.portfolio.startsWith('http') ? app.portfolio : `https://${app.portfolio}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary text-xs py-1 px-3 min-h-[30px]"
                            >
                              <span>Portfolio</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>

                        {/* Screening Responses */}
                        {app.custom_answers && app.custom_answers.length > 0 && (
                          <div className="pt-2.5 border-t border-[var(--line)] space-y-1 bg-[var(--bg-surface)] p-3 rounded-xl">
                            <span className="text-[11px] font-bold uppercase text-[var(--ink-3)] block">
                              Screening Responses:
                            </span>
                            {app.custom_answers.map((qa, i) => (
                              <div key={i} className="text-xs">
                                <span className="text-[var(--ink-3)] font-medium">{qa.question}: </span>
                                <span className="text-[var(--ink)] font-semibold">{qa.answer || '—'}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Technical Note */}
                        {app.cover_note && (
                          <div className="text-xs text-[var(--ink-2)] italic pt-1">
                            "{app.cover_note}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-xs text-[var(--ink-3)]">
                Select a role from the left to view candidate applications.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
