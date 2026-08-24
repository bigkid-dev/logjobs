'use client'

const STACKS = ['React', 'React Native', 'Next.js', 'Django', 'Node.js', 'Python', 'TypeScript', 'Vue', 'Flutter', 'Go']
const REGIONS = ['Nigeria', 'Africa', 'Remote', 'Europe', 'America']
const TYPES = ['Full Time', 'Contract', 'Remote', 'Freelance']

export default function FilterBar({ filters, onChange }) {
  const toggle = (key, value) => {
    if (key === 'stacks') {
      const current = filters.stacks || []
      onChange({
        ...filters,
        stacks: current.includes(value)
          ? current.filter(s => s !== value)
          : [...current, value],
      })
    } else {
      onChange({ ...filters, [key]: filters[key] === value ? '' : value })
    }
  }

  const Pill = ({ label, active, onClick, color }) => (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: active ? '600' : '400',
        border: `1px solid ${active ? (color || '#00C853') : '#21262D'}`,
        background: active ? `${color || '#00C853'}18` : 'transparent',
        color: active ? (color || '#00C853') : '#8B949E',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )

  const regionColors = {
    'Nigeria': '#00C853',
    'Africa': '#FF9800',
    'Remote': '#7C3AED',
    'Europe': '#2196F3',
    'America': '#F44336',
  }

  return (
    <div style={{
      background: '#0D1117',
      border: '1px solid #21262D',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
    }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search jobs, companies..."
        value={filters.search || ''}
        onChange={e => onChange({ ...filters, search: e.target.value })}
        style={{
          width: '100%',
          background: '#161B22',
          border: '1px solid #21262D',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#E6EDF3',
          fontSize: '14px',
          marginBottom: '20px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = '#00C853'}
        onBlur={e => e.target.style.borderColor = '#21262D'}
      />

      {/* Tech Stack */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#484F58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Tech Stack
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {STACKS.map(s => (
            <Pill
              key={s}
              label={s}
              active={(filters.stacks || []).includes(s)}
              onClick={() => toggle('stacks', s)}
            />
          ))}
        </div>
      </div>

      {/* Region */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: '#484F58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Region
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {REGIONS.map(r => (
            <Pill
              key={r}
              label={r}
              active={filters.region === r}
              color={regionColors[r]}
              onClick={() => toggle('region', r)}
            />
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <div style={{ fontSize: '11px', color: '#484F58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Job Type
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {TYPES.map(t => (
            <Pill
              key={t}
              label={t}
              active={filters.type === t}
              onClick={() => toggle('type', t)}
            />
          ))}
        </div>
      </div>

      {/* Clear */}
      {(filters.stacks?.length || filters.region || filters.type || filters.search) ? (
        <button
          onClick={() => onChange({ stacks: [], region: '', type: '', search: '' })}
          style={{
            marginTop: '16px',
            fontSize: '12px',
            color: '#F44336',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          ✕ Clear all filters
        </button>
      ) : null}
    </div>
  )
}
