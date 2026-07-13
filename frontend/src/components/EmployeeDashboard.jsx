import React, { useState, useEffect } from 'react';

export default function EmployeeDashboard({ user }) {
  const [leaves, setLeaves] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Stats calculation
  const totalApplied = leaves.length;
  const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
  const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/leaves/employee/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error("Error fetching leaves", err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          startDate,
          endDate,
          leaveType,
          reason
        }),
      });

      if (response.ok) {
        setSuccess('Leave request applied successfully!');
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchLeaves();
      } else {
        const msg = await response.text();
        setError(msg || 'Failed to apply leave');
      }
    } catch (err) {
      setError('Connection to backend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Department: {user.department || 'Not Assigned'}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Applied</div>
          <div className="stat-val">{totalApplied}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="stat-label">Pending Approval</div>
          <div className="stat-val" style={{ color: 'var(--warning)' }}>{pendingCount}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div className="stat-label">Approved</div>
          <div className="stat-val" style={{ color: 'var(--success)' }}>{approvedCount}</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div className="stat-label">Rejected</div>
          <div className="stat-val" style={{ color: 'var(--danger)' }}>{rejectedCount}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Leave Request Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>Apply for Leave</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleApplyLeave}>
            <div className="form-group">
              <label htmlFor="leave-start">Start Date</label>
              <input
                id="leave-start"
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="leave-end">End Date</label>
              <input
                id="leave-end"
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="leave-type">Leave Type</label>
              <select
                id="leave-type"
                className="form-control"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="ANNUAL">Annual Leave</option>
                <option value="MATERNITY">Maternity / Paternity Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="leave-reason">Reason</label>
              <textarea
                id="leave-reason"
                className="form-control"
                rows="3"
                placeholder="Brief reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Leave History List */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>My Leave Requests</h3>
          {leaves.length === 0 ? (
            <div className="empty-state">
              You haven't submitted any leave requests yet.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <strong style={{ fontSize: '0.85rem' }}>{leave.leaveType}</strong>
                      </td>
                      <td>
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td>{leave.reason}</td>
                      <td>
                        <span className={`badge badge-${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
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
}
