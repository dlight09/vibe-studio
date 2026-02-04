'use client'

interface FilterBarProps {
  filters: {
    category: string
    intensity: number
    instructorId: string
  }
  onFiltersChange: (filters: typeof initialFilters) => void
  viewMode: 'week' | 'month'
  onViewModeChange: (mode: 'week' | 'month') => void
  instructors: Array<{ id: string; name: string }>
}

const initialFilters = {
  category: '',
  intensity: 0,
  instructorId: '',
}

const categories = ['Yoga', 'Pilates', 'Barre', 'Strength', 'Core']
const intensities = [
  { value: 1, label: 'Very Light' },
  { value: 2, label: 'Light' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'Intense' },
  { value: 5, label: 'Very Intense' },
]

export default function FilterBar({ filters, onFiltersChange, viewMode, onViewModeChange, instructors }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
          className="input filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Intensity</label>
        <select
          value={filters.intensity}
          onChange={(e) => onFiltersChange({ ...filters, intensity: parseInt(e.target.value) })}
          className="input filter-select"
        >
          <option value={0}>All Intensities</option>
          {intensities.map((int) => (
            <option key={int.value} value={int.value}>{int.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Instructor</label>
        <select
          value={filters.instructorId}
          onChange={(e) => onFiltersChange({ ...filters, instructorId: e.target.value })}
          className="input filter-select"
        >
          <option value="">All Instructors</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
      </div>

      <div className="view-toggle">
        <button
          onClick={() => onViewModeChange('week')}
          className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
        >
          Week
        </button>
        <button
          onClick={() => onViewModeChange('month')}
          className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
        >
          Month
        </button>
      </div>

      <style jsx>{`
        .filter-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: flex-end;
        }
        .filter-group {
          flex: 1;
          min-width: 140px;
        }
        .filter-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgb(var(--muted-foreground));
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .filter-select {
          padding: 10px 12px;
          font-size: 14px;
        }
        .view-toggle {
          display: flex;
          border: 1px solid rgb(var(--border));
          border-radius: 8px;
          overflow: hidden;
        }
        .toggle-btn {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          background: rgb(var(--card));
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          background: rgb(var(--muted));
        }
        .toggle-btn.active {
          background: rgb(var(--foreground));
          color: rgb(var(--background));
        }
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
          }
          .filter-group {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
