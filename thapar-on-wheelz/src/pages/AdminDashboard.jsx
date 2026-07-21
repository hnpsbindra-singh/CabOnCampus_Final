import { useState, useEffect } from 'react'
import api from '../api/axios'
import { showToast } from '../components/Toast'
import { Users, Truck, RefreshCw, UserPlus, ShieldAlert } from 'lucide-react'
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

    // Validate inputs
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
      // Reset form
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
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">ThaparOnWheelz · User Management</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { loadStats(); loadUsers(); }} disabled={loading}>
            <RefreshCw size={14} className={loading ? styles.spinning : ''} />
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <UserPlus size={14} />
            Add User
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon purple"><Users size={20} /></div>
            <div>
              <div className="stat-value">{stats.STUDENT}</div>
              <div className="stat-label">Students</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Truck size={20} /></div>
            <div>
              <div className="stat-value">{stats.DRIVER}</div>
              <div className="stat-label">Drivers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><ShieldAlert size={20} /></div>
            <div>
              <div className="stat-value">{stats.ADMIN}</div>
              <div className="stat-label">Admins</div>
            </div>
          </div>
        </div>

        <div className={styles.tabs} style={{ maxWidth: 400, marginBottom: '2rem' }}>
          <button className={`${styles.tab} ${activeTab === 'STUDENT' ? styles.active : ''}`} onClick={() => setActiveTab('STUDENT')}>Students</button>
          <button className={`${styles.tab} ${activeTab === 'DRIVER' ? styles.active : ''}`} onClick={() => setActiveTab('DRIVER')}>Drivers</button>
          <button className={`${styles.tab} ${activeTab === 'ADMIN' ? styles.active : ''}`} onClick={() => setActiveTab('ADMIN')}>Admins</button>
        </div>

        <div className="table-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Registered {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}s</h2>
            <span className="badge badge-primary">{stats[activeTab]} total</span>
          </div>

          {loading ? (
            <div className={styles.loadingState}>Loading…</div>
          ) : usersList.length === 0 ? (
            <div className={styles.empty}>No {activeTab.toLowerCase()}s found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username / Email</th>
                  <th>Phone Number</th>
                  {activeTab === 'STUDENT' && <th>Roll Number</th>}
                  {activeTab === 'DRIVER' && <th>Vehicle Number</th>}
                  <th>Actions</th>
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
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--primary)' }}>{userItem.username}</td>
                    <td>{userItem.phoneNumber}</td>
                    {activeTab === 'STUDENT' && <td>{userItem.rollNumber || 'N/A'}</td>}
                    {activeTab === 'DRIVER' && <td>{userItem.vehicleNumber || 'N/A'}</td>}
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(userItem.id)}>
                          Suspend
                        </button>
                        <button className="btn btn-success btn-sm" onClick={() => handleUnsuspend(userItem.id)}>
                          Unsuspend
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="btn btn-ghost btn-sm"
            >
              ← Previous
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
              className="btn btn-ghost btn-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add New User</h2>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
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
                  placeholder="Arjun Singh" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email / Username</label>
                <input 
                  type="email" 
                  className="form-input"
                  placeholder="arjun@thapar.edu" 
                  value={form.username} 
                  onChange={e => setForm({ ...form, username: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (10 digits)</label>
                <input 
                  className="form-input"
                  placeholder="9876543210" 
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
                    placeholder="102103456" 
                    value={form.rollNumber} 
                    onChange={e => setForm({ ...form, rollNumber: e.target.value })} 
                    required 
                  />
                </div>
              )}

              {form.role === 'DRIVER' && (
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input 
                    className="form-input"
                    placeholder="PB65AB1234" 
                    value={form.vehicleNumber} 
                    onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} 
                    required 
                  />
                </div>
              )}

              <div className={styles.modalActions} style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
