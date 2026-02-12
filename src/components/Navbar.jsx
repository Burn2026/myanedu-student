import React, { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar({ student, onLogout, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!student || !student.id) return;
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`https://myanedu-backend.onrender.com/students/${student.id}/notifications?t=${timestamp}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) { console.error("Noti Error:", err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [student]);

  const handleMarkAsRead = async (noti) => {
    if (noti.is_read) return;
    try {
      await fetch(`https://myanedu-backend.onrender.com/students/notifications/${noti.id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          
          {/* 1. Logo */}
          <div onClick={() => onNavigate('home')} className="nav-logo">
            <span style={{fontSize: '24px'}}>🎓</span> 
            <span className="nav-logo-text">MyanEdu</span>
          </div>

          {/* 2. Right Side Actions Group */}
          <div className="nav-actions">
            
            {/* ✅ Bell Icon (Mobile & Desktop နှစ်ခုလုံးမှာ မြင်ရမည့်နေရာ) */}
            {student && (
                <NotificationBell 
                  unreadCount={unreadCount} 
                  showNotiDropdown={showNotiDropdown} 
                  setShowNotiDropdown={setShowNotiDropdown}
                  notifications={notifications}
                  handleMarkAsRead={handleMarkAsRead}
                />
            )}

            {/* Desktop Only Menu (User Info & Logout) */}
            <div className="desktop-menu">
              {student ? (
                <>
                  <div style={{textAlign: 'right', marginRight: '15px'}}>
                      <div style={{fontWeight: 'bold', fontSize: '14px'}}>{student.name}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>Student</div>
                  </div>
                  <button onClick={onLogout} className="nav-btn-logout">Logout</button>
                </>
              ) : (
                <span style={{color: '#64748b', fontSize: '14px'}}>Welcome Guest</span>
              )}
            </div>

            {/* Mobile Hamburger (Only visible on Mobile) */}
            <div className="mobile-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? '✕' : '☰'}
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu (Logout & User Info Only) */}
      {isMobileMenuOpen && student && (
        <div className="mobile-dropdown">
           <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <div style={{width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#2563eb'}}>
                {student.name.charAt(0)}
              </div>
              <div>
                 <div style={{fontWeight: 'bold'}}>{student.name}</div>
                 <div style={{fontSize: '12px', color: '#64748b'}}>Student Account</div>
              </div>
           </div>
           
           <button onClick={onLogout} style={{width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>
             Logout
           </button>
        </div>
      )}
    </>
  );
}

// Helper Component for Bell
const NotificationBell = ({ unreadCount, showNotiDropdown, setShowNotiDropdown, notifications, handleMarkAsRead }) => (
    <div style={{ position: 'relative', cursor: 'pointer', marginRight: '5px' }}>
        <div onClick={() => setShowNotiDropdown(!showNotiDropdown)} style={{ fontSize: '24px', position: 'relative', padding: '8px' }}>
            🔔
            {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                {unreadCount}
            </span>
            )}
        </div>
        
        {/* Dropdown Box */}
        {showNotiDropdown && (
            <div className="noti-dropdown-box">
                <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>
                    Notifications
                </div>
                {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No notifications</div>
                ) : (
                    notifications.map(noti => (
                    <div key={noti.id} onClick={() => handleMarkAsRead(noti)} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: noti.is_read ? 'white' : '#eff6ff', fontSize: '13px' }}>
                        <div style={{ color: '#1e293b' }}>{noti.message}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{new Date(noti.created_at).toLocaleDateString()}</div>
                    </div>
                    ))
                )}
            </div>
        )}
    </div>
);

export default Navbar;