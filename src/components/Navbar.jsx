import React, { useState, useEffect } from 'react';

function Navbar({ student, onLogout, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // (New) Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!student || !student.id) return;
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`https://myanedu-backend.onrender.com/students/${student.id}/notifications?t=${timestamp}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) { console.error("Noti Error:", err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
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
    <nav className="navbar" style={{position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
      <div className="nav-container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '15px 20px'}}>
        
        {/* Brand Logo */}
        <div className="nav-logo" onClick={() => onNavigate('home')} style={{cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '1.5rem'}}>🎓</span> 
          <span>MyanEdu Portal</span>
        </div>

        {/* Desktop Menu */}
        <div className="nav-links desktop-only" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          {student ? (
            <>
              {/* Notification Bell */}
              <NotificationBell 
                unreadCount={unreadCount} 
                showNotiDropdown={showNotiDropdown} 
                setShowNotiDropdown={setShowNotiDropdown}
                notifications={notifications}
                handleMarkAsRead={handleMarkAsRead}
              />

              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                    <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{student.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Student</div>
                </div>
                <div style={{ width: '35px', height: '35px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    {student.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Logout Button */}
              <button onClick={onLogout} style={{background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'}}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ fontSize: '14px', color: '#64748b' }}>Welcome Guest</div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="mobile-only" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{cursor: 'pointer', fontSize: '24px'}}>
            ☰
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && student && (
         <div className="mobile-menu" style={{background: 'white', borderTop: '1px solid #eee', padding: '15px'}}>
            <div style={{marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Student</div>
                </div>
            </div>
            
            <div style={{marginBottom: '15px'}} onClick={() => { setShowNotiDropdown(!showNotiDropdown); }}>
               🔔 Notifications ({unreadCount})
               {showNotiDropdown && (
                   <div style={{marginTop: '10px', border: '1px solid #eee', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto'}}>
                      {notifications.map(n => (
                          <div key={n.id} onClick={() => handleMarkAsRead(n)} style={{padding: '10px', borderBottom: '1px solid #eee', background: n.is_read ? 'white' : '#f0f9ff'}}>
                              {n.message}
                          </div>
                      ))}
                   </div>
               )}
            </div>

            <button onClick={onLogout} style={{width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '6px'}}>
                Logout
            </button>
         </div>
      )}
    </nav>
  );
}

// Notification Helper Component (To keep code clean)
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
            <div style={{ position: 'absolute', top: '45px', right: '-60px', width: '300px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 2000, maxHeight: '400px', overflowY: 'auto', textAlign: 'left' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>
                Notifications
            </div>
            {notifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No notifications yet</div>
            ) : (
                notifications.map(noti => (
                <div key={noti.id} onClick={() => handleMarkAsRead(noti)} style={{ padding: '12px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: noti.is_read ? 'white' : '#eff6ff', display: 'flex', gap: '10px', alignItems: 'start' }}>
                    <span style={{fontSize: '16px'}}>{noti.type === 'success' ? '✅' : '📢'}</span>
                    <div>
                    <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: noti.is_read ? 'normal' : 'bold' }}>{noti.message}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{new Date(noti.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
                ))
            )}
            </div>
        )}
    </div>
);

export default Navbar;