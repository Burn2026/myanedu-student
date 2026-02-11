import React, { useState } from 'react';
import StudentCard from './StudentCard';
import OnlinePayment from './OnlinePayment';
import ExamList from './ExamList';
import Classroom from './Classroom'; 

function StudentDashboard({ student, payments, exams, onLogout, refreshData, preSelectedBatch }) {
  const [activeTab, setActiveTab] = useState(preSelectedBatch ? 'payment' : 'overview');
  const [selectedClass, setSelectedClass] = useState(null); 
  const [renewBatchId, setRenewBatchId] = useState(null);

  // --- STATS LOGIC ---
  const activePayments = payments.filter(p => p.status === 'verified');
  const totalPaid = activePayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCourses = new Set(activePayments.map(p => p.course_name)).size;
  const latestExam = exams.length > 0 ? exams[0].grade : '-';
  const allClasses = payments; 

  const getDaysRemaining = (expireDate) => {
    if (!expireDate) return 0;
    const diff = new Date(expireDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); 
  };

  const handleEnterClass = (batchId, courseName, expireDate, status) => {
    if (status !== 'verified') return alert("Access Denied: Payment pending or rejected.");
    if (getDaysRemaining(expireDate) <= 0) return alert("Subscription Expired! Please renew.");
    setSelectedClass({ id: batchId, name: courseName });
  };

  const handleRenew = (batchId) => {
      setRenewBatchId(batchId);
      setActiveTab('payment'); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedClass) {
    return <Classroom batchId={selectedClass.id} courseName={selectedClass.name} onBack={() => setSelectedClass(null)} studentName={student.name} />;
  }

  return (
    <div className="dashboard-root">
      
      {/* --- PREMIUM RESPONSIVE CSS --- */}
      <style>{`
        :root {
          --primary: #2563eb;
          --bg-color: #f8fafc;
          --card-bg: #ffffff;
          --text-dark: #1e293b;
          --text-gray: #64748b;
          --sidebar-width: 280px;
          --header-height: 64px;
          --bottom-nav-height: 64px;
        }

        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        body { margin: 0; background-color: var(--bg-color); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

        /* HEADER */
        .header {
          height: var(--header-height);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e2e8f0;
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
        }

        /* LAYOUT CONTAINER */
        .layout-container { display: flex; padding-top: var(--header-height); min-height: 100vh; }

        /* SIDEBAR (Desktop) */
        .sidebar {
          width: var(--sidebar-width);
          background: var(--card-bg);
          border-right: 1px solid #e2e8f0;
          position: fixed; top: var(--header-height); bottom: 0; left: 0;
          padding: 24px 16px;
          z-index: 900;
          display: flex; flex-direction: column; gap: 8px;
        }

        /* MAIN CONTENT */
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 32px;
          width: 100%;
          max-width: 100%;
        }

        /* NAVIGATION ITEMS */
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 12px;
          color: var(--text-gray); font-weight: 500; font-size: 15px;
          cursor: pointer; transition: all 0.2s ease;
        }
        .nav-item:hover { background: #f1f5f9; color: var(--primary); }
        .nav-item.active { background: #eff6ff; color: var(--primary); font-weight: 600; }
        .nav-icon { font-size: 20px; }

        /* CARDS & GRIDS */
        .premium-card {
          background: var(--card-bg);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
          border: 1px solid rgba(226, 232, 240, 0.8);
          transition: transform 0.2s;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }

        /* TABLE */
        .table-wrapper { overflow-x: auto; border-radius: 16px; border: 1px solid #e2e8f0; background: white; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { text-align: left; padding: 16px; background: #f8fafc; font-size: 13px; font-weight: 600; color: var(--text-gray); text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 16px; border-top: 1px solid #f1f5f9; font-size: 14px; color: var(--text-dark); }

        /* BUTTONS & BADGES */
        .btn-primary { width: 100%; padding: 12px; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary:active { transform: scale(0.98); }
        .badge { padding: 6px 12px; border-radius: 30px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .verified { background: #dcfce7; color: #15803d; }
        .rejected { background: #fee2e2; color: #b91c1c; }
        .pending { background: #fef9c3; color: #a16207; }

        /* MOBILE BOTTOM NAV */
        .mobile-nav { display: none; }

        /* --- RESPONSIVE MEDIA QUERIES --- */
        @media (max-width: 1024px) {
          .sidebar { display: none; }
          .main-content { margin-left: 0; padding: 20px; padding-bottom: 100px; }
          .header { padding: 0 16px; }
          
          .mobile-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            height: var(--bottom-nav-height);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid #e2e8f0;
            justify-content: space-around; align-items: center;
            z-index: 1001;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
          }
          .mobile-item { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--text-gray); font-size: 10px; font-weight: 500; width: 100%; padding: 8px 0; }
          .mobile-item.active { color: var(--primary); }
          .mobile-icon { font-size: 20px; }
          
          .course-grid { grid-template-columns: 1fr; } /* ဖုန်းတွင် Card တစ်တန်းတည်းပြမည် */
          .hide-mobile { display: none; }
        }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
           <div style={{width:'36px', height:'36px', background:'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:'18px', boxShadow:'0 4px 10px rgba(37, 99, 235, 0.3)'}}>E</div>
           <span style={{fontWeight:'700', fontSize:'18px', color:'#0f172a'}}>MyanEdu</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
           <div className="hide-mobile" style={{textAlign:'right'}}>
              <div style={{fontWeight:'600', fontSize:'14px'}}>{student.name}</div>
              <div style={{fontSize:'12px', color:'#64748b'}}>Student</div>
           </div>
           <button onClick={onLogout} style={{padding:'8px 16px', background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:'8px', fontWeight:'600', fontSize:'13px', cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <div className="layout-container">
        {/* DESKTOP SIDEBAR */}
        <div className="sidebar">
           {[
             {id: 'overview', icon: '📊', label: 'Dashboard'},
             {id: 'classroom', icon: '📚', label: 'My Classes'},
             {id: 'payment', icon: '💳', label: 'Payments'},
             {id: 'exams', icon: '📝', label: 'Exam Results'},
             {id: 'profile', icon: '👤', label: 'Profile'},
           ].map(item => (
             <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
               <span className="nav-icon">{item.icon}</span>
               {item.label}
             </div>
           ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <h1 style={{fontSize:'24px', fontWeight:'800', color:'#0f172a', marginBottom:'24px'}}>Welcome back, {student.name}! 👋</h1>
              
              <div className="stats-grid">
                <div className="premium-card" style={{display:'flex', alignItems:'center', gap:'16px'}}>
                  <div style={{width:'56px', height:'56px', borderRadius:'14px', background:'#eff6ff', color:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>📚</div>
                  <div><div style={{fontSize:'28px', fontWeight:'800', color:'#0f172a'}}>{totalCourses}</div><div style={{color:'#64748b', fontSize:'14px', fontWeight:'500'}}>Active Courses</div></div>
                </div>
                <div className="premium-card" style={{display:'flex', alignItems:'center', gap:'16px'}}>
                  <div style={{width:'56px', height:'56px', borderRadius:'14px', background:'#dcfce7', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>💰</div>
                  <div><div style={{fontSize:'28px', fontWeight:'800', color:'#0f172a'}}>{totalPaid.toLocaleString()} Ks</div><div style={{color:'#64748b', fontSize:'14px', fontWeight:'500'}}>Total Invested</div></div>
                </div>
              </div>

              <h2 style={{fontSize:'18px', fontWeight:'700', marginBottom:'16px', color:'#334155'}}>Recent Activity</h2>
              <div className="table-wrapper">
                  <table>
                      <thead><tr><th>Date</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                          {payments.slice(0, 5).map(p => (
                              <tr key={p.id}>
                                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                  <td><div style={{fontWeight:'600'}}>{p.course_name}</div><div style={{fontSize:'12px', color:'#64748b'}}>{p.batch_name}</div></td>
                                  <td style={{fontWeight:'600'}}>{Number(p.amount).toLocaleString()} Ks</td>
                                  <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                              </tr>
                          ))}
                          {payments.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#64748b'}}>No recent activity.</td></tr>}
                      </tbody>
                  </table>
              </div>
            </div>
          )}

          {/* 2. MY CLASSES TAB */}
          {activeTab === 'classroom' && (
            <div>
              <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'24px'}}>My Classroom 🎓</h2>
              <div className="course-grid">
                {allClasses.map(cls => {
                  const daysLeft = getDaysRemaining(cls.expire_date);
                  const isExpired = daysLeft <= 0;
                  const isRejected = cls.status === 'rejected';
                  const isPending = cls.status === 'pending';

                  return (
                    <div key={cls.id} className="premium-card" style={{display:'flex', flexDirection:'column', height:'100%'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'16px'}}>
                        <div style={{width:'48px', height:'48px', borderRadius:'12px', background: isRejected?'#fee2e2':isPending?'#fef9c3':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>
                          {isRejected ? '🚫' : isPending ? '⏳' : '🎓'}
                        </div>
                        <span className={`badge ${cls.status}`}>{cls.status}</span>
                      </div>
                      
                      <h3 style={{fontSize:'18px', fontWeight:'700', margin:'0 0 8px 0', color:'#0f172a'}}>{cls.course_name}</h3>
                      <p style={{fontSize:'14px', color:'#64748b', margin:'0 0 24px 0'}}>{cls.batch_name}</p>
                      
                      <div style={{marginTop:'auto'}}>
                        {!isRejected && !isPending && <div style={{fontSize:'12px', fontWeight:'600', color: isExpired?'#ef4444':'#16a34a', marginBottom:'12px', textAlign:'center'}}>
                          {isExpired ? 'Subscription Expired' : `🔥 ${daysLeft} Days Remaining`}
                        </div>}
                        
                        {isRejected ? (
                          <button disabled style={{width:'100%', padding:'12px', background:'#f1f5f9', color:'#94a3b8', border:'none', borderRadius:'12px'}}>Access Revoked</button>
                        ) : isPending ? (
                          <button disabled style={{width:'100%', padding:'12px', background:'#fffbeb', color:'#d97706', border:'none', borderRadius:'12px'}}>Verification Pending</button>
                        ) : isExpired ? (
                          <button onClick={() => handleRenew(cls.batch_id)} className="btn-primary" style={{background:'#ef4444'}}>Renew Now</button>
                        ) : (
                          <button onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)} className="btn-primary">Enter Class</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. PAYMENT TAB */}
          {activeTab === 'payment' && (
            <div>
              <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'24px'}}>Manage Payments 💳</h2>
              <div style={{maxWidth:'600px', margin:'0 auto'}}>
                 <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
              </div>
              <h3 style={{fontSize:'18px', fontWeight:'700', marginTop:'40px', marginBottom:'16px'}}>Payment History</h3>
              <div className="table-wrapper">
                  <table>
                      <thead><tr><th>Date</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                          {payments.map(p => (
                              <tr key={p.id}>
                                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                  <td><div style={{fontWeight:'600'}}>{p.course_name}</div><div style={{fontSize:'12px', color:'#64748b'}}>{p.batch_name}</div></td>
                                  <td style={{fontWeight:'600'}}>{Number(p.amount).toLocaleString()} Ks</td>
                                  <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            </div>
          )}

          {activeTab === 'exams' && <div className="premium-card"><h2 style={{marginBottom:'24px'}}>Exam Results 📝</h2><ExamList exams={exams} /></div>}
          
          {activeTab === 'profile' && <div style={{maxWidth:'600px', margin:'0 auto'}}><h2 style={{marginBottom:'24px'}}>My Profile 👤</h2><StudentCard student={student} onUpdate={refreshData} /></div>}

        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (Fixed) */}
      <div className="mobile-nav">
         {[
           {id: 'overview', icon: '📊', label: 'Overview'},
           {id: 'classroom', icon: '📚', label: 'Classes'},
           {id: 'payment', icon: '💳', label: 'Pay'},
           {id: 'exams', icon: '📝', label: 'Exams'},
           {id: 'profile', icon: '👤', label: 'Profile'},
         ].map(item => (
           <div key={item.id} className={`mobile-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
             <span className="mobile-icon">{item.icon}</span>
             <span>{item.label}</span>
           </div>
         ))}
      </div>

    </div>
  );
}

export default StudentDashboard;