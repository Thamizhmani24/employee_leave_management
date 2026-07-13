import React from 'react';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>📅</span> LeaveFlow
      </div>
      {user && (
        <div className="navbar-user">
          <div className="user-badge">
            Logged in as: <span>{user.name}</span> ({user.role})
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
