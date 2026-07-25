import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import LocationSelect from '../components/LocationSelect'
import { prettyLocation } from '../api/locations'
import { MapPin, Zap, ChevronRight, User, Phone, Car, RefreshCw, Clock, Users, Copy, Check, Navigation } from 'lucide-react'
import { getAvatarSvg } from '../api/avatar'
import CampusMap from '../components/CampusMap'
import styles from './StudentDashboard.module.css'

const PRESET_HUB_LOCATIONS = [
  'MAIN_GATE',
  'COS_COMPLEX',
  'LIBRARY',
  'CSED',
  'AUDITORIUM',
  'HEALTH_CENTRE'
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [pickUp, setPickUp] = useState('')
  const [drop, setDrop] = useState('')
  const [rides, setRides] = useState([])
  const [loadingRides, setLoadingRides] = useState(false)
  const [loadingBook, setLoadingBook] = useState(false)
  const [activeTab, setActiveTab] = useState('book') // book, history, drivers, profile
  const [statusData, setStatusData] = useState({})
  
  // Rides filter state
  const [rideFilter, setRideFilter] = useState('all') // all, active, completed

  // Drivers list state
  const [drivers, setDrivers] = useState([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({ name: '', username: '', phoneNumber: '', rollNumber: '' })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [updatingProfile, setUpdatingProfile] = useState(false)

  async function bookRide() {
    if (!pickUp || !drop) return showToast('Select both pickup and dropoff locations', 'error')
    if (pickUp === drop) return showToast('Pickup and dropoff locations cannot be the same', 'error')
    setLoadingBook(true)
    try {
      await api.post('/student/create-New-Ride', {
        pickup: pickUp,
        drop: drop,
      })
      showToast('Ride booked successfully. Flat fare applied.', 'success')
      setPickUp('')
      setDrop('')
      setRideFilter('all')
      setActiveTab('history')
      loadRides()
    } catch (err) {
      showToast(err.response?.data || 'Booking failed', 'error')
    } finally {
      setLoadingBook(false)
    }
  }

  async function loadRides() {
    setLoadingRides(true)
    try {
      let endpoint = '/student/ride/history'
      if (rideFilter === 'active') {
        endpoint = '/student/ride/current'
      } else if (rideFilter === 'completed') {
        endpoint = '/student/ride/completed'
      }
      const res = await api.get(endpoint)
      setRides(res.data)
    } catch {
      showToast('Could not load rides', 'error')
    } finally {
      setLoadingRides(false)
    }
  }

  async function loadDrivers() {
    setLoadingDrivers(true)
    try {
      const res = await api.get('/student/drivers')
      setDrivers(res.data)
    } catch {
      showToast('Could not load drivers list', 'error')
    } finally {
      setLoadingDrivers(false)
    }
  }

  async function loadProfile() {
    setLoadingProfile(true)
    try {
      const res = await api.get('/student/me')
      setProfile(res.data)
    } catch {
      showToast('Could not load profile details', 'error')
    } finally {
      setLoadingProfile(false)
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault()
    if (!/^\d{10}$/.test(profile.phoneNumber)) {
      return showToast('Phone number must contain exactly 10 digits', 'error')
    }
    setUpdatingProfile(true)
    try {
      const res = await api.post('/student/me', {
        phoneNumber: profile.phoneNumber,
        rollNumber: profile.rollNumber
      })
      showToast(res.data || 'Profile updated successfully', 'success')
      loadProfile()
    } catch (err) {
      showToast(err.response?.data || 'Failed to update profile', 'error')
    } finally {
      setUpdatingProfile(false)
    }
  }

  async function checkStatus(id) {
    try {
      const res = await api.get(`/student/ride/${id}`)
      setStatusData(s => ({ ...s, [id]: res.data }))
    } catch {
      showToast('Status unavailable', 'error')
    }
  }

  async function cancelRide(id) {
    const previous = [...rides]
    setRides(curr => curr.map(r => r.rideId === id ? { ...r, status: 'CANCELLED' } : r))
    try {
      await api.patch(`/student/ride/cancel/${id}`)
      showToast('Ride cancelled successfully', 'success')
      loadRides()
    } catch (err) {
      setRides(previous)
      showToast(err.response?.data || 'Could not cancel ride', 'error')
    }
  }

  async function completeRide(id) {
    const previous = [...rides]
    setRides(curr => curr.map(r => r.rideId === id ? { ...r, status: 'COMPLETED' } : r))
    try {
      await api.patch(`/student/ride/complete/${id}`)
      showToast('Ride marked as completed successfully', 'success')
      loadRides()
    } catch (err) {
      setRides(previous)
      showToast(err.response?.data || 'Could not complete ride', 'error')
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      loadRides()
    } else if (activeTab === 'drivers') {
      loadDrivers()
    } else if (activeTab === 'profile') {
      loadProfile()
    }
  }, [activeTab, rideFilter])

  useEffect(() => {
    let intervalId
    const hasActiveRide = rides.some(r => r.status === 'ACCEPTED')
    
    if (activeTab === 'history' && hasActiveRide) {
      intervalId = setInterval(() => {
        loadRides()
      }, 5000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [activeTab, rides, rideFilter])

  function handleSelectPreset(loc) {
    if (!pickUp) {
      setPickUp(loc)
    } else if (!drop && pickUp !== loc) {
      setDrop(loc)
    } else {
      setPickUp(loc)
      if (drop === loc) setDrop('')
    }
  }

  return (
    <div className="page-container fade-up">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <span className="badge badge-gold" style={{ marginBottom: '6px' }}>Student Portal</span>
          <h1 className="page-title">Welcome, {user?.name || user?.username}</h1>
          <p className="page-subtitle">Thapar Campus e-Rickshaw Shuttle System • Flat fare of <strong style={{ color: 'var(--primary)' }}>₹10 per ride</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="stat-card" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <Zap size={16} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>FLAT RATE</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>INR 10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="page-body">
        {/* Navigation Tabs */}
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
            <Car size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Book Ride
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <Clock size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> My Rides
          </button>
          <button className={`tab-btn ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')}>
            <Users size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Drivers
          </button>
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Profile
          </button>
        </div>

        {/* TAB 1: BOOK A RIDE */}
        {activeTab === 'book' && (
          <div className={styles.bookGrid}>
            {/* Left Card: Booking Form */}
            <div className="card">
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Book Campus Ride</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select pickup and drop points on Thapar Campus</p>
              </div>

              {/* Quick Preset Hubs */}
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <Navigation size={12} color="var(--primary)" /> Quick Campus Hub Presets
                </label>
                <div className="preset-pills">
                  {PRESET_HUB_LOCATIONS.map(loc => (
                    <button
                      key={loc}
                      type="button"
                      className={`preset-pill ${pickUp === loc || drop === loc ? 'active' : ''}`}
                      onClick={() => handleSelectPreset(loc)}
                    >
                      <MapPin size={11} /> {prettyLocation(loc)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.routeWrap}>
                <div className={styles.routeDot} style={{ '--dot-color': 'var(--primary)' }} />
                <LocationSelect label="Pickup Location" value={pickUp} onChange={setPickUp} exclude={drop} />
                <div className={styles.routeLine} />
                <div />
                <div className={styles.routeDot} style={{ '--dot-color': 'var(--navy)' }} />
                <LocationSelect label="Dropoff Location" value={drop} onChange={setDrop} exclude={pickUp} />
              </div>

              <div className={styles.fareRow}>
                <div className={styles.fareBox}>
                  <Zap size={14} fill="var(--primary)" strokeWidth={0} />
                  <span>Fixed Rate</span>
                  <strong>INR 10</strong>
                </div>
                {pickUp && drop && (
                  <div className={styles.routeSummary}>
                    {prettyLocation(pickUp)} &rarr; {prettyLocation(drop)}
                  </div>
                )}
              </div>

              <button className="btn btn-primary btn-lg btn-full" onClick={bookRide} disabled={loadingBook} style={{ marginTop: '1.25rem' }}>
                {loadingBook ? <span className="loader" /> : <>Request Ride Now <ChevronRight size={18} /></>}
              </button>
            </div>

            {/* Right Card: Interactive Campus Map */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="var(--primary)" /> Campus Map
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click pin markers to select pickup/dropoff</p>
                </div>
                <span className="badge badge-navy">Thapar University</span>
              </div>
              <CampusMap pickup={pickUp} setPickup={setPickUp} drop={drop} setDrop={setDrop} />
            </div>
          </div>
        )}

        {/* TAB 2: RIDE HISTORY */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                {['all', 'active', 'completed'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setRideFilter(filter)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      background: rideFilter === filter ? 'var(--primary)' : 'transparent',
                      color: rideFilter === filter ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={loadRides}>
                <RefreshCw size={14} className={loadingRides ? styles.spinning : ''} /> Refresh
              </button>
            </div>

            <div className="ride-cards-grid">
              {loadingRides ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="ride-card" style={{ gap: '12px' }}>
                    <div className="skeleton" style={{ height: '20px', width: '40%' }} />
                    <div className="skeleton" style={{ height: '60px', width: '100%' }} />
                    <div className="skeleton" style={{ height: '36px', width: '100%' }} />
                  </div>
                ))
              ) : rides.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon"><MapPin size={24} color="var(--text-muted)" /></div>
                  <div className="empty-state-title">No rides found</div>
                  <p className="empty-state-desc">Rides matching the selected status filter will appear here.</p>
                </div>
              ) : (
                rides.map(ride => (
                  <div key={ride.rideId} className="ride-card">
                    <div className="ride-card-header">
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ID: #{ride.rideId.slice(0, 8)}</span>
                      <span className={`badge badge-${ride.status === 'PENDING' ? 'warning' : ride.status === 'ACCEPTED' ? 'info' : ride.status === 'COMPLETED' ? 'success' : 'danger'}`}>
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

                    {/* Progress Bar for Active & Completed Rides */}
                    <RideProgressStatus status={ride.status} />

                    <div className="ride-card-footer">
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '15px' }}>INR 10</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {ride.status === 'PENDING' && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelRide(ride.rideId)}>
                            Cancel Ride
                          </button>
                        )}
                        {ride.status === 'ACCEPTED' && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => checkStatus(ride.rideId)}>
                              Driver Info
                            </button>
                            <button className="btn btn-success btn-sm" onClick={() => completeRide(ride.rideId)}>
                              Complete
                            </button>
                          </>
                        )}
                        {ride.status === 'COMPLETED' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => checkStatus(ride.rideId)}>
                            Driver Details
                          </button>
                        )}
                      </div>
                    </div>
                    {statusData[ride.rideId] && <DriverCard data={statusData[ride.rideId]} />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED DRIVERS */}
        {activeTab === 'drivers' && (
          <div className="table-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 800 }}>Campus Shuttle Drivers</h2>
              <span className="badge badge-navy">{drivers.length} Drivers</span>
            </div>
            {loadingDrivers ? (
              <div style={{ padding: '16px' }}>
                <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '10px' }} />
                <div className="skeleton" style={{ height: '40px', width: '100%', marginBottom: '10px' }} />
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
              </div>
            ) : drivers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No drivers currently registered on the system.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Driver Name</th>
                    <th>Phone Number</th>
                    <th>Vehicle Number</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(drv => (
                    <tr key={drv.id}>
                      <td><strong>{drv.name}</strong></td>
                      <td>
                        <a href={`tel:${drv.phoneNumber}`} style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {drv.phoneNumber}
                        </a>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{drv.vehicleNumber}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <img 
                src={getAvatarSvg(profile.username || user?.username || '')} 
                alt="Profile Avatar"
                style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--primary)', padding: '3px' }}
              />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Student Profile</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Update contact information</p>
              </div>
            </div>
            {loadingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
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
                  <label className="form-label">Roll Number</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter roll number"
                    value={profile.rollNumber || ''}
                    onChange={e => setProfile({ ...profile, rollNumber: e.target.value })}
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

function RideProgressStatus({ status }) {
  const isPending = status === 'PENDING'
  const isAccepted = status === 'ACCEPTED'
  const isCompleted = status === 'COMPLETED'
  const isCancelled = status === 'CANCELLED'

  if (isCancelled) return null

  return (
    <div className="ride-progress-container">
      <div className="ride-progress-steps">
        <div className={`ride-progress-step ${isPending || isAccepted || isCompleted ? 'completed' : ''}`}>
          <div className="ride-progress-dot">1</div>
          <span>Requested</span>
        </div>
        <div className={`ride-progress-step ${isAccepted || isCompleted ? 'completed' : isPending ? '' : ''}`}>
          <div className="ride-progress-dot">2</div>
          <span>Accepted</span>
        </div>
        <div className={`ride-progress-step ${isCompleted ? 'completed' : ''}`}>
          <div className="ride-progress-dot">3</div>
          <span>Completed</span>
        </div>
      </div>
    </div>
  )
}

function DriverCard({ data }) {
  const [copied, setCopied] = useState(false)

  if (!data?.name) return <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '0.5rem', textAlign: 'center' }}>Waiting for driver assignment...</div>

  function copyVehicle() {
    if (data.vehicleNumber) {
      navigator.clipboard.writeText(data.vehicleNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ marginTop: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <User size={14} color="var(--primary)" /> <strong>Driver: {data.name}</strong>
        </div>
        <a href={`tel:${data.phoneNumber}`} className="btn btn-success btn-sm" style={{ padding: '3px 10px', fontSize: '11px' }}>
          <Phone size={12} /> Call Driver
        </a>
      </div>
      
      {data.vehicleNumber && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Car size={13} /> Vehicle: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{data.vehicleNumber}</span>
          </div>
          <button type="button" onClick={copyVehicle} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
            {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
