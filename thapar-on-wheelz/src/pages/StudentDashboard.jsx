import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import LocationSelect from '../components/LocationSelect'
import { prettyLocation } from '../api/locations'
import { MapPin, Zap, ChevronRight, User, Phone, Car } from 'lucide-react'
import { getAvatarSvg } from '../api/avatar'
import CampusMap from '../components/CampusMap'
import styles from './StudentDashboard.module.css'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [pickUp, setPickUp] = useState('')
  const [drop, setDrop] = useState('')
  const [rides, setRides] = useState([])
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

  // Polling for active rides
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

  return (
    <div className="page-container fade-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className={styles.greet}>Welcome, {user?.name || user?.username}</span>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            Where to? <Car size={26} style={{ color: 'var(--primary)', opacity: 0.85 }} />
          </h1>
          <p className="page-subtitle">Book your campus ride. Flat fare: <strong style={{ color: 'var(--primary)' }}>INR 10</strong></p>
        </div>
      </div>

      <div className="page-body">
        <div className={styles.tabs} style={{ maxWidth: 600, marginBottom: '2rem' }}>
          <button className={`${styles.tab} ${activeTab === 'book' ? styles.active : ''}`} onClick={() => setActiveTab('book')}>Book a Ride</button>
          <button className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`} onClick={() => setActiveTab('history')}>My Rides</button>
          <button className={`${styles.tab} ${activeTab === 'drivers' ? styles.active : ''}`} onClick={() => setActiveTab('drivers')}>Drivers</button>
          <button className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        </div>

        {activeTab === 'book' && (
          <div className="card" style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="var(--primary)" /> Campus Route Map</h2>
            <CampusMap pickup={pickUp} setPickup={setPickUp} drop={drop} setDrop={setDrop} />

            <div className={styles.routeWrap} style={{ marginTop: '1rem' }}>
              <div className={styles.routeDot} style={{ '--dot-color': 'var(--primary)' }} />
              <LocationSelect label="Pickup Location" value={pickUp} onChange={setPickUp} exclude={drop} />
              <div className={styles.routeLine} />
              <div />
              <div className={styles.routeDot} style={{ '--dot-color': 'var(--accent)' }} />
              <LocationSelect label="Dropoff Location" value={drop} onChange={setDrop} exclude={pickUp} />
            </div>

            <div className={styles.fareRow} style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={styles.fareBox}>
                <Zap size={14} fill="var(--primary)" strokeWidth={0} />
                <span>Flat Fare</span>
                <strong>INR 10</strong>
              </div>
              {pickUp && drop && (
                <div className={styles.routeSummary} style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {prettyLocation(pickUp)} &rarr; {prettyLocation(drop)}
                </div>
              )}
            </div>

            <button className="btn btn-primary btn-lg btn-full" onClick={bookRide} disabled={loadingBook} style={{ marginTop: '1.5rem' }}>
              {loadingBook ? <span className="loader" /> : <>Book Ride <ChevronRight size={18} /></>}
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: 'var(--radius-sm)', maxWidth: '300px' }}>
              {['all', 'active', 'completed'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setRideFilter(filter)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.8rem',
                    borderRadius: 'calc(var(--radius-sm) - 4px)',
                    background: rideFilter === filter ? 'var(--primary)' : 'transparent',
                    color: rideFilter === filter ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
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

            <div className="ride-cards-grid">
              {rides.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon"><MapPin size={24} color="var(--text-muted)" /></div>
                  <div className="empty-state-title">No rides found</div>
                  <p className="empty-state-desc">Rides matching the selected status will appear here.</p>
                </div>
              ) : (
                rides.map(ride => (
                  <div key={ride.rideId} className="ride-card animate-scale">
                    <div className="ride-card-header">
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ride #{ride.rideId.slice(0, 8)}</span>
                      <span className={`badge badge-${ride.status === 'PENDING' ? 'warning' : ride.status === 'ACCEPTED' ? 'info' : ride.status === 'COMPLETED' ? 'success' : 'danger'}`}>
                        {ride.status}
                      </span>
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

                    <div className="ride-card-footer">
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>INR 10</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {ride.status === 'PENDING' && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelRide(ride.rideId)}>
                            Cancel
                          </button>
                        )}
                        {ride.status === 'ACCEPTED' && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => checkStatus(ride.rideId)}>
                              Driver Details
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

        {activeTab === 'drivers' && (
          <div className="table-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Registered Drivers</h2>
              <span className="badge badge-primary">{drivers.length} drivers</span>
            </div>
            {loadingDrivers ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading drivers...</div>
            ) : drivers.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No drivers registered on the system.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Vehicle Number</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(drv => (
                    <tr key={drv.id}>
                      <td><strong>{drv.name}</strong></td>
                      <td>{drv.phoneNumber}</td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{drv.vehicleNumber}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: 540, margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <img 
                src={getAvatarSvg(profile.username || user?.username || '')} 
                alt="Profile Avatar"
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2.5px solid var(--primary)', padding: '4px' }}
              />
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>My Profile</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Manage your campus details</p>
              </div>
            </div>
            {loadingProfile ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Loading profile...</div>
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
                  {updatingProfile ? <span className="loader" /> : 'Update Profile'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DriverCard({ data }) {
  if (!data?.name) return <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.8rem', textAlign: 'center' }}>Waiting for a driver to accept...</div>
  return (
    <div style={{ marginTop: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <User size={14} color="var(--primary)" /> <strong>{data.name}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <Phone size={14} /> <a href={`tel:${data.phoneNumber}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{data.phoneNumber}</a>
      </div>
      {data.vehicleNumber && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Car size={14} /> {data.vehicleNumber}
        </div>
      )}
    </div>
  )
}
