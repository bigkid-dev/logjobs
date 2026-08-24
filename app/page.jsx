'use client';

import { useState, useEffect, useCallback } from 'react';
import HeaderNav from '../components/pleurat/HeaderNav';
import HeroSection from '../components/pleurat/HeroSection';
import JobCard from '../components/pleurat/JobCard';
import FilterBar from '../components/pleurat/FilterBar';
import PostJobModal from '../components/pleurat/PostJobModal';
import ApplyModal from '../components/pleurat/ApplyModal';
import HirerDashboard from '../components/pleurat/HirerDashboard';
import ApplicantDashboard from '../components/pleurat/ApplicantDashboard';
import AuthModal from '../components/pleurat/AuthModal';
import Footer from '../components/pleurat/Footer';
import { ArrowDown, AlertCircle, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('nigerian'); // 'nigerian' | 'global' | 'my-jobs'
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // Job List State
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ stacks: [], region: '', type: '', search: '' });

  // Modals State
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState('login');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Session check error:', err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch jobs for active feed
  const fetchJobs = useCallback(async (feedCategory, currentFilters, p = 1) => {
    if (feedCategory === 'my-jobs') return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('category', feedCategory);
      if (currentFilters.stacks?.length) params.set('stacks', currentFilters.stacks.join(','));
      if (currentFilters.region) params.set('region', currentFilters.region);
      if (currentFilters.type) params.set('type', currentFilters.type);
      if (currentFilters.search) params.set('search', currentFilters.search);
      params.set('page', p.toString());
      params.set('limit', '24');

      console.log(`[LogJob Client] Fetching roles -> /api/jobs?${params.toString()}`);
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      console.log(`[LogJob Client] Received response:`, data);

      if (!res.ok) throw new Error(data.error || 'Failed to fetch roles');

      if (p === 1) {
        setJobs(data.jobs || []);
      } else {
        setJobs((prev) => [...prev, ...(data.jobs || [])]);
      }
      setTotal(data.total || 0);
    } catch (err) {
      console.error('[LogJob Client] Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced filter effect
  useEffect(() => {
    if (activeTab === 'my-jobs') return;
    const t = setTimeout(() => {
      setPage(1);
      fetchJobs(activeTab, filters, 1);
    }, 300);
    return () => clearTimeout(t);
  }, [activeTab, filters, fetchJobs]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setFilters({ stacks: [], region: '', type: '', search: '' });
  };

  const handleApplyClick = (job) => {
    setSelectedJobToApply(job);
    setIsApplyOpen(true);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthDefaultMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    showToast('Signed out successfully');
    if (activeTab === 'my-jobs') {
      setActiveTab('nigerian');
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

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchJobs(activeTab, filters, next);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'mode-dark' : ''} bg-[var(--bg)]`}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onOpenAuth={handleOpenAuth}
        onOpenPostJob={() => setIsPostJobOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Stream Area */}
      <main>
        {activeTab === 'my-jobs' ? (
          /* WORKSPACE SECTION */
          <div>
            {!user ? (
              <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[var(--primary)] shadow-sm">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
                    Workspace Authentication
                  </h1>
                  <p className="text-sm text-[var(--ink-2)] max-w-md mx-auto leading-relaxed">
                    Sign in to publish roles as an employer, generate public sharable links, and review candidate CVs — or track your active job applications.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleOpenAuth('signup_hirer')}
                    className="btn-primary text-sm py-2.5 px-6"
                  >
                    Register as Hirer
                  </button>
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="btn-secondary text-sm py-2.5 px-6"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            ) : user.role === 'hirer' ? (
              <HirerDashboard
                user={user}
                onOpenPostJob={() => setIsPostJobOpen(true)}
              />
            ) : (
              <ApplicantDashboard
                user={user}
                onExploreJobs={() => setActiveTab('nigerian')}
              />
            )}
          </div>
        ) : (
          /* PUBLIC FEEDS */
          <div>
            {/* Hero Section */}
            <HeroSection
              onExploreStream={(stream) => handleTabChange(stream)}
              onOpenPostJob={() => {
                if (user?.role === 'hirer') {
                  setIsPostJobOpen(true);
                } else {
                  handleOpenAuth('signup_hirer');
                }
              }}
              totalJobs={total}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              {/* Stream Title Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800">
                    <span>{activeTab === 'nigerian' ? 'Nigeria Roles' : '🌍 Global Remote'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] mt-2">
                    {activeTab === 'nigerian'
                      ? 'Ogun, Lagos, Abuja & Nigeria Career Opportunities'
                      : 'Global Remote Career Opportunities'}
                  </h2>
                </div>

                <div className="text-xs font-medium text-[var(--ink-3)] bg-[var(--bg-surface)] border border-[var(--line)] px-3 py-1.5 rounded-full shadow-sm">
                  {total.toLocaleString()} opportunities available
                </div>
              </div>

              {/* Filter Bar */}
              <FilterBar filters={filters} onChange={(newF) => setFilters(newF)} />

              {/* Grid of Job Cards */}
              {error ? (
                <div className="text-center py-16 border border-red-200 rounded-2xl p-8 bg-red-50 text-red-600 text-sm flex flex-col items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  <span>Unable to load roles: {error}. Please refresh or check your connection.</span>
                </div>
              ) : jobs.length === 0 && !loading ? (
                <div className="text-center py-20 p-8 border border-[var(--line)] rounded-2xl bg-[var(--bg-surface)] space-y-3 shadow-sm">
                  <div className="text-base font-bold text-[var(--ink)]">No Opportunities Found</div>
                  <div className="text-sm text-[var(--ink-3)] max-w-sm mx-auto">
                    Try clearing some of your category or location filters to expand the search results.
                  </div>
                  <button
                    onClick={() => setFilters({ stacks: [], region: '', type: '', search: '' })}
                    className="btn-secondary text-xs py-1.5 px-4 mt-2"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={handleApplyClick}
                        onCopyLink={() => showToast('Public sharable link copied')}
                      />
                    ))}

                    {/* Skeletons while loading */}
                    {loading &&
                      Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={`skel-${i}`}
                          className="rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)] p-6 space-y-4 animate-pulse shadow-sm"
                        >
                          <div className="flex gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[var(--line)]" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-[var(--line)] rounded w-3/4" />
                              <div className="h-3 bg-[var(--line)] rounded w-1/2" />
                            </div>
                          </div>
                          <div className="h-4 bg-[var(--line)] rounded-full w-24" />
                          <div className="h-8 bg-[var(--line)] rounded-xl" />
                        </div>
                      ))}
                  </div>

                  {/* Load More */}
                  {jobs.length < total && !loading && (
                    <div className="text-center mt-12">
                      <button
                        onClick={loadMore}
                        className="btn-secondary text-xs py-2.5 px-8 font-semibold shadow-sm"
                      >
                        <span>Load More Roles ({total - jobs.length} remaining)</span>
                        <ArrowDown className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} />

      {/* Modals */}
      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        user={user}
        onJobCreated={(newJob) => {
          showToast('Role published successfully');
          if (activeTab === 'my-jobs') {
            window.location.reload();
          }
        }}
      />

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        job={selectedJobToApply}
        user={user}
      />

      <AuthModal
        isOpen={isAuthOpen}
        defaultMode={authDefaultMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          showToast(`Signed in as ${u.name}`);
        }}
      />
    </div>
  );
}
