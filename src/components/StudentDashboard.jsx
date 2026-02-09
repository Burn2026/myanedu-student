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

  // Stats Logic
  const totalPaid = payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + Number(p.amount), 0);
  const uniqueCourses = Array.from(new Set(payments.map(p => p.course_name))); 
  const totalCourses = uniqueCourses.length;
  const latestExam = exams.length > 0 ? exams[0].grade : '-';
  const allClasses = payments; 

  // ရက်ကျန်တွက်ချက်သည့် Function
  const getDaysRemaining = (expireDate) => {
    if (!expireDate) return 0;
    const today = new Date();
    const exp = new Date(expireDate);
    const diffTime = exp - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const handleEnterClass = (batchId, courseName, expireDate, status) => {
    // 1. Verification Status စစ်ဆေးခြင်း
    if (status !== 'verified') {
        alert("🔒 Access Denied.\nYour payment is pending or rejected. Please contact admin.");
        return;
    }

    // 2. Expiration စစ်ဆေးခြင်း
    const daysLeft = getDaysRemaining(expireDate);
    if (daysLeft <= 0) {
        alert("⚠️ Subscription Expired!\nPlease renew your subscription to continue learning.");
        return;
    }

    if (!batchId) {
        alert("Error: Batch ID not found.");
        return;
    }
    setSelectedClass({ id: batchId, name: courseName });
  };

  const handleRenew = (batchId) => {
      setRenewBatchId(batchId);
      setActiveTab('payment'); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Class ရွေးပြီးပါက Classroom Component ကို ပြသမည်
  if (selectedClass) {
    return (
      <Classroom 
        batchId={selectedClass.id} 
        courseName={selectedClass.name} 
        onBack={() => setSelectedClass(null)} 
        studentName={student.name} // Discussion အတွက် နာမည်ပို့ပေးခြင်း
      />
    );
  }

  const premiumCardStyle = {
    padding: '25px', 
    background: 'white', 
    borderRadius: '16px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
    border: '1px solid #f1f5f9',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div className="dashboard-layout">
      
      {/* HEADER BAR */}
      <div className="dashboard-header" style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '70px', 
          background: 'white', borderBottom: '1px solid #e2e8f0', zIndex: 9999,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
          <div style={{fontWeight: '800', fontSize: '20px', color: '#2563eb', display:'flex', alignItems:'center', gap:'10px'}}>
             <span>🎓</span> MyanEdu Portal
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}} onClick={() => setActiveTab('profile')}>
                  <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column'}}>
                      <span style={{fontWeight: 'bold', color: '#1e293b', fontSize: '14px'}}>{student.name}</span>
                      <span style={{fontSize: '11px', color: '#64748b'}}>Student</span>
                  </div>
                  <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', 
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #e2e8f0'
                  }}>
                      {student.profile_image ? (
                          <img 
                            src={`https://myanedu-backend.onrender.com/${student.profile_image}?t=${Date.now()}`} 
                            alt="profile" 
                            style={{width:'100%', height:'100%', objectFit:'cover'}} 
                          />
                      ) : (
                          <span style={{fontWeight: 'bold', color: '#64748b', fontSize: '16px'}}>{student.name.charAt(0)}</span>
                      )}
                  </div>
              </div>
              <div style={{width: '1px', height: '30px', background: '#e2e8f0'}}></div>
              <button onClick={onLogout} style={{
                  padding: '8px 16px', background: '#fee2e2', color: '#ef4444', 
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                  transition: '0.2s'
              }}>
                  Logout
              </button>
          </div>
      </div>

      {/* Sidebar */}
      <div className="dashboard-sidebar" style={{marginTop: '70px', height: 'calc(100vh - 70px)'}}>
        <div className="sidebar-menu">
          {['overview', 'classroom', 'payment', 'exams', 'profile'].map(tab => (
            <div 
                key={tab}
                className={`menu-item ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab)}
                style={{textTransform: 'capitalize'}}
            >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'classroom' && '📚 My Classes'}
                {tab === 'payment' && '💳 Payments'}
                {tab === 'exams' && '📝 Exam Results'}
                {tab === 'profile' && '👤 My Profile'}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content" style={{marginTop: '70px'}}>
        
        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="dashboard-title">Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon" style={{background: '#dbeafe', color: '#2563eb'}}>📚</div><div className="stat-info"><h4>Courses Joined</h4><p>{totalCourses}</p></div></div>
              <div className="stat-card"><div className="stat-icon" style={{background: '#dcfce7', color: '#16a34a'}}>💵</div><div className="stat-info"><h4>Total Payments</h4><p>{totalPaid.toLocaleString()} Ks</p></div></div>
              <div className="stat-card"><div className="stat-icon" style={{background: '#fef9c3', color: '#ca8a04'}}>🏆</div><div className="stat-info"><h4>Latest Grade</h4><p>{latestExam}</p></div></div>
            </div>

            {/* Overview Active Classes */}
            {allClasses.filter(c => c.status === 'verified').length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🚀 Ready to Learn 
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {allClasses.filter(c => c.status === 'verified').map(cls => {
                            const daysLeft = getDaysRemaining(cls.expire_date);
                            const isExpired = daysLeft <= 0;

                            return (
                                <div key={cls.id} className="course-card" style={premiumCardStyle}>
                                    <div style={{position:'absolute', top:0, left:0, right:0, height:'4px', background: isExpired ? '#ef4444' : 'linear-gradient(to right, #2563eb, #60a5fa)'}}></div>
                                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ 
                                            background: isExpired ? '#fee2e2' : '#eff6ff', 
                                            color: isExpired ? '#ef4444' : '#2563eb', 
                                            padding: '5px 10px', borderRadius: '20px', 
                                            fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' 
                                        }}>
                                            {isExpired ? 'Expired' : 'Active'}
                                        </span>
                                        <span style={{ fontSize: '11px', color: isExpired ? '#ef4444' : '#16a34a', fontWeight: 'bold' }}>
                                            {isExpired ? '0 Days Left' : `${daysLeft} Days Left`}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '18px' }}>{cls.course_name}</h3>
                                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>{cls.batch_name}</p>
                                    
                                    {isExpired ? (
                                        <button onClick={() => handleRenew(cls.batch_id)} style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'auto' }}>
                                            <span>↻</span> Renew Subscription
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)} style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'auto' }}>
                                            <span>▶</span> Start Learning
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <h3>Recent Activity</h3>
            <PaymentList payments={payments.slice(0, 3)} student={student} />
          </div>
        )}

        {/* 2. My Classes Tab */}
        {activeTab === 'classroom' && (
          <div>
            <h2 className="dashboard-title">📚 My Classroom</h2>
            <p style={{color: '#64748b', marginBottom: '20px'}}>သင်တန်းများအားလုံးကို ဤနေရာတွင် စုစည်းပြသထားပါသည်။</p>

            {allClasses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <p style={{fontSize: '18px', fontWeight: 'bold', color: '#94a3b8'}}>No Classes Found</p>
                    <p style={{color: '#64748b'}}>သင်တန်းမရှိသေးပါ။ ကျေးဇူးပြု၍ စာရင်းသွင်းပါ။</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {allClasses.map(cls => {
                        const daysLeft = getDaysRemaining(cls.expire_date);
                        const isExpired = daysLeft <= 0;
                        const isRejected = cls.status === 'rejected'; 
                        const isPending = cls.status === 'pending';

                        // Card Status Color Logic
                        let statusColor = '#2563eb'; // Default Active
                        let statusBg = '#eff6ff';
                        let statusText = 'Active';

                        if (isRejected) {
                            statusColor = '#dc2626'; statusBg = '#fef2f2'; statusText = 'REJECTED';
                        } else if (isPending) {
                            statusColor = '#d97706'; statusBg = '#fffbeb'; statusText = 'PENDING';
                        } else if (isExpired) {
                            statusColor = '#ef4444'; statusBg = '#fee2e2'; statusText = 'EXPIRED';
                        }

                        return (
                            <div key={cls.id} className="course-card" style={premiumCardStyle}>
                                {/* Top Bar Color */}
                                <div style={{
                                    position:'absolute', top:0, left:0, right:0, height:'4px', 
                                    background: isRejected ? '#dc2626' : (isExpired ? '#ef4444' : 'linear-gradient(to right, #2563eb, #60a5fa)')
                                }}></div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                    <div style={{width: '50px', height: '50px', background: statusBg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
                                        {isRejected ? '🚫' : (isPending ? '⏳' : (isExpired ? '⌛' : '🎓'))}
                                    </div>
                                    <span style={{ 
                                        background: statusBg, 
                                        color: statusColor, 
                                        padding: '4px 10px', borderRadius: '20px', 
                                        fontSize: '11px', fontWeight: 'bold' 
                                    }}>
                                        {statusText}
                                    </span>
                                </div>
                                
                                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '18px' }}>{cls.course_name}</h3>
                                <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>{cls.batch_name}</p>
                                
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginTop: 'auto', width: '100%' }}>
                                    {isRejected ? (
                                        <button disabled style={{ width: '100%', padding: '12px', background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold', fontSize: '14px' }}>
                                            ⛔ Access Denied
                                        </button>
                                    ) : isPending ? (
                                        <button disabled style={{ width: '100%', padding: '12px', background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', cursor: 'wait', fontWeight: 'bold', fontSize: '14px' }}>
                                            ⏳ Waiting Approval
                                        </button>
                                    ) : isExpired ? (
                                        <button 
                                            onClick={() => handleRenew(cls.batch_id)}
                                            style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                                            Renew Subscription
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)}
                                            style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                                            အတန်းထဲဝင်မည် (Enter Class)
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </div>
        )}

        {/* 3. Exam Results Tab */}
        {activeTab === 'exams' && (
          <div>
            <h2 className="dashboard-title">📝 Exam Results</h2>
            <ExamList exams={exams} />
          </div>
        )}

        {/* 4. Payment Tab */}
        {activeTab === 'payment' && (
          <div>
            <h2 className="dashboard-title">Manage Payments</h2>
            <OnlinePayment 
                student={student} 
                onPaymentSuccess={refreshData} 
                preSelectedBatch={renewBatchId || preSelectedBatch} 
            />
            <div style={{marginTop: '30px'}}><PaymentList payments={payments} student={student} /></div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
              <h2 className="dashboard-title">My Profile</h2>
              <StudentCard student={student} onUpdate={refreshData} />
          </div>
        )}

      </div>
    </div>
  );
}

export default StudentDashboard;