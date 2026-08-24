'use client';

import { useState } from 'react';
import { X, AlertCircle, Building2, User, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(defaultMode.startsWith('signup') ? 'signup' : 'login');
  const [role, setRole] = useState(defaultMode === 'signup_hirer' ? 'hirer' : 'applicant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const payload = mode === 'signup'
      ? { name, email, password, role, companyName }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      if (onAuthSuccess) onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] text-[var(--ink)] shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-[var(--line)] bg-[var(--bg-muted)] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 inline-block">
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </div>
            <h2 className="text-xl font-bold text-[var(--ink)] mt-1 tracking-tight">
              {mode === 'signup' ? 'Get started on LogJob' : 'Sign in to your account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--line)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-6 space-y-5">
          <div className="flex rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-[var(--bg-surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-[var(--bg-surface)] text-[var(--ink)] shadow-sm'
                  : 'text-[var(--ink-3)] hover:text-[var(--ink)]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--ink-2)]">
                  I want to:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('hirer')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      role === 'hirer'
                        ? 'border-[var(--primary)] bg-emerald-50/70 text-[var(--ink)] shadow-sm'
                        : 'border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink-2)] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--ink)]">
                      <Building2 className="w-4 h-4 text-[var(--primary)]" />
                      <span>Hire Talent</span>
                    </div>
                    <div className="text-[11px] text-[var(--ink-3)] font-normal mt-1">Post jobs & review applications</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('applicant')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      role === 'applicant'
                        ? 'border-[var(--primary)] bg-emerald-50/70 text-[var(--ink)] shadow-sm'
                        : 'border-[var(--line)] bg-[var(--bg-muted)] text-[var(--ink-2)] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--ink)]">
                      <User className="w-4 h-4 text-[var(--primary)]" />
                      <span>Find Jobs</span>
                    </div>
                    <div className="text-[11px] text-[var(--ink-3)] font-normal mt-1">Browse & apply directly</div>
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                />
              </div>
            )}

            {mode === 'signup' && role === 'hirer' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global or Stealth"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 mt-2 font-semibold shadow-sm"
            >
              {loading
                ? 'Processing...'
                : mode === 'signup'
                ? `Create ${role === 'hirer' ? 'Employer' : 'Candidate'} Account`
                : 'Sign In to Workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
