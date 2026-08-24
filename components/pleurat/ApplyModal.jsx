'use client';

import { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, ArrowRight, FileText } from 'lucide-react';

export default function ApplyModal({ isOpen, onClose, job, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [coverNote, setCoverNote] = useState('');

  // CV File State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState('');
  const [resumeSize, setResumeSize] = useState(0);

  // Custom Answers State
  const [customAnswers, setCustomAnswers] = useState({});

  if (!isOpen || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB Limit Validation
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit. Please upload a smaller file.`);
      setResumeFile(null);
      setResumeData('');
      return;
    }

    setError(null);
    setResumeFile(file);
    setResumeSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      setResumeData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomAnswerChange = (questionId, value) => {
    setCustomAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formattedCustomAnswers = (job.custom_questions || []).map(q => ({
      question: q.question,
      answer: customAnswers[q.id] || ''
    }));

    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          linkedin,
          github,
          portfolio,
          resumeData,
          resumeFilename: resumeFile ? resumeFile.name : '',
          resumeSize,
          coverNote,
          customAnswers: formattedCustomAnswers
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] text-[var(--ink)] shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-[var(--line)] bg-[var(--bg-muted)] flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold">
              <span>Direct Application</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--ink)] mt-1.5 tracking-tight">
              Apply for {job.title}
            </h2>
            <div className="text-xs text-[var(--ink-2)] mt-0.5 font-medium">
              {job.company} • {job.location || 'Remote'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--line)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {success ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                Application Delivered!
              </h3>
              <p className="text-sm text-[var(--ink-2)] max-w-sm mx-auto leading-relaxed">
                Your profile and CV have been submitted directly to the hiring team at <strong>{job.company}</strong>. A confirmation email was sent to <strong>{email}</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--line)]">
              <button
                onClick={onClose}
                className="btn-primary text-sm py-2 px-6"
              >
                Close & Return to Jobs
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Bello"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. amina@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  placeholder="linkedin.com/in/user"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                  Portfolio / Website Link
                </label>
                <input
                  type="url"
                  placeholder="mywork.com or drive link"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                />
              </div>
            </div>

            {/* CV / Resume File Uploader */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1 flex items-center justify-between">
                <span>CV / Resume Attachment (PDF/DOCX) *</span>
                <span className="text-[11px] text-[var(--ink-3)] font-normal">Max 5MB</span>
              </label>

              <div className="relative border-2 border-dashed border-[var(--line)] rounded-xl p-5 text-center hover:border-emerald-400 transition-colors bg-[var(--bg-muted)] group">
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2 text-[var(--primary)]">
                    <FileText className="w-5 h-5 text-[var(--primary)]" />
                    <span className="font-semibold text-xs">{resumeFile.name}</span>
                    <span className="text-xs text-[var(--ink-3)]">
                      ({(resumeSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 mx-auto text-[var(--ink-4)] group-hover:text-[var(--primary)] transition-colors" />
                    <div className="text-xs font-semibold text-[var(--ink)]">Click to upload or drag and drop your CV</div>
                    <div className="text-[11px] text-[var(--ink-3)]">PDF or DOCX format (Max 5MB)</div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Screening Questions */}
            {job.custom_questions && job.custom_questions.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[var(--line)]">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider block">
                  Screening Questions
                </span>
                {job.custom_questions.map((q, idx) => (
                  <div key={q.id || idx}>
                    <label className="block text-xs font-medium text-[var(--ink-2)] mb-1">
                      {idx + 1}. {q.question} {q.required ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      required={q.required}
                      placeholder="Your answer..."
                      value={customAnswers[q.id] || ''}
                      onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                      className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Cover Note */}
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                Brief Introduction / Note to Hirer (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share a brief overview of why you are a great fit for this position..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl p-3 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2 px-6 shadow-sm font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
