'use client'

export default function JobCard({ job }) {
  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return '1d ago'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  const stackColors = {
    'React': '#61DAFB',
    'React Native': '#61DAFB',
    'Next.js': '#ffffff',
    'Django': '#44B78B',
    'Node.js': '#68A063',
    'Python': '#FFD43B',
    'TypeScript': '#3178C6',
    'Vue': '#4FC08D',
    'Flutter': '#54C5F8',
    'Go': '#00ACD7',
    'PHP': '#8892BF',
    'Ruby': '#CC342D',
  }

  const regionColors = {
    'Nigeria': '#00C853',
    'Africa': '#FF9800',
    'Remote': '#7C3AED',
    'Europe': '#2196F3',
    'America': '#F44336',
  }

  const initials = job.is_anonymous
    ? '🔒'
    : job.company
    ? job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="job-card"
      style={{
        display: 'block',
        background: '#0D1117',
        border: '1px solid #21262D',
        borderRadius: '12px',
        padding: '20px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#00C853'
        e.currentTarget.style.background = '#111820'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#21262D'
        e.currentTarget.style.background = '#0D1117'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
        {/* Logo */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: job.logo ? '#fff' : '#161B22',
          border: '1px solid #21262D',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {job.logo ? (
            <img src={job.logo} alt={job.company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#8B949E', fontFamily: 'monospace' }}>
              {initials}
            </span>
          )}
        </div>

        {/* Title + Company */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#E6EDF3', marginBottom: '3px', lineHeight: 1.3 }}>
            {job.title}
          </div>
          <div style={{ fontSize: '13px', color: '#8B949E' }}>{job.company}</div>
        </div>

        {/* Time */}
        <div style={{ fontSize: '11px', color: '#484F58', flexShrink: 0 }}>
          {timeAgo(job.postedAt)}
        </div>
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {/* Region */}
        {job.region && (
          <span style={{
            fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
            background: `${regionColors[job.region] || '#444'}22`,
            color: regionColors[job.region] || '#aaa',
            border: `1px solid ${regionColors[job.region] || '#444'}44`,
            fontWeight: '600',
          }}>
            {job.region}
          </span>
        )}

        {/* Type */}
        <span style={{
          fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
          background: '#161B22', color: '#8B949E',
          border: '1px solid #21262D',
        }}>
          {job.type}
        </span>

        {/* Salary */}
        {job.salary && (
          <span style={{
            fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
            background: '#00C85315', color: '#00C853',
            border: '1px solid #00C85330',
          }}>
            {job.salary}
          </span>
        )}
      </div>

      {/* Stack tags */}
      {job.stacks?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
          {[...new Set(job.stacks)]
            .filter(stack => stack && !stack.toLowerCase().includes('confidential'))
            .slice(0, 6)
            .map(stack => (
            <span key={stack} style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '4px',
              background: `${stackColors[stack] || '#8B949E'}18`,
              color: stackColors[stack] || '#8B949E',
              border: `1px solid ${stackColors[stack] || '#8B949E'}30`,
              fontFamily: 'monospace',
            }}>
              {stack}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '11px', color: '#484F58',
          background: '#161B22', padding: '2px 8px', borderRadius: '4px',
        }}>
          via {job.source}
        </span>
        <span style={{ fontSize: '12px', color: '#00C853', fontWeight: '600' }}>
          Apply →
        </span>
      </div>
    </a>
  )
}
