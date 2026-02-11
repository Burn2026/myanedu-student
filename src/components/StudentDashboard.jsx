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
      
      <style>{`
        /* 1. Desktop Sidebar (Fixed Left) */
        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #e2e8f0;
          position: fixed;
          top: 70px; /* Header အောက် */
          bottom: 0;
          left: 0;
          padding: 20px;
          z-index: 900;
          overflow-y: auto;
        }

        /* 2. Main Content (Desktop) */
        .main-content {
          margin-left: 260px; /* Sidebar ရှိလို့ တွန်းထားသည် */
          padding: 30px;
          width: calc(100% - 260px);
          min-height: calc(100vh - 70px);
          box-sizing: border-box; /* Padding ကြောင့် width မကျော်အောင် */
        }

        /* 3. Components Styles */
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-radius: 10px;
          color: #64748b; font-weight: 500; cursor: pointer; margin-bottom: 5px;
        }
        .nav-item:hover { background: #f1f5f9; color: #2563eb; }
        .nav-item.active { background: #eff6ff; color: #2563eb; font-weight: 700; }

        .premium-card {
          background: white; border-radius: 16px; padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0; margin-bottom: 20px;
        }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        
        .mobile-nav { display: none; }

        /* =========================================
           MOBILE RESPONSIVENESS FIX (900px အောက်)
           ========================================= */
        @media (max-width: 900px) {
          /* Sidebar ကို ဖျောက်မည် */
          .sidebar { display: none; } 
          
          /* Main Content ကို ဘယ်ဘက်သို့ ပြန်ကပ်မည် */
          .main-content { 
            margin-left: 0 !important; 
            width: 100% !important; 
            padding: 15px; 
            padding-bottom: 90px; /* အောက်ခြေ Menu အတွက် နေရာချန် */
          }
          
          .stats-grid, .course-grid { grid-template-columns: 1fr; } /* Card တွေကို တစ်တန်းတည်းပြမည် */

          /* Mobile Bottom Nav ကို ပြမည် */
          .mobile-nav {
            display: flex;
            position: fixed; bottom: 0; left: 0; right: 0;
            height: 65px;
            background: white; border-top: 1px solid #e2e8f0;
            justify-content: space-around; align-items: center;
            z-index: 1001;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
          }
          
          .mobile-item { display: flex; flex-direction: column; align-items: center; font-size: 10px; color: #94a3b8; font-weight: 500; }
          .mobile-item.active { color: #2563eb; font-weight: 700; }
          .mobile-icon { font-size: 20px; margin-bottom: 2px; }
        }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <div className="sidebar">
         {[
           {id: 'overview', icon: '📊', label: 'Overview'},
           {id: 'classroom', icon: '📚', label: 'My Classes'},
           {id: 'payment', icon: '💳', label: 'Payments'},
           {id: 'exams', icon: '📝', label: 'Exam Results'},
           {id: 'profile', icon: '👤', label: 'Profile'},
         ].map(item => (
           <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
             <span style={{fontSize:'18px'}}>{item.icon}</span>
             {item.label}
           </div>
         ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'20px'}}>Welcome back, {student.name}!</h2>
            
            <div className="stats-grid">
              <div className="premium-card" style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <div style={{fontSize:'28px'}}>📚</div>
                <div><div style={{fontSize:'24px', fontWeight:'700'}}>{totalCourses}</div><div style={{color:'#64748b', fontSize:'13px'}}>Active Courses</div></div>
              </div>
              <div className="premium-card" style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <div style={{fontSize:'28px'}}>💰</div>
                <div><div style={{fontSize:'24px', fontWeight:'700', color:'#16a34a'}}>{totalPaid.toLocaleString()} Ks</div><div style={{color:'#64748b', fontSize:'13px'}}>Total Invested</div></div>
              </div>
            </div>

            <h3 style={{fontSize:'18px', fontWeight:'700', marginBottom:'15px'}}>Recent Activity</h3>
            <div className="premium-card" style={{padding:0, overflow:'hidden'}}>
                <div className="table-scroll">
                  <table>
                      <thead><tr><th>Date</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                          {payments.slice(0, 5).map(p => (
                              <tr key={p.id}>
                                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                  <td><div style={{fontWeight:'600'}}>{p.course_name}</div><div style={{fontSize:'11px', color:'#64748b'}}>{p.batch_name}</div></td>
                                  <td>{Number(p.amount).toLocaleString()} Ks</td>
                                  <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                              </tr>
                          ))}
                          {payments.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No recent activity.</td></tr>}
                      </tbody>
                  </table>
                </div>
            </div>
          </div>
        )}

        {/* 2. CLASSROOM */}
        {activeTab === 'classroom' && (
          <div>
            <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'20px'}}>My Classroom</h2>
            <div className="course-grid">
              {allClasses.map(cls => {
                const daysLeft = getDaysRemaining(cls.expire_date);
                const isExpired = daysLeft <= 0;
                const isRejected = cls.status === 'rejected';
                const isPending = cls.status === 'pending';

                return (
                  <div key={cls.id} className="premium-card" style={{display:'flex', flexDirection:'column', height:'100%', borderTop: `4px solid ${isRejected?'#ef4444':isPending?'#eab308':'#2563eb'}`}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                        <span className={`badge ${cls.status}`}>{cls.status}</span>
                        {!isRejected && !isPending && <span style={{fontSize:'11px', fontWeight:'600', color: isExpired?'#ef4444':'#16a34a'}}>{isExpired ? 'Expired' : `${daysLeft} Days Left`}</span>}
                    </div>
                    <h3 style={{fontSize:'17px', margin:'0 0 5px 0'}}>{cls.course_name}</h3>
                    <p style={{fontSize:'13px', color:'#64748b', margin:'0 0 20px 0'}}>{cls.batch_name}</p>
                    
                    <div style={{marginTop:'auto'}}>
                      {isRejected ? (
                        <button disabled style={{width:'100%', padding:'10px', background:'#f1f5f9', color:'#94a3b8', border:'none', borderRadius:'8px'}}>Access Revoked</button>
                      ) : isPending ? (
                        <button disabled style={{width:'100%', padding:'10px', background:'#fffbeb', color:'#d97706', border:'none', borderRadius:'8px'}}>Verification Pending</button>
                      ) : isExpired ? (
                        <button onClick={() => handleRenew(cls.batch_id)} style={{width:'100%', padding:'10px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold'}}>Renew Now</button>
                      ) : (
                        <button onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)} style={{width:'100%', padding:'10px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold'}}>Enter Class</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. PAYMENT */}
        {activeTab === 'payment' && (
          <div>
            <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'20px'}}>Manage Payments</h2>
            <div style={{maxWidth:'600px', margin:'0 auto'}}>
                <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
            </div>
            <h3 style={{marginTop:'40px', marginBottom:'15px'}}>Payment History</h3>
            <div className="premium-card" style={{padding:0, overflow:'hidden'}}>
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>Date</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                    <td><div style={{fontWeight:'600'}}>{p.course_name}</div><div style={{fontSize:'11px', color:'#64748b'}}>{p.batch_name}</div></td>
                                    <td>{Number(p.amount).toLocaleString()} Ks</td>
                                    <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'exams' && <div className="premium-card"><h2 style={{marginBottom:'20px'}}>Exam Results</h2><ExamList exams={exams} /></div>}
        {activeTab === 'profile' && <div style={{maxWidth:'600px', margin:'0 auto'}}><h2 style={{marginBottom:'20px'}}>My Profile</h2><StudentCard student={student} onUpdate={refreshData} /></div>}

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
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