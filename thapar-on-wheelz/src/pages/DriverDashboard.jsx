import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { prettyLocation } from '../api/locations'
import { MapPin, ChevronRight, CheckCircle, Clock, User, Phone, DollarSign, Car, RefreshCw, Zap } from 'lucide-react'
import { getAvatarSvg } from '../api/avatar'
import styles from './DriverDashboard.module.css'

export default function DriverDashboard() {
  const { user } = useAuth()
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('pending') // pending, history, profile
  const [accepting, setAccepting] = useState(null)
  const [loading, setLoading] = useState(false)

  // Profile states
  const [profile, setProfile] = useState({ name: '', username: '', phoneNumber: '', vehicleNumber: '' })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [statusData, setStatusData] = useState({})

  async function checkStatus(id) {
    try {
      const res = await api.get(`/driver/ride/${id}`)
      setStatusData(s => ({ ...s, [id]: res.data }))
    } catch {
      showToast('Status unavailable', 'error')
    }
  }

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

  async function loadProfile() {
    setLoadingProfile(true)
    try {
      const res = await api.get('/driver/me')
      setProfile(res.data)
    } catch {
      showToast('Could not load profile details', 'error')
    } finally {
      setLoadingProfile(false)
    }
  }

  async function loadAllData() {
    setLoading(true)
    await Promise.all([loadPending(), loadHistory()])
    setLoading(false)
  }

  async function acceptRide(id) {
    setAccepting(id)
    const acceptedRide = pending.find(r => r.rideId === id)
    if (!acceptedRide) return
    const prevPending = [...pending]
    const prevHistory = [...history]

    setPending(p => p.filter(r => r.rideId !== id))
    setHistory(h => [{ ...acceptedRide, status: 'ACCEPTED' }, ...h])

    try {
      await api.patch(`/driver/ride/${id}/accept`)
      showToast('Ride accepted successfully.', 'success')
      loadHistory()
    } catch (err) {
      setPending(prevPending)
      setHistory(prevHistory)
      showToast(err.response?.data || 'Could not accept', 'error')
    } finally {
      setAccepting(null)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    if (!/^\d{10}$/.test(profile.phoneNumber)) {
      return showToast('Phone number must contain exactly 10 digits', 'error')
    }
    setUpdatingProfile(true)
    try {
      const res = await api.patch('/driver/me', {
        phoneNumber: profile.phoneNumber,
        vehicleNumber: profile.vehicleNumber
      })
      showToast(res.data || 'Profile updated successfully', 'success')
      loadProfile()
    } catch (err) {
      showToast(err.response?.data || 'Failed to update profile', 'error')
    } finally {
      setUpdatingProfile(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPending()
    } else if (activeTab === 'history') {
      loadHistory()
    } else if (activeTab === 'profile') {
      loadProfile()
    }
  }, [activeTab])

  useEffect(() => {
    let intervalId
    if (activeTab === 'pending') {
      intervalId = setInterval(() => {
        loadPending()
      }, 6000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [activeTab])

  useEffect(() => {
    loadAllData()
  }, [])

  return (
    <div className="page-container fade-up">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <span className="badge badge-navy" style={{ marginBottom: '6px' }}>Driver Console</span>
          <h1 className="page-title">{user?.name || user?.username}</h1>
          <p className="page-subtitle">Thapar Campus e-Rickshaw Duty Operations</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadAllData} disabled={loading}>
          <RefreshCw size={14} className={loading ? styles.spinning : ''} />
          Refresh Requests
        </button>
      </div>

      <div className="page-body">
        {/* Driver Stats */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon primary"><Clock size={18} /></div>
            <div>
              <div className="stat-value">{pending.length}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle size={18} /></div>
            <div>
              <div className="stat-value">{history.filter(r => r.status === 'COMPLETED').length}</div>
              <div className="stat-label">Completed Rides</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon gold"><DollarSign size={18} /></div>
            <div>
              <div className="stat-value">INR {history.filter(r => r.status === 'COMPLETED').length * 10}</div>
              <div className="stat-label">Total Earnings (₹10/ride)</div>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            <Zap size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Requests {pending.length > 0 && `(${pending.length})`}
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Ride History
          </button>
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Vehicle & Profile
          </button>
        </div>

        {/* TAB 1: PENDING RIDES */}
        {activeTab === 'pending' && (
          <div className="ride-cards-grid">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="ride-card" style={{ gap: '12px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '35%' }} />
                  <div className="skeleton" style={{ height: '54px', width: '100%' }} />
                  <div className="skeleton" style={{ height: '36px', width: '100%' }} />
                </div>
              ))
            ) : pending.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon"><Clock size={24} color="var(--text-muted)" /></div>
                <div className="empty-state-title">No pending requests right now</div>
                <p className="empty-state-desc">Rides requested by campus students will appear here automatically.</p>
                <button className="btn btn-outline btn-sm" onClick={loadPending} style={{ marginTop: '0.5rem' }}>
                  Check For Rides
                </button>
              </div>
            ) : (
              pending.map(ride => (
                <div key={ride.rideId} className="ride-card">
                  <div className="ride-card-header">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Ride #{ride.rideId?.slice(0, 8)}</span>
                    <span className="badge badge-warning">PENDING</span>
                  </div>

                  <div className="ride-route">
                    <div className="route-point">
                      <div className="route-dot pickup" />
                      <div>
                        <div className="route-label">PICKUP</div>
                        <div className="route-value">{prettyLocation(ride.pickup)}</div>
                      </div>
                    </div>
                    <div className="route-point" style={{ marginTop: '4px' }}>
                      <div className="route-dot drop" />
                      <div>
                        <div className="route-label">DROP</div>
                        <div className="route-value">{prettyLocation(ride.drop)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Card Details */}
                  {(ride.name || ride.phoneNumber) && (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {ride.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} color="var(--primary)" />
                          <span>Passenger: <strong>{ride.name}</strong></span>
                        </div>
                      )}
                      {ride.phoneNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={13} /> Phone: <strong>{ride.phoneNumber}</strong>
                          </span>
                          <a href={`tel:${ride.phoneNumber}`} className="btn btn-success btn-sm" style={{ padding: '2px 8px', fontSize: '11px' }}>
                            <Phone size={10} /> Call
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '15px' }}>INR 10</span>
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

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="ride-cards-grid">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="ride-card" style={{ gap: '12px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '35%' }} />
                  <div className="skeleton" style={{ height: '54px', width: '100%' }} />
                  <div className="skeleton" style={{ height: '36px', width: '100%' }} />
                </div>
              ))
            ) : history.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon"><Car size={24} color="var(--text-muted)" /></div>
                <div className="empty-state-title">No completed rides yet</div>
                <p className="empty-state-desc">Rides you accept and complete will be listed here.</p>
              </div>
            ) : (
              history.map(ride => (
                <div key={ride.rideId} className="ride-card">
                  <div className="ride-card-header">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Ride #{ride.rideId?.slice(0, 8)}</span>
                    <span className={`badge badge-${ride.status === 'ACCEPTED' ? 'info' : ride.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                      {ride.status}
                    </span>
                  </div>

                  <div className="ride-route">
                    <div className="route-point">
                      <div className="route-dot pickup" />
                      <div>
                        <div className="route-label">PICKUP</div>
                        <div className="route-value">{prettyLocation(ride.pickup)}</div>
                      </div>
                    </div>
                    <div className="route-point" style={{ marginTop: '4px' }}>
                      <div className="route-dot drop" />
                      <div>
                        <div className="route-label">DROP</div>
                        <div className="route-value">{prettyLocation(ride.drop)}</div>
                      </div>
                    </div>
                  </div>

                  {ride.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <User size={13} color="var(--primary)" />
                      <span>Passenger: <strong>{ride.name}</strong></span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '0.4rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px' }}>INR 10</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => checkStatus(ride.rideId)}>
                      Passenger Info
                    </button>
                  </div>
                  {statusData[ride.rideId] && <PassengerCard data={statusData[ride.rideId]} />}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <img 
                src={getAvatarSvg(profile.username || user?.username || '')} 
                alt="Profile Avatar"
                style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--primary)', padding: '3px' }}
              />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Driver Profile</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Manage vehicle details</p>
              </div>
            </div>
            {loadingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profile.name || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email / Username</label>
                  <input className="form-input" value={profile.username || ''} disabled style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number (10 digits)</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter 10 digit phone number"
                    value={profile.phoneNumber || ''}
                    onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Registration Number</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. PB 11 AB 1234"
                    value={profile.vehicleNumber || ''}
                    onChange={e => setProfile({ ...profile, vehicleNumber: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={updatingProfile} style={{ marginTop: '0.5rem' }}>
                  {updatingProfile ? <span className="loader" /> : 'Save Profile Changes'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PassengerCard({ data }) {
  if (!data?.name) return <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '0.5rem', textAlign: 'center' }}>Loading passenger details...</div>
  return (
    <div style={{ marginTop: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <User size={14} color="var(--primary)" /> <strong>Passenger: {data.name}</strong>
        </div>
        {data.phoneNumber && (
          <a href={`tel:${data.phoneNumber}`} className="btn btn-success btn-sm" style={{ padding: '3px 10px', fontSize: '11px' }}>
            <Phone size={12} /> Call
          </a>
        )}
      </div>
    </div>
  )
}
