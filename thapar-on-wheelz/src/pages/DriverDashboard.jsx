import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { prettyLocation } from '../api/locations'
import { MapPin, ChevronRight, CheckCircle, Clock, User, Phone, DollarSign } from 'lucide-react'
import styles from './DriverDashboard.module.css'

export default function DriverDashboard() {
  const { user } = useAuth()
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [accepting, setAccepting] = useState(null)
  const [loading, setLoading] = useState(false)

  async function loadPending() {
    try {
      const res = await api.get('/driver/rides/pending')
      setPending(res.data)
    } catch {
      showToast('Could not load rides', 'error')
    }
  }

  async function loadHistory() {
    try {
      const res = await api.get('/driver/ride/history')
      setHistory(res.data)
    } catch {
      showToast('Could not load history', 'error')
    }
  }

  async function loadAllData() {
    setLoading(true)
    await Promise.all([loadPending(), loadHistory()])
    setLoading(false)
  }

  async function acceptRide(id) {
    setAccepting(id)
    try {
      await api.patch(`/driver/ride/${id}/accept`)
      showToast('Ride accepted! 🛺', 'success')
      setPending(p => p.filter(r => r.rideId !== id))
      loadHistory()
    } catch (err) {
      showToast(err.response?.data || 'Could not accept', 'error')
    } finally {
      setAccepting(null)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  return (
    <div className="page-container fade-up">
      <div className="page-header">
        <div>
          <span className={styles.greet}>Driver Dashboard</span>
          <h1 className="page-title">{user?.name || user?.username}</h1>
          <p className="page-subtitle">Accept rides & earn ₹10 per trip</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={loadAllData} disabled={loading}>
            <Clock size={14} className={loading ? styles.spinning : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Live Driver Stats Bar */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon purple"><Clock size={20} /></div>
            <div>
              <div className="stat-value">{pending.length}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle size={20} /></div>
            <div>
              <div className="stat-value">{history.length}</div>
              <div className="stat-label">Completed Rides</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><span style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹</span></div>
            <div>
              <div className="stat-value">₹{history.length * 10}</div>
              <div className="stat-label">Total Earnings</div>
            </div>
          </div>
        </div>

        <div className={styles.tabs} style={{ maxWidth: 400, marginBottom: '2rem' }}>
          <button className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`} onClick={() => setActiveTab('pending')}>
            Pending Rides
            {pending.length > 0 && <span className={styles.badge}>{pending.length}</span>}
          </button>
          <button className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`} onClick={() => setActiveTab('history')}>
            History
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="ride-cards-grid">
            {pending.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <Clock size={32} color="var(--text-muted)" />
                <div className="empty-state-title" style={{ marginTop: '0.5rem' }}>No pending requests right now</div>
                <p className="empty-state-desc">Rides booked by campus students will appear here in real-time.</p>
                <button className="btn btn-outline" onClick={loadPending} style={{ marginTop: '0.5rem' }}>Refresh Feed</button>
              </div>
            ) : (
              pending.map(ride => (
                <div key={ride.rideId} className="ride-card animate-scale">
                  <div className="ride-card-header">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ride #{ride.rideId?.slice(0, 8)}</span>
                    <span className="badge badge-warning">Pending</span>
                  </div>

                  <div className="ride-route" style={{ margin: '1rem 0' }}>
                    <div className="route-point">
                      <div className="route-dot pickup" />
                      <div>
                        <div className="route-label">PICKUP</div>
                        <div className="route-value">{prettyLocation(ride.pickup)}</div>
                      </div>
                    </div>
                    <div style={{ borderLeft: '1.5px dashed var(--border)', height: '16px', marginLeft: '4px' }} />
                    <div className="route-point">
                      <div className="route-dot drop" />
                      <div>
                        <div className="route-label">DROP</div>
                        <div className="route-value">{prettyLocation(ride.drop)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Card Details */}
                  {(ride.name || ride.phoneNumber) && (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {ride.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={13} color="var(--primary)" />
                          <span>Passenger: <strong>{ride.name}</strong></span>
                        </div>
                      )}
                      {ride.phoneNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={13} />
                          <span>Phone: <a href={`tel:${ride.phoneNumber}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{ride.phoneNumber}</a></span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹10</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => acceptRide(ride.rideId)}
                      disabled={accepting === ride.rideId}
                    >
                      {accepting === ride.rideId
                        ? <span className="loader" />
                        : <><CheckCircle size={14} /> Accept Ride</>
                      }
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="ride-cards-grid">
            {history.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">🛺</div>
                <div className="empty-state-title">No completed rides yet</div>
                <p className="empty-state-desc">Rides you accept and complete will be listed here.</p>
              </div>
            ) : (
              history.map(ride => (
                <div key={ride.rideId} className="ride-card animate-scale" style={{ opacity: 0.85 }}>
                  <div className="ride-card-header">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ride #{ride.rideId?.slice(0, 8)}</span>
                    <span className="badge badge-success">Completed</span>
                  </div>

                  <div className="ride-route" style={{ margin: '1rem 0' }}>
                    <div className="route-point">
                      <div className="route-dot pickup" style={{ background: 'var(--text-muted)', boxShadow: 'none' }} />
                      <div>
                        <div className="route-label">PICKUP</div>
                        <div className="route-value">{prettyLocation(ride.pickup)}</div>
                      </div>
                    </div>
                    <div style={{ borderLeft: '1.5px dashed var(--border)', height: '16px', marginLeft: '4px' }} />
                    <div className="route-point">
                      <div className="route-dot drop" style={{ background: 'var(--text-muted)', boxShadow: 'none' }} />
                      <div>
                        <div className="route-label">DROP</div>
                        <div className="route-value">{prettyLocation(ride.drop)}</div>
                      </div>
                    </div>
                  </div>

                  {ride.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <User size={13} />
                      <span>Passenger: <strong>{ride.name}</strong></span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '1rem' }}>₹10 ✓</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
