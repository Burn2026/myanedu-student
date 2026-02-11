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
      
      {/* --- NUCLEAR CSS FIX (FORCING FULL WIDTH) --- */}
      <style>{`
        /* 1. Global Reset (အရေးကြီးဆုံးအပိုင်း) */
        :root, body, #root {
          width: 100% !important;
          max-width: 100% !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: #f8fafc !important;
          display: block !important; /* Default flex center ကို ဖျက်မည် */
          color: #1e293b;
          font-family: 'Inter', -apple-system, sans-serif;
          overflow-x: hidden; /* ဘေးမထွက်အောင် တားမည် */
        }

        /* 2. Header Style */
        .header {
          height: 64px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #e2e8f0;
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          padding-top: env(safe-area-inset-top); /* iPhone Notch ရှောင်ရန် */
        }

        /* 3. Layout */
        .layout-container { display: flex; padding-top: 64px; min-height: 100vh; width: 100%; }

        /* 4. Sidebar (Desktop) */
        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #e2e8f0;
          position: fixed; top: 64px; bottom: 0; left: 0;
          padding: 20px;
          z-index: 900;
          display: flex; flex-direction: column; gap: 8px;
        }

        /* 5. Main Content */
        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 24px;
          width: calc(100% - 260px);
        }

        /* Menu Items */
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 12px;
          color: #64748b; font-weight: 500; cursor: pointer; transition: 0.2s;
        }
        .nav-item:hover { background: #f1f5f9; color: #2563eb; }
        .nav-item.active { background: #eff6ff; color: #2563eb; font-weight: 600; }

        /* Cards */
        .premium-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }

        /* Responsive Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

        /* Table */
        .table-wrapper { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; background: white; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { text-align: left; padding: 14px; background: #f8fafc; font-size: 13px; color: #64748b; font-weight: 600; }
        td { padding: 14px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }

        /* Badges */
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .verified { background: #dcfce7; color: #15803d; }
        .rejected { background: #fee2e2; color: #b91c1c; }
        .pending { background: #fef9c3; color: #a16207; }

        /* --- MOBILE STYLES (< 1024px) --- */
        .mobile-nav { display: none; }

        @media (max-width: 1024px) {
          .sidebar { display: none; }
          .main-content { 
            margin-left: 0; 
            width: 100%; 
            padding: 16px; 
            padding-bottom: 80px; /* Bottom Nav အတွက် နေရာချန် */
          }
          
          .header { padding: 0 16px; }
          
          /* Mobile Bottom Nav */
          .mobile-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            height: 64px;
            background: white;
            border-top: 1px solid #e2e8f0;
            justify-content: space-around; align-items: center;
            z-index: 1001;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
          }
          .mobile-item { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #94a3b8; font-size: 10px; font-weight: 500; width: 100%; padding: 8px 0; }
          .mobile-item.active { color: #2563eb; font-weight: 600; }
          
          .course-grid { grid-template-columns: 1fr; } /* ဖုန်းတွင် တစ်တန်းတည်းပြမည် */
          .hide-mobile { display: none; }
        }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
           <div style={{width:'32px', height:'32px', background:'#2563eb', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold', fontSize:'16px'}}>E</div>
           <span style={{fontWeight:'700', fontSize:'18px', color:'#0f172a'}}>MyanEdu</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
           <div className="hide-mobile" style={{textAlign:'right'}}>
              <div style={{fontWeight:'600', fontSize:'14px'}}>{student.name}</div>
              <div style={{fontSize:'12px', color:'#64748b'}}>Student</div>
           </div>
           <button onClick={onLogout} style={{padding:'8px 14px', background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:'8px', fontWeight:'600', fontSize:'12px', cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <div className="layout-container">
        {/* DESKTOP SIDEBAR */}
        <div className="sidebar">
           {[
             {id: 'overview', icon: '📊', label: 'Overview'},
             {id: 'classroom', icon: '📚', label: 'My Classes'},
             {id: 'payment', icon: '💳', label: 'Payments'},
             {id: 'exams', icon: '📝', label: 'Exams'},
             {id: 'profile', icon: '👤', label: 'Profile'},
           ].map(item => (
             <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
               <span style={{fontSize:'18px'}}>{item.icon}</span>
               {item.label}
             </div>
           ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px', color:'#1e293b'}}>Welcome back, {student.name}!</h2>
              
              <div className="stats-grid">
                <div className="premium-card" style={{display:'flex', alignItems:'center', gap:'16px', margin:0}}>
                  <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#eff6ff', color:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>📚</div>
                  <div><div style={{fontSize:'24px', fontWeight:'700', color:'#0f172a'}}>{totalCourses}</div><div style={{color:'#64748b', fontSize:'12px'}}>Active Courses</div></div>
                </div>
                <div className="premium-card" style={{display:'flex', alignItems:'center', gap:'16px', margin:0}}>
                  <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#dcfce7', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>💰</div>
                  <div><div style={{fontSize:'24px', fontWeight:'700', color:'#0f172a'}}>{totalPaid.toLocaleString()} Ks</div><div style={{color:'#64748b', fontSize:'12px'}}>Total Invested</div></div>
                </div>
              </div>

              <h3 style={{fontSize:'16px', fontWeight:'700', marginBottom:'12px', color:'#334155'}}>Recent Activity</h3>
              <div className="table-wrapper">
                  <table>
                      <thead><tr><th>Date</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                          {payments.slice(0, 5).map(p => (
                              <tr key={p.id}>
                                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                  <td><div style={{fontWeight:'600'}}>{p.course_name}</div><div style={{fontSize:'11px', color:'#64748b'}}>{p.batch_name}</div></td>
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
              <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px'}}>My Classroom</h2>
              <div className="course-grid">
                {allClasses.map(cls => {
                  const daysLeft = getDaysRemaining(cls.expire_date);
                  const isExpired = daysLeft <= 0;
                  const isRejected = cls.status === 'rejected';
                  const isPending = cls.status === 'pending';

                  return (
                    <div key={cls.id} className="premium-card" style={{display:'flex', flexDirection:'column', height:'100%', padding:'0', overflow:'hidden', margin:0}}>
                      <div style={{height:'4px', background: isRejected?'#ef4444':isPending?'#eab308':'#2563eb'}}></div>
                      <div style={{padding:'20px', flex:1, display:'flex', flexDirection:'column'}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                           <span className={`badge ${cls.status}`}>{cls.status}</span>
                           {!isRejected && !isPending && <span style={{fontSize:'11px', fontWeight:'600', color: isExpired?'#ef4444':'#16a34a'}}>{isExpired ? 'Expired' : `${daysLeft} Days Left`}</span>}
                        </div>
                        <h3 style={{fontSize:'16px', fontWeight:'700', margin:'0 0 4px 0'}}>{cls.course_name}</h3>
                        <p style={{fontSize:'12px', color:'#64748b', margin:'0 0 20px 0'}}>{cls.batch_name}</p>
                        
                        <div style={{marginTop:'auto'}}>
                          {isRejected ? (
                            <button disabled style={{width:'100%', padding:'10px', background:'#f1f5f9', color:'#94a3b8', border:'none', borderRadius:'8px', fontSize:'13px'}}>⛔ Access Revoked</button>
                          ) : isPending ? (
                            <button disabled style={{width:'100%', padding:'10px', background:'#fffbeb', color:'#d97706', border:'none', borderRadius:'8px', fontSize:'13px'}}>⏳ Verification Pending</button>
                          ) : isExpired ? (
                            <button onClick={() => handleRenew(cls.batch_id)} style={{width:'100%', padding:'10px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'600', fontSize:'13px'}}>Renew Now</button>
                          ) : (
                            <button onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)} style={{width:'100%', padding:'10px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'600', fontSize:'13px'}}>▶ Enter Class</button>
                          )}
                        </div>
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
              <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'20px'}}>Manage Payments</h2>
              <div style={{maxWidth:'600px', margin:'0 auto'}}>
                 <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
              </div>
              <h3 style={{fontSize:'16px', fontWeight:'700', marginTop:'30px', marginBottom:'12px'}}>Payment History</h3>
              <div className="table-wrapper">
                  <table>
                      <thead><tr><th>Date</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                          {payments.map(p => (
                              <tr key={p.id}>
                                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                  <td><div style={{fontWeight:'600'}}>{p.course_name}</div><div style={{fontSize:'11px', color:'#64748b'}}>{p.batch_name}</div></td>
                                  <td style={{fontWeight:'600'}}>{Number(p.amount).toLocaleString()} Ks</td>
                                  <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            </div>
          )}

          {activeTab === 'exams' && <div className="premium-card" style={{margin:0}}><h2 style={{marginBottom:'20px'}}>Exam Results 📝</h2><ExamList exams={exams} /></div>}
          
          {activeTab === 'profile' && <div style={{maxWidth:'600px', margin:'0 auto'}}><h2 style={{marginBottom:'20px'}}>My Profile 👤</h2><StudentCard student={student} onUpdate={refreshData} /></div>}

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
             <span style={{fontSize:'20px'}}>{item.icon}</span>
             <span>{item.label}</span>
           </div>
         ))}
      </div>

    </div>
  );
}

export default StudentDashboard;