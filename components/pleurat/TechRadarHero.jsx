'use client';

import { useState } from 'react';

const HUBS = [
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', role: 'HQ Node', x: 440, y: 165, jobs: '45+ Roles', tag: 'High Activity', color: '#C0EB3A' },
  { id: 'abuja', name: 'Abuja', country: 'Nigeria', role: 'Gov & Fintech', x: 460, y: 140, jobs: '22+ Roles', tag: 'Active', color: '#C0EB3A' },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', role: 'East Africa Hub', x: 530, y: 180, jobs: '38+ Roles', tag: 'Active', color: '#F3B44A' },
  { id: 'london', name: 'London', country: 'UK', role: 'Sync Timezone', x: 410, y: 80, jobs: '120+ Remote', tag: 'Global Tier 1', color: '#38BDF8' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', role: 'EU Tech Hub', x: 445, y: 75, jobs: '85+ Remote', tag: 'High Comp', color: '#38BDF8' },
  { id: 'sf', name: 'San Francisco', country: 'USA', role: 'AI & SaaS Core', x: 190, y: 105, jobs: '160+ Remote', tag: 'USD Tier 1', color: '#F3B44A' },
  { id: 'remote', name: 'Global Async', country: 'Worldwide', role: 'Distributed', x: 330, y: 145, jobs: '300+ Active', tag: 'Anywhere', color: '#EFEDE2' },
];

export default function TechRadarHero({ onSelectHub, activeRegion, totalJobs = 0 }) {
  const [selectedHub, setSelectedHub] = useState(HUBS[0]);
  const [hoveredHub, setHoveredHub] = useState(null);

  const handleHubClick = (hub) => {
    setSelectedHub(hub);
    if (onSelectHub) {
      if (hub.id === 'lagos' || hub.id === 'abuja') {
        onSelectHub('Nigeria');
      } else if (hub.id === 'nairobi') {
        onSelectHub('Africa');
      } else if (hub.id === 'london' || hub.id === 'berlin') {
        onSelectHub('Europe');
      } else if (hub.id === 'sf') {
        onSelectHub('America');
      } else {
        onSelectHub('Remote');
      }
    }
  };

  return (
    <section className="relative pt-6 pb-10 border-b border-[var(--border)] overflow-hidden bg-blueprint">
      {/* Figure Tag */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--amber)] tracking-wider uppercase bg-[var(--amber-glow)] px-2 py-0.5 rounded border border-[var(--amber)]/30">
            FIG. 001 — GLOBAL DEV RADAR
          </span>
          <span className="text-[11px] font-mono text-[var(--ink-muted)]">
            LOC: LAGOS / GLOBAL · LIVE TELEMETRY
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-[var(--ink-secondary)]">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--lime)] animate-ping" />
          <span>{totalJobs.toLocaleString()} ACTIVE JOBS INDEXED</span>
        </div>
      </div>

      {/* Hero Headline & Intro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        <div className="lg:col-span-7">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--ink)] leading-[1.08] mb-4">
            Remote & Nigerian{' '}
            <span className="text-[var(--lime)] underline decoration-[var(--lime)]/30 underline-offset-8">
              Tech Jobs
            </span>{' '}
            for Top Engineers.
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-secondary)] max-w-xl leading-relaxed">
            Curated high-signal engineering roles across React, Next.js, Python, Node, and Go. 
            Connect directly with verified hiring teams in Nigeria, Europe, and Silicon Valley.
          </p>
        </div>

        {/* Real-time Telemetry Stats Pill */}
        <div className="lg:col-span-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
            <span className="text-xs font-mono font-medium text-[var(--ink)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--amber)]" />
              HUB INSPECTION
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border)] text-[var(--ink-muted)]">
              SYNCED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase block">Selected Node</span>
              <span className="font-semibold text-[var(--ink)] text-sm">{selectedHub.name}, {selectedHub.country}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[var(--ink-muted)] uppercase block">Role Stream</span>
              <span className="font-mono text-[var(--amber)] text-sm">{selectedHub.jobs}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)] pt-2 border-t border-[var(--border)]">
            <span>FILTER FEED:</span>
            <button
              onClick={() => handleHubClick(selectedHub)}
              className="text-[var(--lime)] hover:underline font-semibold flex items-center gap-1"
            >
              Filter by {selectedHub.name} →
            </button>
          </div>
        </div>
      </div>

      {/* 2.5D Isometric Global Tech Telemetry Radar SVG */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full rounded-2xl border border-[var(--border)] bg-[#07090F] p-4 sm:p-6 overflow-hidden shadow-inner">
          {/* Background Grid & Scanlines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(243,180,74,0.06),transparent_70%)] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)]" />
              2.5D TALENT TELEMETRY RADAR
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-muted)]">
              CLICK ANY BEACON TO FILTER JOBS
            </span>
          </div>

          <div className="relative w-full h-[220px] sm:h-[280px]">
            <svg
              className="w-full h-full"
              viewBox="0 0 720 280"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Radar Sweep Gradient */}
                <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F3B44A" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#C0EB3A" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#C0EB3A" stopOpacity="0" />
                </radialGradient>

                {/* Sweep Cone */}
                <linearGradient id="sweep-cone" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F3B44A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F3B44A" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Concentric Radar Rings */}
              <circle cx="360" cy="140" r="120" fill="none" stroke="rgba(239, 237, 226, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="360" cy="140" r="80" fill="none" stroke="rgba(239, 237, 226, 0.08)" strokeWidth="1" />
              <circle cx="360" cy="140" r="40" fill="none" stroke="rgba(243, 180, 74, 0.12)" strokeWidth="1" />
              <line x1="360" y1="20" x2="360" y2="260" stroke="rgba(239, 237, 226, 0.06)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="120" y1="140" x2="600" y2="140" stroke="rgba(239, 237, 226, 0.06)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Rotating Sweep Beam */}
              <g className="animate-radar-sweep origin-[360px_140px]">
                <path
                  d="M 360 140 L 480 140 A 120 120 0 0 0 445 55 Z"
                  fill="url(#sweep-cone)"
                />
                <line x1="360" y1="140" x2="480" y2="140" stroke="#F3B44A" strokeWidth="1.5" strokeOpacity="0.8" />
              </g>

              {/* Connection Trace Lines */}
              <g stroke="rgba(243, 180, 74, 0.2)" strokeWidth="1" fill="none">
                {HUBS.map((hub, i) => {
                  const next = HUBS[(i + 1) % HUBS.length];
                  return (
                    <line
                      key={`trace-${i}`}
                      x1={hub.x}
                      y1={hub.y}
                      x2={next.x}
                      y2={next.y}
                      strokeDasharray="2 4"
                    />
                  );
                })}
              </g>

              {/* Interactive City Hub Beacons */}
              {HUBS.map((hub) => {
                const isSelected = selectedHub.id === hub.id;
                const isHovered = hoveredHub?.id === hub.id;

                return (
                  <g
                    key={hub.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() => handleHubClick(hub)}
                    onMouseEnter={() => setHoveredHub(hub)}
                    onMouseLeave={() => setHoveredHub(null)}
                  >
                    {/* Pulsing Ripple */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r={isSelected || isHovered ? "16" : "10"}
                      fill="none"
                      stroke={hub.color}
                      strokeWidth="1.5"
                      opacity={isSelected ? "0.8" : "0.4"}
                      className={isSelected ? "animate-pulse" : ""}
                    />

                    {/* Outer Glow Disc */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r="6"
                      fill={hub.color}
                      opacity={isSelected ? "1" : "0.7"}
                    />

                    {/* Central Core */}
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r="2.5"
                      fill="#050711"
                    />

                    {/* Label */}
                    <text
                      x={hub.x}
                      y={hub.y - 12}
                      textAnchor="middle"
                      fill={isSelected ? '#F3B44A' : '#EFEDE2'}
                      fontSize="11"
                      fontFamily="IBM Plex Mono, monospace"
                      fontWeight={isSelected ? '600' : '400'}
                    >
                      {hub.name}
                    </text>

                    {/* Subtag */}
                    <text
                      x={hub.x}
                      y={hub.y + 18}
                      textAnchor="middle"
                      fill={hub.color}
                      fontSize="9"
                      fontFamily="IBM Plex Mono, monospace"
                      opacity="0.9"
                    >
                      {hub.jobs}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hub Selector Pills on Mobile/Desktop */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3 border-t border-[var(--border)]">
            {HUBS.map(hub => (
              <button
                key={`btn-${hub.id}`}
                onClick={() => handleHubClick(hub)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  selectedHub.id === hub.id
                    ? 'bg-[var(--amber)] text-[#050711] font-bold shadow-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                {hub.name} ({hub.jobs})
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
