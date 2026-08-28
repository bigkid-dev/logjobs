'use client';

import { useState } from 'react';
import { X, AlertCircle, Building2, User, ArrowRight, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(defaultMode.startsWith('signup') ? 'signup' : 'login');
  const [role, setRole] = useState(defaultMode === 'signup_hirer' ? 'hirer' : 'applicant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  // Password strength checks
  const criteria = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const strengthCount = Object.values(criteria).filter(Boolean).length;
  
  const getStrengthInfo = () => {
    if (password.length === 0) return { label: '', color: 'bg-slate-200', textCol: 'text-slate-400', percent: '0%' };
    if (strengthCount <= 2) return { label: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-600 dark:text-rose-400', percent: '25%' };
    if (strengthCount === 3) return { label: 'Fair', color: 'bg-amber-500', textCol: 'text-amber-600 dark:text-amber-400', percent: '50%' };
    if (strengthCount === 4) return { label: 'Good', color: 'bg-teal-500', textCol: 'text-teal-600 dark:text-teal-400', percent: '75%' };
    return { label: 'Strong', color: 'bg-emerald-600', textCol: 'text-emerald-600 dark:text-emerald-400', percent: '100%' };
  };

  const strength = getStrengthInfo();
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (strengthCount < 3) {
        setError('Please choose a stronger password with a mix of letters, numbers, and symbols');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your confirm password.');
        return;
      }
    }

    setLoading(true);

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

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] text-[var(--ink)] shadow-2xl overflow-hidden my-6 animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-[var(--line)] bg-[var(--bg-muted)] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 inline-block">
              {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
            </div>
            <h2 className="text-xl font-bold text-[var(--ink)] mt-1 tracking-tight">
              {mode === 'signup' ? 'Get started on LogJobs' : 'Sign in to your account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--line)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-6 space-y-5">
          <div className="flex rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] p-1">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
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
              onClick={() => handleTabSwitch('signup')}
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
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
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
                        ? 'border-[var(--primary)] bg-emerald-50/70 dark:bg-emerald-950/30 text-[var(--ink)] shadow-sm'
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
                        ? 'border-[var(--primary)] bg-emerald-50/70 dark:bg-emerald-950/30 text-[var(--ink)] shadow-sm'
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
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none transition-all"
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
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none transition-all"
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
                className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none transition-all"
              />
            </div>

            {/* Password Input with Eye Toggle */}
            <div>
              <label className="block text-xs font-semibold text-[var(--ink-2)] mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--ink-4)] hover:text-[var(--ink)] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign Up Mode: Strong Password Validator */}
            {mode === 'signup' && password.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--line)] space-y-2.5 animate-fade-in">
                {/* Strength Meter Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-[var(--ink-3)] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span>Password Strength:</span>
                    </span>
                    <span className={`font-bold ${strength.textCol}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
                      style={{ width: strength.percent }}
                    />
                  </div>
                </div>

                {/* Criteria Checklist */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${criteria.length ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-[var(--ink-4)]'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${criteria.length ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      ✓
                    </div>
                    <span>8+ characters</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-[var(--ink-4)]'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${criteria.hasUpper ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      ✓
                    </div>
                    <span>Uppercase (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-[var(--ink-4)]'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${criteria.hasNumber ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      ✓
                    </div>
                    <span>Number (0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${criteria.hasSpecial ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-[var(--ink-4)]'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${criteria.hasSpecial ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      ✓
                    </div>
                    <span>Symbol (!@#$)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sign Up Mode: Confirm Password Field */}
            {mode === 'signup' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[var(--ink-2)]">
                    Confirm Password *
                  </label>
                  {passwordsMatch && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Passwords match</span>
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[11px] font-medium text-rose-500">
                      Passwords do not match
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-[var(--bg-muted)] border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[var(--ink)] focus:bg-[var(--bg-surface)] outline-none transition-all ${
                      passwordsMismatch
                        ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                        : passwordsMatch
                        ? 'border-emerald-400 focus:border-emerald-500 ring-1 ring-emerald-200'
                        : 'border-[var(--line)] focus:border-[var(--primary)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--ink-4)] hover:text-[var(--ink)] transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

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
