import React, { useState, useEffect } from 'react';

export default function ManagerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('leaves'); // 'leaves' or 'employees'
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  
  // Employee Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empDept, setEmpDept] = useState('');

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/leaves');
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  // Leave Actions
  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/leaves/${id}/approve`, {
        method: 'PUT',
      });
      if (response.ok) {
        setSuccess('Leave request approved.');
        fetchLeaves();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update leave status.');
      }
    } catch (err) {
      setError('Connection to backend failed');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/leaves/${id}/reject`, {
        method: 'PUT',
      });
      if (response.ok) {
        setSuccess('Leave request rejected.');
        fetchLeaves();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update leave status.');
      }
    } catch (err) {
      setError('Connection to backend failed');
    }
  };

  // Employee CRUD Actions
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setEmpName('');
    setEmpEmail('');
    setEmpPassword('');
    setEmpDept('');
    setCurrentEmployeeId(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (employee) => {
    setIsEditMode(true);
    setEmpName(employee.name);
    setEmpEmail(employee.email);
    setEmpPassword(''); // leave blank for no password change
    setEmpDept(employee.department);
    setCurrentEmployeeId(employee.id);
    setShowModal(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: empName,
      email: empEmail,
      department: empDept,
    };
    if (empPassword) {
      payload.password = empPassword;
    }

    try {
      let response;
      if (isEditMode) {
        response = await fetch(`http://localhost:8080/api/employees/${currentEmployeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        payload.password = empPassword || '123456'; // Default temporary password
        response = await fetch('http://localhost:8080/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        setSuccess(isEditMode ? 'Employee updated successfully' : 'Employee added successfully');
        setShowModal(false);
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const msg = await response.text();
        setError(msg || 'Failed to save employee');
      }
    } catch (err) {
      setError('Connection to backend failed');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess('Employee deleted successfully.');
        fetchEmployees();
        fetchLeaves(); // Some leaves might get removed depending on cascade
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete employee.');
      }
    } catch (err) {
      setError('Connection to backend failed');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of employee leave requests and profiles</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        <div
          className={`tab ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          Leave Applications ({leaves.filter(l => l.status === 'PENDING').length} pending)
        </div>
        <div
          className={`tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Directory ({employees.length})
        </div>
      </div>

      {activeTab === 'leaves' ? (
        /* Leave applications tab */
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>Leave Requests</h3>
          {leaves.length === 0 ? (
            <div className="empty-state">No leave applications found in the system.</div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <strong>{leave.user?.name || 'Unknown'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{leave.user?.email}</div>
                      </td>
                      <td>{leave.user?.department || '-'}</td>
                      <td><span style={{ fontWeight: 600 }}>{leave.leaveType}</span></td>
                      <td>{leave.startDate} to {leave.endDate}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span className={`badge badge-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        {leave.status === 'PENDING' ? (
                          <div className="flex-gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApprove(leave.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(leave.id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Employee CRUD directory tab */
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Employees Directory</h3>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
              + Add Employee
            </button>
          </div>

          {employees.length === 0 ? (
            <div className="empty-state">No employees found. Click "+ Add Employee" to create one.</div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td><strong>{emp.name}</strong></td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>
                        <div className="flex-gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditModal(emp)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteEmployee(emp.id)}
                          >
                            Delete
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
      )}

      {/* CRUD Add/Edit Employee Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Employee Details' : 'Add New Employee'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveEmployee}>
              <div className="form-group">
                <label htmlFor="emp-name">Full Name</label>
                <input
                  id="emp-name"
                  type="text"
                  className="form-control"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp-email">Email Address</label>
                <input
                  id="emp-email"
                  type="email"
                  className="form-control"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp-password">
                  {isEditMode ? 'Password (leave empty to keep unchanged)' : 'Password'}
                </label>
                <input
                  id="emp-password"
                  type="password"
                  className="form-control"
                  placeholder={isEditMode ? '••••••••' : 'Default is 123456 if left empty'}
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                  required={!isEditMode}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp-dept">Department</label>
                <input
                  id="emp-dept"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Engineering, Sales, HR"
                  value={empDept}
                  onChange={(e) => setEmpDept(e.target.value)}
                  required
                />
              </div>

              <div className="flex-gap-2 mt-6" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
