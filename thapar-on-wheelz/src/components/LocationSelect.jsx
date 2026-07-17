import { LOCATIONS, prettyLocation } from '../api/locations'

export default function LocationSelect({ label, value, onChange, exclude }) {
  const filtered = LOCATIONS.filter(l => l !== exclude)
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select
        className="form-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888880' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center'
        }}
      >
        <option value="">— Select location —</option>
        {filtered.map(loc => (
          <option key={loc} value={loc}>{prettyLocation(loc)}</option>
        ))}
      </select>
    </div>
  )
}
