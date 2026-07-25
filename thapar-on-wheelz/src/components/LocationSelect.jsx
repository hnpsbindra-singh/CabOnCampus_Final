import { useState, useEffect, useRef } from 'react'
import { LOCATIONS, prettyLocation } from '../api/locations'
import { ChevronDown, X } from 'lucide-react'

export default function LocationSelect({ label, value, onChange, exclude }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Sync state if value changes externally (e.g. Map click)
  useEffect(() => {
    if (value) {
      setSearch(prettyLocation(value))
    } else {
      setSearch('')
    }
  }, [value])

  // Handle clicking outside the container to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        // Reset search field to current selected location name if closed without selecting
        setSearch(value ? prettyLocation(value) : '')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  const filtered = LOCATIONS.filter(loc => {
    if (loc === exclude) return false
    const pretty = prettyLocation(loc).toLowerCase()
    return pretty.includes(search.toLowerCase())
  })

  function handleSelect(loc) {
    onChange(loc)
    setSearch(prettyLocation(loc))
    setIsOpen(false)
  }

  function handleClear() {
    onChange('')
    setSearch('')
    setIsOpen(true)
  }

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search location..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          style={{ paddingRight: '2.5rem' }}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '0.85rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <div
            style={{
              position: 'absolute',
              right: '0.85rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <ChevronDown size={14} />
          </div>
        )}
      </div>

      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-card)',
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px',
            padding: '4px 0',
            listStyle: 'none',
            margin: '4px 0 0 0'
          }}
        >
          {filtered.length === 0 ? (
            <li style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              No matches found
            </li>
          ) : (
            filtered.map(loc => (
              <li
                key={loc}
                onClick={() => handleSelect(loc)}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  background: value === loc ? 'var(--bg-secondary)' : 'transparent',
                  fontWeight: value === loc ? 700 : 400,
                  transition: 'background 0.2s ease',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.02)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = value === loc ? 'var(--bg-secondary)' : 'transparent'}
              >
                {prettyLocation(loc)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
