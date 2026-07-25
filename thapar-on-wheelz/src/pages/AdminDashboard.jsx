import { useState, useEffect } from 'react'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Users, Truck, RefreshCw, UserPlus, ShieldAlert, Phone } from 'lucide-react'
import { getAvatarSvg } from '../api/avatar'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('STUDENT') // STUDENT, DRIVER, ADMIN
  const [usersList, setUsersList] = useState([])
  const [stats, setStats] = useState({ STUDENT: 0, DRIVER: 0, ADMIN: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    username: '',
    phoneNumber: '',
    password: '',
    role: 'STUDENT',
    rollNumber: '',
    vehicleNumber: ''
  })
  const [submitting, setSubmitting] = useState(false)

  async function loadStats() {
    try {
      const [studentRes, driverRes, adminRes] = await Promise.all([
        api.get('/admin/user?role=STUDENT&size=1'),
        api.get('/admin/user?role=DRIVER&size=1'),
        api.get('/admin/user?role=ADMIN&size=1')
      ])
      setStats({
        STUDENT: studentRes.data.totalElements || 0,
        DRIVER: driverRes.data.totalElements || 0,
        ADMIN: adminRes.data.totalElements || 0
      })
    } catch (err) {
      console.error('Failed to load user counts', err)
    }
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await api.get(`/admin/user?role=${activeTab}&page=${page}&size=10`)
      setUsersList(res.data.content || [])
      setTotalPages(res.data.totalPages || 0)
    } catch (err) {
      showToast('Failed to load user list', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSuspend(userId) {
    try {
      await api.patch(`/admin/user/${userId}/suspend`)
      showToast('User suspended successfully', 'success')
      loadUsers()
    } catch (err) {
      showToast(err.response?.data || 'Failed to suspend user', 'error')
    }
  }

  async function handleUnsuspend(userId) {
    try {
      await api.patch(`/admin/user/${userId}/unsuspend`)
      showToast('User unsuspended successfully', 'success')
      loadUsers()
    } catch (err) {
      showToast(err.response?.data || 'Failed to unsuspend user', 'error')
    }
  }

  async function handleAddUser(e) {
    e.preventDefault()

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      return showToast('Phone number must be exactly 10 digits', 'error')
    }
    if (form.password.length < 8 || form.password.length > 15) {
      return showToast('Password must be between 8 and 15 characters', 'error')
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        username: form.username,
        phoneNumber: form.phoneNumber,
        password: form.password,
        role: form.role,
        rollNumber: form.role === 'STUDENT' ? form.rollNumber : null,
        vehicleNumber: form.role === 'DRIVER' ? form.vehicleNumber : null
      }

      await api.post('/admin/user', payload)
      showToast('User added successfully!', 'success')
      setShowAddModal(false)
      setForm({
        name: '',
        username: '',
        phoneNumber: '',
        password: '',
        role: 'STUDENT',
        rollNumber: '',
        vehicleNumber: ''
      })
      loadStats()
      loadUsers()
    } catch (err) {
      showToast(err.response?.data || 'Failed to add user', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    setPage(0)
    loadUsers()
  }, [activeTab])

  useEffect(() => {
    loadUsers()
  }, [page])

  return (
    <div className="page-container fade-up">
      <div className="page-header">
        <div>
          <span className="badge badge-navy" style={{ marginBottom: '6px' }}>System Console</span>
          <h1 className="page-title">Admin Management Portal</h1>
          <p className="page-subtitle">ThaparOnWheelz System Users & Access Controls</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { loadStats(); loadUsers(); }} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} />
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <UserPlus size={14} /> Add User
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Metric Cards */}
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon primary"><Users size={18} /></div>
            <div>
              <div className="stat-value">{stats.STUDENT}</div>
              <div className="stat-label">Registered Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon navy"><Truck size={18} /></div>
            <div>
              <div className="stat-value">{stats.DRIVER}</div>
              <div className="stat-label">Active Shuttle Drivers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><ShieldAlert size={18} /></div>
            <div>
              <div className="stat-value">{stats.ADMIN}</div>
              <div className="stat-label">System Administrators</div>
            </div>
          </div>
        </div>

        {/* Tab Control */}
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'STUDENT' ? 'active' : ''}`} onClick={() => setActiveTab('STUDENT')}>
            <Users size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Students ({stats.STUDENT})
          </button>
          <button className={`tab-btn ${activeTab === 'DRIVER' ? 'active' : ''}`} onClick={() => setActiveTab('DRIVER')}>
            <Truck size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Drivers ({stats.DRIVER})
          </button>
          <button className={`tab-btn ${activeTab === 'ADMIN' ? 'active' : ''}`} onClick={() => setActiveTab('ADMIN')}>
            <ShieldAlert size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Admins ({stats.ADMIN})
          </button>
        </div>

        <div className="table-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800 }}>Registered {activeTab} accounts</h2>
            <span className="badge badge-navy">{usersList.length} shown</span>
          </div>

          {loading ? (
            <div style={{ padding: '16px' }}>
              <div className="skeleton" style={{ height: '36px', width: '100%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '36px', width: '100%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '36px', width: '100%' }} />
            </div>
          ) : usersList.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No {activeTab.toLowerCase()}s found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email / Username</th>
                  <th>Phone Number</th>
                  {activeTab === 'STUDENT' && <th>Roll Number</th>}
                  {activeTab === 'DRIVER' && <th>Vehicle Number</th>}
                  <th>Account Controls</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(userItem => (
                  <tr key={userItem.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={getAvatarSvg(userItem.username)} 
                          alt="Avatar" 
                          style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                        />
                        <strong>{userItem.name}</strong>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary)' }}>{userItem.username}</td>
                    <td>
                      <a href={`tel:${userItem.phoneNumber}`} style={{ color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} color="var(--primary)" /> {userItem.phoneNumber}
                      </a>
                    </td>
                    {activeTab === 'STUDENT' && <td>{userItem.rollNumber || 'N/A'}</td>}
                    {activeTab === 'DRIVER' && <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{userItem.vehicleNumber || 'N/A'}</span></td>}
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(userItem.id)}>
                          Suspend
                        </button>
                        <button className="btn btn-success btn-sm" onClick={() => handleUnsuspend(userItem.id)}>
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="btn btn-ghost btn-sm"
            >
              &larr; Previous
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
              className="btn btn-ghost btn-sm"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>Add New User Account</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Create a Student, Driver, or Admin account</p>
            </div>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">System Role</label>
                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="STUDENT">Student</option>
                  <option value="DRIVER">Driver</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input"
                  placeholder="Full Name" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email / Username</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Username or Email" 
                  value={form.username} 
                  onChange={e => setForm({ ...form, username: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (10 digits)</label>
                <input 
                  className="form-input"
                  placeholder="10 digit phone number" 
                  value={form.phoneNumber} 
                  onChange={e => setForm({ ...form, phoneNumber: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password (8-15 characters)</label>
                <input 
                  type="password" 
                  className="form-input"
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  required 
                />
              </div>

              {form.role === 'STUDENT' && (
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input 
                    className="form-input"
                    placeholder="Roll Number" 
                    value={form.rollNumber} 
                    onChange={e => setForm({ ...form, rollNumber: e.target.value })} 
                    required 
                  />
                </div>
              )}

              {form.role === 'DRIVER' && (
                <div className="form-group">
                  <label className="form-label">Vehicle Registration Number</label>
                  <input 
                    className="form-input"
                    placeholder="e.g. PB 11 AB 1234" 
                    value={form.vehicleNumber} 
                    onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} 
                    required 
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
