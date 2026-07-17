import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import LocationSelect from '../components/LocationSelect'
import { prettyLocation } from '../api/locations'
import { MapPin, Zap, ChevronRight, User, Phone, Car } from 'lucide-react'
import styles from './StudentDashboard.module.css'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [pickUp, setPickUp] = useState('')
  const [drop, setDrop] = useState('')
  const [rides, setRides] = useState([])
  const [loadingBook, setLoadingBook] = useState(false)
  const [activeTab, setActiveTab] = useState('book')
  const [statusData, setStatusData] = useState({})

  async function bookRide() {
    if (!pickUp || !drop) return showToast('Select both pickup & drop', 'error')
    if (pickUp === drop) return showToast('Pickup and drop cannot be same', 'error')
    setLoadingBook(true)
    try {
      await api.post('/student/create-New-Ride', {
        pickup: pickUp,
        drop: drop,
      })
      showToast('Ride booked! ₹10 flat fare. 🛺', 'success')
      setPickUp('')
      setDrop('')
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
      const res = await api.get('/student/ride/history')
      setRides(res.data)
    } catch {
      showToast('Could not load rides', 'error')
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
    try {
      await api.patch(`/student/ride/cancel/${id}`)
      showToast('Ride cancelled successfully', 'success')
      loadRides()
    } catch (err) {
      showToast(err.response?.data || 'Could not cancel ride', 'error')
    }
  }

  async function completeRide(id) {
    try {
      await api.patch(`/student/ride/complete/${id}`)
      showToast('Ride marked as completed!', 'success')
      loadRides()
    } catch (err) {
      showToast(err.response?.data || 'Could not complete ride', 'error')
    }
  }

  useEffect(() => {
    if (activeTab === 'history') loadRides()
  }, [activeTab])

  return (
    <div className="page-container fade-up">
      <div className="page-header">
        <div>
          <span className={styles.greet}>Hey {user?.name || user?.username} 👋</span>
          <h1 className="page-title">Where to?</h1>
          <p className="page-subtitle">Book your campus e-rickshaw · <strong style={{ color: 'var(--primary)' }}>₹10 flat</strong></p>
        </div>
        <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 10px rgba(140,6,35,0.15))' }}>🛺</div>
      </div>

      <div className="page-body">
        <div className={styles.tabs} style={{ maxWidth: 400, marginBottom: '2rem' }}>
          <button className={`${styles.tab} ${activeTab === 'book' ? styles.active : ''}`} onClick={() => setActiveTab('book')}>Book a Ride</button>
          <button className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`} onClick={() => setActiveTab('history')}>My Rides</button>
        </div>

        {activeTab === 'book' && (
          <div className="card" style={{ maxWidth: 540, margin: '0 auto', padding: '2rem' }}>
            <div className={styles.routeWrap}>
              <div className={styles.routeDot} style={{ background: 'var(--primary)' }} />
              <LocationSelect label="Pickup Location" value={pickUp} onChange={setPickUp} exclude={drop} />
              <div className={styles.routeLine} />
              <div />
              <div className={styles.routeDot} style={{ background: 'var(--accent)' }} />
              <LocationSelect label="Dropoff Location" value={drop} onChange={setDrop} exclude={pickUp} />
            </div>

            <div className={styles.fareRow} style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={styles.fareBox}>
                <Zap size={14} fill="var(--primary)" strokeWidth={0} />
                <span>Flat Fare</span>
                <strong>₹10</strong>
              </div>
              {pickUp && drop && (
                <div className={styles.routeSummary} style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {prettyLocation(pickUp)} → {prettyLocation(drop)}
                </div>
              )}
            </div>

            <button className="btn btn-primary btn-lg btn-full" onClick={bookRide} disabled={loadingBook} style={{ marginTop: '1.5rem' }}>
              {loadingBook ? <span className="loader" /> : <>Book Ride <ChevronRight size={18} /></>}
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="ride-cards-grid">
            {rides.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">📍</div>
                <div className="empty-state-title">No rides yet</div>
                <p className="empty-state-desc">Book your first campus ride to see it here!</p>
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
                    <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹10</span>
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
                    </div>
                  </div>
                  {statusData[ride.rideId] && <DriverCard data={statusData[ride.rideId]} />}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DriverCard({ data }) {
  if (!data?.name) return <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.8rem', textAlign: 'center' }}>Waiting for a driver…</div>
  return (
    <div style={{ marginTop: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <User size={14} color="var(--primary)" /> <strong>{data.name}</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <Phone size={14} /> {data.phoneNumber}
      </div>
      {data.vehicleNumber && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Car size={14} /> {data.vehicleNumber}
        </div>
      )}
    </div>
  )
}
