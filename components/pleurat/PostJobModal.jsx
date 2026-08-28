'use client';

import { useState } from 'react';
import { X, Check, ExternalLink, ArrowRight, ArrowLeft, Trash2, Lock, ShieldCheck, EyeOff, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CORPORATE_IMAGES, DEFAULT_CORP_IMAGE } from '../../lib/corporateImages.js';

const COMMON_CATEGORIES = [
  'Marketing', 'Sales', 'Finance', 'Accounting', 'UI/UX Design',
  'Graphic Design', 'Customer Support', 'Operations', 'Human Resources',
  'Project Management', 'Product Management', 'Healthcare',
  'Software Development', 'Writing & Content', 'Administration', 'Logistics'
];

const REGIONS = ['Nigeria', 'Africa', 'Europe', 'America', 'Remote'];
const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'On-site'];
const JOB_TYPES = ['Full Time', 'Contract', 'Part Time', 'Freelance', 'Internship'];

export default function PostJobModal({ isOpen, onClose, onJobCreated, user }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdJob, setCreatedJob] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.company_name || '');
  const [logoUrl, setLogoUrl] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [region, setRegion] = useState('Nigeria');
  const [workplaceType, setWorkplaceType] = useState('Remote');
  const [jobType, setJobType] = useState('Full Time');
  const [salaryCurrency, setSalaryCurrency] = useState('₦');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStacks, setSelectedStacks] = useState(['Marketing']);
  const [customStackInput, setCustomStackInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(DEFAULT_CORP_IMAGE);
  
  // Custom Screening Questions
  const [customQuestions, setCustomQuestions] = useState([
    { id: 1, question: 'Link to your LinkedIn profile, portfolio, or past work references', required: true },
    { id: 2, question: 'How many years of relevant experience do you have for this role?', required: true }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  if (!isOpen) return null;

  const toggleStack = (category) => {
    if (selectedStacks.includes(category)) {
      setSelectedStacks(selectedStacks.filter(s => s !== category));
    } else {
      setSelectedStacks([...selectedStacks, category]);
    }
  };

  const addCustomStack = () => {
    if (customStackInput.trim() && !selectedStacks.includes(customStackInput.trim())) {
      setSelectedStacks([...selectedStacks, customStackInput.trim()]);
      setCustomStackInput('');
    }
  };

  const addCustomQuestion = () => {
    if (newQuestionText.trim()) {
      setCustomQuestions([
        ...customQuestions,
        { id: Date.now(), question: newQuestionText.trim(), required: false }
      ]);
      setNewQuestionText('');
    }
  };

  const removeQuestion = (id) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const salaryFormatted = salaryMin && salaryMax
      ? `${salaryCurrency}${Number(salaryMin).toLocaleString()} – ${salaryCurrency}${Number(salaryMax).toLocaleString()}`
      : salaryMin
      ? `From ${salaryCurrency}${Number(salaryMin).toLocaleString()}`
      : '';

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company: isAnonymous
            ? (company.trim() || 'Confidential Employer')
            : (company.trim() || user?.company_name || 'Hiring Company'),
          logoUrl: isAnonymous ? '' : logoUrl,
          location,
          region,
          workplaceType,
          jobType,
          salary: salaryFormatted,
          description,
          stacks: selectedStacks,
          customQuestions,
          isAnonymous,
          ogImageUrl: selectedImage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post job');

      setCreatedJob(data);
      if (onJobCreated) onJobCreated(data.job);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (createdJob?.shareableLink) {
      navigator.clipboard.writeText(createdJob.shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] text-[var(--ink)] shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--line)] bg-[var(--bg-muted)]">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                Employer Studio
              </span>
              <span className="text-xs text-[var(--ink-3)] font-medium">
                Step {step} of 3
              </span>
            </div>
            <h2 className="text-xl font-bold text-[var(--ink)] mt-1.5 tracking-tight">
              {createdJob ? 'Role Published' : 'Create Job Listing'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--line)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Screen: Sharable Link Display */}
        {createdJob ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {isAnonymous ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Published in Stealth / Anonymous Mode</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Role Published with Organization Branding</span>
                  </>
                )}
              </div>
              <h3 className="text-2xl font-bold text-[var(--ink)] tracking-tight">
                Role Successfully Published!
              </h3>
              <p className="text-sm text-[var(--ink-2)] max-w-md mx-auto leading-relaxed">
                {isAnonymous
                  ? 'Candidates will see your role requirements and skills while your organization name and compensation remain confidential.'
                  : 'Candidates can now browse the listing, submit their CVs, and answer your screening questions directly.'}
              </p>
            </div>

            {/* Sharable Public Link Banner */}
            <div className="bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl p-5 text-left space-y-2">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider block">
                Public Sharable Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdJob.shareableLink}
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--line)] rounded-lg px-3.5 py-2.5 text-xs font-mono text-[var(--ink)] select-all outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-primary text-xs py-2 px-5 min-h-[38px] font-semibold"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[var(--line)]">
              <a
                href={createdJob.shareableLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-2 px-5 font-semibold"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
              <button
                onClick={onClose}
                className="btn-primary text-xs py-2 px-6 font-semibold"
              >
                Return to Workspace
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            {/* Step 1: Basics & Location */}
            {step === 1 && (
              <div className="space-y-4 text-xs">
                {/* Stealth / Anonymous Mode Toggle Banner */}
                <div
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isAnonymous
                      ? 'bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-emerald-50/50 border-emerald-100 text-[var(--ink)] hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isAnonymous ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isAnonymous ? <Lock className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isAnonymous ? 'text-white' : 'text-[var(--ink)]'}`}>
                            Post Anonymously (Stealth Mode)
                          </span>
                          {isAnonymous && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 leading-tight ${isAnonymous ? 'text-slate-300' : 'text-[var(--ink-3)]'}`}>
                          {isAnonymous
                            ? 'Company branding and salary will be hidden from applicants. Only role requirements will be visible.'
                            : 'Hide organization name and salary to focus strictly on candidate qualifications & requirements.'}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        isAnonymous ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isAnonymous ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marketing Manager, Financial Analyst, UI/UX Designer, Operations Lead"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1 flex items-center justify-between">
                      <span>{isAnonymous ? 'Stealth Alias / Industry Descriptor' : 'Company / Organization Name *'}</span>
                      {isAnonymous && <span className="text-[10px] text-[var(--ink-4)] font-normal">Optional</span>}
                    </label>
                    <input
                      type="text"
                      required={!isAnonymous}
                      placeholder={isAnonymous ? "e.g. Stealth Startup, Confidential Client (Default: Confidential Employer)" : "e.g. Paystack, Kuda, Zenith"}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                      Location / City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lagos, Abuja, Port Harcourt, or Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                      Region
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    >
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                      Workplace
                    </label>
                    <select
                      value={workplaceType}
                      onChange={(e) => setWorkplaceType(e.target.value)}
                      className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    >
                      {WORKPLACE_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                      Engagement
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    >
                      {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1 flex items-center justify-between">
                    <span>Compensation (Optional)</span>
                    <span className="text-[10px] text-[var(--ink-4)]">Leave blank if unstated</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={salaryCurrency}
                      onChange={(e) => setSalaryCurrency(e.target.value)}
                      className="bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--primary)] outline-none font-medium"
                    >
                      <option value="₦">NGN (₦)</option>
                      <option value="$">USD ($)</option>
                      <option value="£">GBP (£)</option>
                      <option value="€">EUR (€)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Min (optional, e.g. 250000)"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="flex-1 bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    />
                    <span className="text-xs text-[var(--ink-3)] font-medium">to</span>
                    <input
                      type="number"
                      placeholder="Max (optional, e.g. 500000)"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="flex-1 bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Category, Skills, Description & WhatsApp Image Card */}
            {step === 2 && (
              <div className="space-y-5 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-2)] mb-2">
                    Category & Key Skills
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {COMMON_CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleStack(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedStacks.includes(cat)
                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm font-semibold'
                            : 'bg-[var(--bg-muted)] border-[var(--line)] text-[var(--ink-2)] hover:border-emerald-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom skill or tag (e.g. SEO, QuickBooks, Figma, CRM)..."
                      value={customStackInput}
                      onChange={(e) => setCustomStackInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomStack())}
                      className="flex-1 bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomStack}
                      className="btn-secondary text-xs py-1.5 px-4"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                    Job Description & Responsibilities *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Detail the role responsibilities, required qualifications, experience, team structure, and perks..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl p-3.5 text-sm text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none leading-relaxed"
                  />
                </div>

                {/* OpenGraph & WhatsApp Share Image Selector */}
                <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-muted)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-xs font-bold text-[var(--ink)]">
                        WhatsApp & Social Share Preview Card
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--ink-3)] font-medium">
                      Select corporate background image
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--ink-3)] leading-relaxed">
                    When your job link is shared on WhatsApp, Facebook, or Twitter, this corporate image will appear in high-res with a white overlay card summarizing your job details. (This image will not clutter your job page).
                  </p>

                  {/* Horizontal Scrollable / Grid of Corporate Photo Thumbnails */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {CORPORATE_IMAGES.map((img) => {
                      const isSelected = selectedImage === img.url;
                      return (
                        <div
                          key={img.id}
                          onClick={() => setSelectedImage(img.url)}
                          className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-[16/10] group ${
                            isSelected
                              ? 'border-[var(--primary)] ring-2 ring-emerald-500/20 shadow-md'
                              : 'border-[var(--line)] hover:border-slate-400 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                            <span className="text-[10px] font-semibold text-white leading-tight truncate">
                              {img.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[9px] shadow-sm">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Live WhatsApp Share Preview */}
                  <div className="pt-2 border-t border-[var(--line)] space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--ink-3)] uppercase tracking-wider block">
                      Live WhatsApp Card Preview
                    </span>
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-[16/9] max-h-48 flex items-center justify-center p-3">
                      {/* Selected Image in background */}
                      <img
                        src={selectedImage}
                        alt="Background Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-slate-950/40" />

                      {/* White Overlay Card */}
                      <div className="relative w-full max-w-sm bg-white/95 rounded-xl p-3 shadow-lg border border-white/60 space-y-1.5 text-slate-900">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="font-extrabold bg-[#045447] text-white px-2 py-0.5 rounded-full">
                            LOGJOBS
                          </span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            DIRECT HIRING
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {title || 'Job Title (e.g. Marketing Manager)'}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate">
                          {isAnonymous ? 'Confidential Employer' : (company || 'Hiring Company')} • 📍 {location} • {workplaceType}
                        </div>
                        {salaryMin && (
                          <div className="text-[10px] font-bold text-[#045447]">
                            💰 {salaryCurrency}{Number(salaryMin).toLocaleString()} {salaryMax ? `– ${salaryCurrency}${Number(salaryMax).toLocaleString()}` : '+'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Screening Questions */}
            {step === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[var(--ink-2)]">
                      Candidate Screening Questions
                    </label>
                    <span className="text-[11px] text-[var(--ink-3)]">
                      CV/Resume upload enabled by default (Max 5MB)
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {customQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--line)] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--primary)] font-bold">{idx + 1}.</span>
                          <span className="text-[var(--ink)] font-medium">{q.question}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(q.id)}
                          className="text-[var(--ink-4)] hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom question (e.g. 'What is your notice period?')..."
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomQuestion())}
                      className="flex-1 bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                  <div className="font-bold">What happens next:</div>
                  <div>• An instant public sharable link is created for your job listing</div>
                  <div>• Candidate CV uploads are securely stored and viewable in your dashboard</div>
                  <div>• Instant email notification dispatched whenever someone applies</div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn-secondary text-xs py-2 px-4 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
              ) : <div />}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      if (!title || !location) {
                        setError('Job title and Location are required');
                        return;
                      }
                      if (!isAnonymous && !company) {
                        setError('Company / Organization Name is required for branded roles (or switch to Stealth Mode)');
                        return;
                      }
                    }
                    if (step === 2 && !description) {
                      setError('Job description and requirements are required');
                      return;
                    }
                    setError(null);
                    setStep(step + 1);
                  }}
                  className="btn-primary text-xs py-2 px-5 font-semibold"
                >
                  <span>Continue to Step {step + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs py-2 px-6 font-semibold shadow-sm"
                >
                  {loading ? 'Publishing...' : 'Publish Job & Generate Link'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
