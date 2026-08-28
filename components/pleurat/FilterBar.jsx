'use client';

import { Search, X, Briefcase } from 'lucide-react';

const CATEGORIES = [
  'Marketing & Sales',
  'Finance & Accounting',
  'Design & Creative',
  'Tech & Software',
  'Customer Support',
  'Operations & HR',
  'Product & Management',
  'Healthcare & Medical',
  'Writing & Content',
  'Administrative'
];

const REGIONS = ['Lagos', 'Abuja (FCT)', 'Port Harcourt', 'Ibadan', 'Ogun', 'All Nigeria', 'Global Remote', 'Europe', 'America'];
const TYPES = ['Full Time', 'Contract', 'Part Time', 'Freelance', 'Internship'];

export default function FilterBar({ filters, onChange }) {
  const toggleCategory = (category) => {
    const current = filters.stacks || [];
    onChange({
      ...filters,
      stacks: current.includes(category)
        ? current.filter(s => s !== category)
        : [...current, category]
    });
  };

  const toggleSingle = (key, value) => {
    onChange({
      ...filters,
      [key]: filters[key] === value ? '' : value
    });
  };

  const hasFilters = Boolean(
    (filters.stacks && filters.stacks.length > 0) ||
    filters.region ||
    filters.type ||
    filters.search
  );

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] p-6 mb-8 shadow-sm space-y-5">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--ink-4)]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by role, company, skills, or city (e.g. Marketing, Accountant, Lagos, Abuja, Port Harcourt, Remote)..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full bg-[var(--bg-muted)] border border-[var(--line)] rounded-xl pl-10 pr-10 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-4)] focus:bg-[var(--bg-surface)] focus:border-[var(--primary)] focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--ink-4)] hover:text-[var(--ink)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Industry / Category Pills */}
      <div>
        <div className="text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span>Job Category & Field</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = (filters.stacks || []).includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm font-semibold'
                    : 'bg-[var(--bg-muted)] border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--bg-subtle)] hover:border-emerald-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region & Engagement Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[var(--line)]">
        {/* Region */}
        <div>
          <div className="text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-2">
            Location & Region
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((r) => {
              const active = filters.region === r;
              return (
                <button
                  key={r}
                  onClick={() => toggleSingle('region', r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm font-semibold'
                      : 'bg-[var(--bg-muted)] border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--bg-subtle)] hover:border-emerald-200'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <div className="text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-wider mb-2">
            Engagement Type
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => {
              const active = filters.type === t;
              return (
                <button
                  key={t}
                  onClick={() => toggleSingle('type', t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm font-semibold'
                      : 'bg-[var(--bg-muted)] border-[var(--line)] text-[var(--ink-2)] hover:bg-[var(--bg-subtle)] hover:border-emerald-200'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset Bar */}
      {hasFilters && (
        <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
          <span className="text-[var(--ink-3)]">Filtered results active</span>
          <button
            onClick={() => onChange({ stacks: [], region: '', type: '', search: '' })}
            className="text-[var(--primary)] hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
