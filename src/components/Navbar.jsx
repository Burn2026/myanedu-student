import React, { useState, useEffect } from 'react';

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
      {/* Navbar CSS */}
      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0;
          height: 70px; background: white; z-index: 2000;
          border-bottom: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-container {
          width: 100%; max-width: 1200px; padding: 0 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .desktop-menu { display: flex; align-items: center; gap: 20px; }
        .mobile-hamburger { display: none; font-size: 24px; cursor: pointer; }
        .mobile-dropdown {
          position: fixed; top: 70px; left: 0; right: 0;
          background: white; border-bottom: 1px solid #e2e8f0;
          padding: 20px; z-index: 1999;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .desktop-menu { display: none; }
          .mobile-hamburger { display: block; }
          .navbar { height: 60px; }
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-container">
          {/* Logo */}
          <div onClick={() => onNavigate('home')} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{fontSize: '24px'}}>🎓</span> 
            <span style={{fontWeight: '800', fontSize: '18px', color: '#2563eb'}}>MyanEdu</span>
          </div>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            {student ? (
              <>
                <NotificationBell 
                  unreadCount={unreadCount} 
                  showNotiDropdown={showNotiDropdown} 
                  setShowNotiDropdown={setShowNotiDropdown}
                  notifications={notifications}
                  handleMarkAsRead={handleMarkAsRead}
                />
                <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: 'bold', fontSize: '14px'}}>{student.name}</div>
                    <div style={{fontSize: '11px', color: '#64748b'}}>Student</div>
                </div>
                <button onClick={onLogout} style={{background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}>Logout</button>
              </>
            ) : (
              <span style={{color: '#64748b', fontSize: '14px'}}>Welcome Guest</span>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="mobile-hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && student && (
        <div className="mobile-dropdown">
           <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
              <div style={{width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#2563eb'}}>{student.name.charAt(0)}</div>
              <div>
                 <div style={{fontWeight: 'bold'}}>{student.name}</div>
                 <div style={{fontSize: '12px', color: '#64748b'}}>Student Account</div>
              </div>
           </div>
           
           <div style={{marginBottom: '20px'}} onClick={() => setShowNotiDropdown(!showNotiDropdown)}>
              🔔 Notifications <span style={{background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '10px'}}>{unreadCount}</span>
              {showNotiDropdown && (
                 <div style={{marginTop: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px'}}>
                    {notifications.map(n => (
                       <div key={n.id} onClick={() => handleMarkAsRead(n)} style={{padding: '10px', borderBottom: '1px solid #eee', background: n.is_read ? 'white' : '#f0f9ff', fontSize: '13px'}}>
                          {n.message}
                       </div>
                    ))}
                 </div>
              )}
           </div>

           <button onClick={onLogout} style={{width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>Logout</button>
        </div>
      )}
    </>
  );
}

// Helper Component for Bell
const NotificationBell = ({ unreadCount, showNotiDropdown, setShowNotiDropdown, notifications, handleMarkAsRead }) => (
    <div style={{ position: 'relative', cursor: 'pointer', marginRight: '10px' }}>
        <div onClick={() => setShowNotiDropdown(!showNotiDropdown)} style={{ fontSize: '22px', position: 'relative' }}>
            🔔
            {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                {unreadCount}
            </span>
            )}
        </div>
        {showNotiDropdown && (
            <div style={{ position: 'absolute', top: '45px', right: '-20px', width: '280px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 2000, maxHeight: '350px', overflowY: 'auto' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>Notifications</div>
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