import React, { useState } from 'react';
import StudentCard from './StudentCard';
import PaymentList from './PaymentList';
import OnlinePayment from './OnlinePayment';
import ExamList from './ExamList';
import Classroom from './Classroom'; 

function StudentDashboard({ student, payments, exams, onLogout, refreshData, preSelectedBatch }) {
  const [activeTab, setActiveTab] = useState(preSelectedBatch ? 'payment' : 'overview');
  const [selectedClass, setSelectedClass] = useState(null); 
  const [renewBatchId, setRenewBatchId] = useState(null);

  // ✅ Stats Logic (Verified ဖြစ်တဲ့ Payment တွေကိုပဲ ပေါင်းမည်)
  const totalPaid = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + Number(p.amount), 0);
  const activePayments = payments.filter(p => p.status === 'verified');
  const uniqueCourses = Array.from(new Set(activePayments.map(p => p.course_name))); 
  const totalCourses = uniqueCourses.length;
  const latestExam = exams.length > 0 ? exams[0].grade : '-';
  
  // My Classes အတွက် payments အားလုံးကို ယူမည်
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
    return (
      <Classroom 
        batchId={selectedClass.id} 
        courseName={selectedClass.name} 
        onBack={() => setSelectedClass(null)} 
        studentName={student.name}
      />
    );
  }

  const premiumCardStyle = {
    padding: '20px', 
    background: 'white', 
    borderRadius: '16px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
    border: '1px solid #f1f5f9',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  return (
    <div className="dashboard-container">
      
      {/* --- RESPONSIVE SIDEBAR & CONTENT LAYOUT --- */}
      <style>{`
        .dashboard-layout { display: flex; flex-direction: column; min-height: 100vh; background: #f8fafc; }
        .dashboard-header { height: 70px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; alignItems: center; padding: 0 20px; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
        .main-wrapper { display: flex; margin-top: 70px; flex: 1; }
        .sidebar { width: 260px; background: white; border-right: 1px solid #e2e8f0; position: fixed; height: calc(100vh - 70px); overflow-y: auto; padding: 20px 0; z-index: 999; transition: transform 0.3s; }
        .content { flex: 1; margin-left: 260px; padding: 30px; transition: margin-left 0.3s; }
        .menu-item { padding: 14px 24px; cursor: pointer; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .menu-item:hover { background: #f1f5f9; color: #2563eb; }
        .menu-item.active { background: #eff6ff; color: #2563eb; border-right: 3px solid #2563eb; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        
        @media (max-width: 992px) {
          .sidebar { transform: translateX(-100%); width: 0; padding: 0; }
          .content { margin-left: 0; padding: 20px; }
          .mobile-nav { display: flex !important; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; z-index: 1001; height: 60px; justify-content: space-around; align-items: center; }
          .dashboard-content { padding-bottom: 80px; }
        }
      `}</style>

      <div className="dashboard-layout">
        <div className="dashboard-header">
           <div style={{fontWeight: '800', fontSize: '18px', color: '#2563eb'}}>🎓 MyanEdu</div>
           <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <span style={{fontWeight: '600', fontSize: '14px', color: '#1e293b'}} className="hide-mobile">{student.name}</span>
              <button onClick={onLogout} style={{padding: '6px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px'}}>Logout</button>
           </div>
        </div>

        <div className="main-wrapper">
          {/* Desktop Sidebar */}
          <div className="sidebar">
            {['overview', 'classroom', 'payment', 'exams', 'profile'].map(tab => (
              <div key={tab} className={`menu-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'overview' && '📊 Overview'}
                {tab === 'classroom' && '📚 My Classes'}
                {tab === 'payment' && '💳 Payments'}
                {tab === 'exams' && '📝 Exams'}
                {tab === 'profile' && '👤 Profile'}
              </div>
            ))}
          </div>

          <div className="content">
            {/* 1. Overview */}
            {activeTab === 'overview' && (
              <div>
                <h2 style={{marginBottom: '20px'}}>Welcome Back, {student.name}!</h2>
                <div className="stats-grid">
                  <div className="stat-card" style={{background:'white', padding:'20px', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                    <p style={{color:'#64748b', fontSize:'13px', margin:0}}>Joined Courses</p>
                    <h3 style={{fontSize:'24px', margin:'5px 0'}}>{totalCourses}</h3>
                  </div>
                  <div className="stat-card" style={{background:'white', padding:'20px', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                    <p style={{color:'#64748b', fontSize:'13px', margin:0}}>Total Invested</p>
                    <h3 style={{fontSize:'24px', margin:'5px 0', color:'#16a34a'}}>{totalPaid.toLocaleString()} Ks</h3>
                  </div>
                  <div className="stat-card" style={{background:'white', padding:'20px', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                    <p style={{color:'#64748b', fontSize:'13px', margin:0}}>Latest Grade</p>
                    <h3 style={{fontSize:'24px', margin:'5px 0', color:'#ca8a04'}}>{latestExam}</h3>
                  </div>
                </div>
                
                <h3 style={{marginBottom: '15px'}}>Recent Payments</h3>
                <PaymentList payments={payments.slice(0, 5)} student={student} />
              </div>
            )}

            {/* 2. My Classes */}
            {activeTab === 'classroom' && (
              <div>
                <h2 style={{marginBottom: '20px'}}>📚 My Classroom</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {allClasses.map(cls => {
                    const daysLeft = getDaysRemaining(cls.expire_date);
                    const isExpired = daysLeft <= 0;
                    const isRejected = cls.status === 'rejected'; 
                    const isPending = cls.status === 'pending';

                    return (
                      <div key={cls.id} style={premiumCardStyle}>
                        <div style={{position:'absolute', top:0, left:0, right:0, height:'4px', background: isRejected ? '#dc2626' : (isPending ? '#f59e0b' : (isExpired ? '#ef4444' : '#2563eb'))}}></div>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                          <span style={{padding:'4px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:'bold', background: isRejected ? '#fee2e2' : (isPending ? '#fef3c7' : '#eff6ff'), color: isRejected ? '#dc2626' : (isPending ? '#d97706' : '#2563eb')}}>
                            {cls.status.toUpperCase()}
                          </span>
                          {!isRejected && !isPending && <span style={{fontSize:'11px', color: isExpired ? '#ef4444' : '#16a34a'}}>{isExpired ? 'Expired' : `${daysLeft} Days Left`}</span>}
                        </div>
                        <h3 style={{fontSize:'17px', margin:'0 0 5px 0'}}>{cls.course_name}</h3>
                        <p style={{fontSize:'13px', color:'#64748b', marginBottom:'20px'}}>{cls.batch_name}</p>
                        
                        <div style={{marginTop:'auto'}}>
                          {isRejected ? (
                            <button disabled style={{width:'100%', padding:'10px', background:'#f1f5f9', color:'#94a3b8', border:'none', borderRadius:'8px'}}>⛔ Access Revoked</button>
                          ) : isPending ? (
                            <button disabled style={{width:'100%', padding:'10px', background:'#fffbeb', color:'#d97706', border:'none', borderRadius:'8px'}}>⏳ Verifying Payment...</button>
                          ) : isExpired ? (
                            <button onClick={() => handleRenew(cls.batch_id)} style={{width:'100%', padding:'10px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold'}}>↻ Renew Subscription</button>
                          ) : (
                            <button onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)} style={{width:'100%', padding:'10px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold'}}>▶ Enter Class</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h2>💳 Payment Management</h2>
                <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
                <div style={{marginTop: '30px'}}><PaymentList payments={payments} student={student} /></div>
              </div>
            )}

            {activeTab === 'exams' && <ExamList exams={exams} />}
            {activeTab === 'profile' && <StudentCard student={student} onUpdate={refreshData} />}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-nav" style={{display: 'none'}}>
           <div onClick={() => setActiveTab('overview')} style={{color: activeTab === 'overview' ? '#2563eb' : '#64748b', fontSize: '20px'}}>📊</div>
           <div onClick={() => setActiveTab('classroom')} style={{color: activeTab === 'classroom' ? '#2563eb' : '#64748b', fontSize: '20px'}}>📚</div>
           <div onClick={() => setActiveTab('payment')} style={{color: activeTab === 'payment' ? '#2563eb' : '#64748b', fontSize: '20px'}}>💳</div>
           <div onClick={() => setActiveTab('profile')} style={{color: activeTab === 'profile' ? '#2563eb' : '#64748b', fontSize: '20px'}}>👤</div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;