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
  const uniqueCourses = Array.from(new Set(activePayments.map(p => p.course_name))); 
  const totalCourses = uniqueCourses.length;
  const latestExam = exams.length > 0 ? exams[0].grade : '-';
  const allClasses = payments; 

  const getDaysRemaining = (expireDate) => {
    if (!expireDate) return 0;
    const today = new Date();
    const exp = new Date(expireDate);
    const diffTime = exp - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const handleEnterClass = (batchId, courseName, expireDate, status) => {
    if (status !== 'verified') {
        alert("🔒 Access Denied.\nYour payment is pending or rejected. Please contact admin.");
        return;
    }
    const daysLeft = getDaysRemaining(expireDate);
    if (daysLeft <= 0) {
        alert("⚠️ Subscription Expired!\nPlease renew your subscription to continue learning.");
        return;
    }
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

  // --- INLINE STYLES FOR CARD & LAYOUT ---
  const styles = {
    card: {
      background: 'white', 
      borderRadius: '16px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
      border: '1px solid #e2e8f0',
      padding: '20px',
      position: 'relative',
      display: 'flex', flexDirection: 'column', height: '100%'
    }
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* --- RESPONSIVE & FIXED LAYOUT CSS --- */}
      <style>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        
        /* 1. FIXED HEADER (အပေါ်ဆုံးတွင် အမြဲရှိနေမည်) */
        .top-nav {
          height: 60px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 20px;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000; /* Sidebar ထက်မြင့်ရမည် */
        }
        
        /* 2. FIXED SIDEBAR (Header အောက်တွင် အတိအကျ ကပ်နေမည်) */
        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #e2e8f0;
          position: fixed;
          top: 60px; /* Header အမြင့် */
          bottom: 0; /* အောက်ခြေထိ ဆွဲချမည် */
          left: 0;
          overflow-y: auto; /* Menu များလျှင် Sidebar ကိုသာ Scroll လုပ်မည် */
          padding: 20px 0;
          z-index: 900;
        }

        /* 3. MAIN CONTENT (Sidebar ဘေးတွင် နေရာယူမည်) */
        .main-content {
          margin-top: 60px; /* Header အမြင့်နှင့်ညီ */
          margin-left: 260px; /* Sidebar အကျယ်နှင့်ညီ */
          padding: 30px;
          min-height: calc(100vh - 60px);
          width: calc(100% - 260px);
          box-sizing: border-box;
        }
        
        /* Menu Item Styles */
        .nav-item { padding: 12px 24px; cursor: pointer; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 12px; transition: 0.2s; border-left: 4px solid transparent; }
        .nav-item:hover { background: #f1f5f9; color: #2563eb; }
        .nav-item.active { background: #eff6ff; color: #2563eb; border-left-color: #2563eb; }
        
        /* Grid & Table Styles */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-box { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; }
        .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .table-container { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow-x: auto; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
        td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
        
        /* Status Badges */
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; }
        .bg-verified { background: #dcfce7; color: #166534; }
        .bg-rejected { background: #fee2e2; color: #991b1b; }
        .bg-pending { background: #fef9c3; color: #854d0e; }

        /* MOBILE RESPONSIVE MEDIA QUERIES */
        .mobile-nav { display: none; }
        
        @media (max-width: 992px) {
          .sidebar { display: none; } /* ဖုန်းတွင် Sidebar ဖျောက်မည် */
          .main-content { margin-left: 0; width: 100%; padding: 20px; padding-bottom: 80px; } /* Content ကို အပြည့်ချဲ့မည် */
          
          /* အောက်ခြေ Mobile Menu */
          .mobile-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; height: 60px; justify-content: space-around; align-items: center; z-index: 2000; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
          .mobile-menu-item { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: #64748b; font-weight: 500; cursor: pointer; }
          .mobile-menu-item.active { color: #2563eb; font-weight: 700; }
          .hide-mobile { display: none; }
        }
      `}</style>

      <div className="dashboard-container">
        {/* HEADER BAR */}
        <div className="top-nav">
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <span style={{fontSize:'24px'}}>🎓</span>
             <span style={{fontWeight: '700', fontSize: '18px', color: '#1e293b'}}>MyanEdu</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <div className="hide-mobile" style={{textAlign:'right'}}>
                <div style={{fontWeight:'600', fontSize:'14px'}}>{student.name}</div>
                <div style={{fontSize:'12px', color:'#64748b'}}>Student ID: {student.id}</div>
             </div>
             <button onClick={onLogout} style={{padding: '8px 16px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor:'pointer'}}>
                Logout
             </button>
          </div>
        </div>

        <div className="dashboard-body">
          {/* SIDEBAR (Desktop) */}
          <div className="sidebar">
             {['overview', 'classroom', 'payment', 'exams', 'profile'].map(tab => (
               <div key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                 <span style={{fontSize:'18px'}}>
                    {tab === 'overview' && '📊'}
                    {tab === 'classroom' && '📚'}
                    {tab === 'payment' && '💳'}
                    {tab === 'exams' && '📝'}
                    {tab === 'profile' && '👤'}
                 </span>
                 <span>
                    {tab === 'overview' && 'Overview'}
                    {tab === 'classroom' && 'My Classes'}
                    {tab === 'payment' && 'Payments'}
                    {tab === 'exams' && 'Exam Results'}
                    {tab === 'profile' && 'My Profile'}
                 </span>
               </div>
             ))}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="main-content">
            
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <h2 style={{fontSize:'22px', marginBottom:'20px', color:'#1e293b'}}>Overview</h2>
                <div className="stats-grid">
                  <div className="stat-box">
                    <span style={{fontSize:'28px'}}>📚</span>
                    <div><div style={{fontSize:'24px', fontWeight:'700'}}>{totalCourses}</div><div style={{color:'#64748b', fontSize:'13px'}}>Active Courses</div></div>
                  </div>
                  <div className="stat-box">
                    <span style={{fontSize:'28px'}}>💰</span>
                    <div><div style={{fontSize:'24px', fontWeight:'700', color:'#16a34a'}}>{totalPaid.toLocaleString()} Ks</div><div style={{color:'#64748b', fontSize:'13px'}}>Total Invested</div></div>
                  </div>
                  <div className="stat-box">
                    <span style={{fontSize:'28px'}}>🏆</span>
                    <div><div style={{fontSize:'24px', fontWeight:'700'}}>{latestExam}</div><div style={{color:'#64748b', fontSize:'13px'}}>Latest Grade</div></div>
                  </div>
                </div>

                <h3 style={{fontSize:'18px', marginBottom:'15px', color:'#1e293b'}}>Recent Activity</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Course</th>
                                <th>Amount</th>
                                <th style={{textAlign:'center'}}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.slice(0, 3).map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{fontWeight:'600'}}>{p.course_name}</div>
                                        <div style={{fontSize:'12px', color:'#64748b'}}>{p.batch_name}</div>
                                    </td>
                                    <td style={{fontWeight:'bold'}}>{Number(p.amount).toLocaleString()} Ks</td>
                                    <td style={{textAlign:'center'}}>
                                        <span className={`status-badge ${p.status === 'verified' ? 'bg-verified' : p.status === 'rejected' ? 'bg-rejected' : 'bg-pending'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#64748b'}}>No recent activity.</td></tr>}
                        </tbody>
                    </table>
                </div>
              </div>
            )}

            {/* 2. CLASSROOM */}
            {activeTab === 'classroom' && (
              <div>
                <h2 style={{fontSize:'22px', marginBottom:'20px', color:'#1e293b'}}>My Classroom</h2>
                <div className="course-grid">
                  {allClasses.map(cls => {
                    const daysLeft = getDaysRemaining(cls.expire_date);
                    const isExpired = daysLeft <= 0;
                    const isRejected = cls.status === 'rejected'; 
                    const isPending = cls.status === 'pending';

                    return (
                      <div key={cls.id} style={styles.card}>
                        {/* Color Strip */}
                        <div style={{position:'absolute', top:0, left:0, right:0, height:'4px', background: isRejected ? '#dc2626' : (isPending ? '#f59e0b' : (isExpired ? '#ef4444' : '#2563eb')), borderTopLeftRadius:'16px', borderTopRightRadius:'16px'}}></div>
                        
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', marginTop:'8px'}}>
                          <span className={`status-badge ${isRejected ? 'bg-rejected' : isPending ? 'bg-pending' : 'bg-verified'}`}>
                            {cls.status}
                          </span>
                          {!isRejected && !isPending && <span style={{fontSize:'12px', fontWeight:'600', color: isExpired ? '#ef4444' : '#16a34a'}}>{isExpired ? 'Expired' : `${daysLeft} Days Left`}</span>}
                        </div>

                        <h3 style={{fontSize:'18px', margin:'0 0 4px 0', color:'#1e293b'}}>{cls.course_name}</h3>
                        <p style={{fontSize:'14px', color:'#64748b', margin:'0 0 20px 0'}}>{cls.batch_name}</p>
                        
                        <div style={{marginTop:'auto'}}>
                          {isRejected ? (
                            <button disabled style={{width:'100%', padding:'12px', background:'#f1f5f9', color:'#94a3b8', border:'none', borderRadius:'8px', cursor:'not-allowed'}}>⛔ Access Revoked</button>
                          ) : isPending ? (
                            <button disabled style={{width:'100%', padding:'12px', background:'#fffbeb', color:'#d97706', border:'none', borderRadius:'8px', cursor:'wait'}}>⏳ Verification Pending</button>
                          ) : isExpired ? (
                            <button onClick={() => handleRenew(cls.batch_id)} style={{width:'100%', padding:'12px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer'}}>↻ Renew Subscription</button>
                          ) : (
                            <button onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)} style={{width:'100%', padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer'}}>▶ Enter Class</button>
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
                <h2 style={{fontSize:'22px', marginBottom:'20px', color:'#1e293b'}}>Manage Payments</h2>
                
                <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
                
                <h3 style={{fontSize:'18px', margin:'40px 0 15px 0', color:'#1e293b'}}>Payment History</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Course Info</th>
                                <th>Amount</th>
                                <th style={{textAlign:'center'}}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{fontWeight:'600', color:'#1e293b'}}>{p.course_name}</div>
                                        <div style={{fontSize:'12px', color:'#64748b'}}>{p.batch_name}</div>
                                    </td>
                                    <td style={{fontWeight:'bold', color:'#334155'}}>{Number(p.amount).toLocaleString()} Ks</td>
                                    <td style={{textAlign:'center'}}>
                                        <span className={`status-badge ${p.status === 'verified' ? 'bg-verified' : p.status === 'rejected' ? 'bg-rejected' : 'bg-pending'}`}>
                                            {p.status === 'verified' ? 'SUCCESS' : p.status === 'rejected' ? 'REJECTED' : 'PENDING'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'30px'}}>No transaction history.</td></tr>}
                        </tbody>
                    </table>
                </div>
              </div>
            )}

            {/* 4. EXAMS */}
            {activeTab === 'exams' && (
              <div>
                <h2 style={{fontSize:'22px', marginBottom:'20px', color:'#1e293b'}}>Exam Results</h2>
                <ExamList exams={exams} />
              </div>
            )}

            {/* 5. PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <h2 style={{fontSize:'22px', marginBottom:'20px', color:'#1e293b'}}>My Profile</h2>
                <StudentCard student={student} onUpdate={refreshData} />
              </div>
            )}

          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <div className="mobile-nav">
           <div className={`mobile-menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <span style={{fontSize:'20px'}}>📊</span> Overview
           </div>
           <div className={`mobile-menu-item ${activeTab === 'classroom' ? 'active' : ''}`} onClick={() => setActiveTab('classroom')}>
              <span style={{fontSize:'20px'}}>📚</span> Classes
           </div>
           <div className={`mobile-menu-item ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
              <span style={{fontSize:'20px'}}>💳</span> Pay
           </div>
           <div className={`mobile-menu-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>
              <span style={{fontSize:'20px'}}>📝</span> Exams
           </div>
           <div className={`mobile-menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <span style={{fontSize:'20px'}}>👤</span> Profile
           </div>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;