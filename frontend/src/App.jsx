import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login' or 'register'

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('leave_flow_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('leave_flow_user');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('leave_flow_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('leave_flow_user');
    setView('login');
  };

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />

      <main style={{ flex: 1 }}>
        {!user ? (
          view === 'login' ? (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setView('register')}
            />
          ) : (
            <Register
              onRegisterSuccess={() => setView('login')}
              onSwitchToLogin={() => setView('login')}
            />
          )
        ) : user.role === 'MANAGER' ? (
          <ManagerDashboard user={user} />
        ) : (
          <EmployeeDashboard user={user} />
        )}
      </main>
    </div>
  );
}
