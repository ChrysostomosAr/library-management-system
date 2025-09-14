// src/pages/MembersPage.js
import React, { useState, useEffect } from 'react';
import memberService from '../services/memberService';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'MEMBER',
    isActive: true
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadMembers();
    loadStatistics();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getAllMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Σφάλμα κατά τη φόρτωση των μελών: ' + err.message);
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await memberService.getUserStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      if (editingMember) {
        await memberService.updateMember(editingMember.id, formData);
      } else {
        await memberService.createMember(formData);
      }
      
      await loadMembers();
      await loadStatistics();
      resetForm();
      setError(null);
    } catch (err) {
      setError('Σφάλμα κατά την αποθήκευση: ' + (err.response?.data?.message || err.message));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      username: member.username || '',
      email: member.email || '',
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      password: '', // Don't populate password for security
      role: member.role || 'MEMBER',
      isActive: member.isActive !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το μέλος "${username}";`)) {
      try {
        await memberService.deleteMember(id);
        await loadMembers();
        await loadStatistics();
        setError(null);
      } catch (err) {
        setError('Σφάλμα κατά τη διαγραφή: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await memberService.changeUserRole(memberId, newRole);
      await loadMembers();
      await loadStatistics();
      setError(null);
    } catch (err) {
      setError('Σφάλμα κατά την αλλαγή ρόλου: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'MEMBER',
      isActive: true
    });
    setEditingMember(null);
    setShowForm(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadMembers();
      return;
    }
    
    try {
      setLoading(true);
      const results = await memberService.searchMembers(searchTerm);
      setMembers(results);
    } catch (err) {
      setError('Σφάλμα κατά την αναζήτηση: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter members by role
  const filteredMembers = selectedRole 
    ? members.filter(member => member.role === selectedRole)
    : members;

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-danger';
      case 'LIBRARIAN': return 'bg-warning text-dark';
      case 'MEMBER': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Φόρτωση...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2>👥 Διαχείριση Μελών</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Ακύρωση' : '+ Προσθήκη Νέου Μέλους'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h3>{statistics.totalUsers}</h3>
                <p className="mb-0">Συνολικά Μέλη</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h3>{statistics.activeUsers}</h3>
                <p className="mb-0">Ενεργά Μέλη</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-dark">
              <div className="card-body text-center">
                <h3>{statistics.librarians}</h3>
                <p className="mb-0">Βιβλιοθηκάριοι</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-danger text-white">
              <div className="card-body text-center">
                <h3>{statistics.admins}</h3>
                <p className="mb-0">Διαχειριστές</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible mb-4">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingMember ? 'Επεξεργασία Μέλους' : 'Προσθήκη Νέου Μέλους'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Username <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    disabled={formSubmitting || editingMember} // Disable username edit
                  />
                  {editingMember && (
                    <small className="text-muted">Το username δεν μπορεί να αλλάξει</small>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={formSubmitting}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Όνομα <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    disabled={formSubmitting}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Επώνυμο <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    disabled={formSubmitting}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Password {!editingMember && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingMember}
                    disabled={formSubmitting}
                    placeholder={editingMember ? "Αφήστε κενό για να μην αλλάξει" : ""}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Ρόλος <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                    disabled={formSubmitting}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    disabled={formSubmitting}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Ενεργός Χρήστης
                  </label>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Αποθήκευση...
                    </>
                  ) : (
                    editingMember ? '💾 Ενημέρωση' : '💾 Αποθήκευση'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={resetForm}
                  disabled={formSubmitting}
                >
                  Ακύρωση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Αναζήτηση</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Αναζήτηση μελών (όνομα, email, username)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-outline-primary" onClick={handleSearch}>
                  🔍 Αναζήτηση
                </button>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Φιλτράρισμα κατά Ρόλο</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Όλοι οι ρόλοι</option>
                <option value="ADMIN">Admin</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="MEMBER">Member</option>
              </select>
            </div>
            <div className="col-md-3 mb-3 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100" onClick={loadMembers}>
                🔄 Ανανέωση
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Μέλη ({filteredMembers.length})</h6>
            {loading && <div className="spinner-border spinner-border-sm"></div>}
          </div>
        </div>
        <div className="card-body p-0">
          {filteredMembers.length === 0 ? (
            <div className="text-center p-5">
              <div className="mb-3">👥</div>
              <h5>Δεν βρέθηκαν μέλη</h5>
              <p className="text-muted">
                {searchTerm || selectedRole 
                  ? 'Δοκιμάστε διαφορετικά κριτήρια αναζήτησης' 
                  : 'Προσθέστε το πρώτο μέλος χρησιμοποιώντας το κουμπί παραπάνω'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Χρήστης</th>
                    <th>Email</th>
                    <th>Ρόλος</th>
                    <th>Κατάσταση</th>
                    <th>Ημ. Δημιουργίας</th>
                    <th>Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div>
                          <strong>{member.firstName} {member.lastName}</strong>
                          <br />
                          <small className="text-muted">@{member.username}</small>
                        </div>
                      </td>
                      <td>{member.email}</td>
                      <td>
                        <select
                          className={`form-select form-select-sm badge ${getRoleColor(member.role)} border-0`}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="LIBRARIAN">LIBRARIAN</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${member.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {member.isActive ? 'Ενεργός' : 'Ανενεργός'}
                        </span>
                      </td>
                      <td>
                        {member.createdDate ? 
                          new Date(member.createdDate).toLocaleDateString('el-GR') : 
                          'N/A'
                        }
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(member)}
                            title="Επεξεργασία"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(member.id, member.username)}
                            title="Διαγραφή"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;