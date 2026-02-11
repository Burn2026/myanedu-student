import React, { useState } from 'react';
import Classroom from './Classroom'; 
import PaymentList from './PaymentList';

function StudentDashboard({ student, payments, exams, onLogout, refreshData, preSelectedBatch }) {
  const [activeTab, setActiveTab] = useState(preSelectedBatch ? 'payment' : 'overview');
  const [selectedClass, setSelectedClass] = useState(null);

  // Stats - Verified ဖြစ်သော payment များကိုသာ တွက်ချက်မည်
  const activePayments = payments.filter(p => p.status === 'verified');
  const totalPaid = activePayments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (selectedClass) {
    return <Classroom batchId={selectedClass.id} courseName={selectedClass.name} onBack={() => setSelectedClass(null)} studentName={student.name} />;
  }

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-container { display: flex; flex-direction: column; min-height: 100vh; background: #f1f5f9; }
        .top-nav { height: 60px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; padding: 0 15px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; }
        .main-body { display: flex; margin-top: 60px; flex: 1; }
        .sidebar { width: 240px; background: white; border-right: 1px solid #e2e8f0; position: fixed; height: calc(100vh - 60px); padding: 20px 0; }
        .main-content { flex: 1; margin-left: 240px; padding: 20px; width: 100%; }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { margin-left: 0; padding: 15px; padding-bottom: 80px; }
          .mobile-bottom-nav { display: flex !important; position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #e2e8f0; height: 65px; justify-content: space-around; align-items: center; z-index: 1000; }
          .nav-item { display: flex; flexDirection: column; align-items: center; font-size: 11px; color: #64748b; cursor: pointer; }
          .nav-item.active { color: #2563eb; font-weight: bold; }
        }
        
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .status-verified { background: #dcfce7; color: #166534; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-pending { background: #fef9c3; color: #854d0e; }
      `}</style>

      <div className="dashboard-container">
        {/* Top Header */}
        <div className="top-nav">
          <div style={{fontWeight: 'bold', color: '#2563eb'}}>🎓 MyanEdu Portal</div>
          <button onClick={onLogout} style={{padding: '5px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '5px', fontSize: '12px'}}>Logout</button>
        </div>

        <div className="main-body">
          {/* Sidebar (Desktop only) */}
          <div className="sidebar">
             {['overview', 'classroom', 'payment'].map(tab => (
               <div key={tab} onClick={() => setActiveTab(tab)} style={{padding: '12px 25px', cursor: 'pointer', background: activeTab === tab ? '#eff6ff' : 'transparent', color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: activeTab === tab ? 'bold' : 'normal', borderRight: activeTab === tab ? '3px solid #2563eb' : 'none'}}>
                 {tab === 'overview' ? '📊 Overview' : tab === 'classroom' ? '📚 My Classes' : '💳 Payments'}
               </div>
             ))}
          </div>

          <div className="main-content">
            {activeTab === 'overview' && (
              <div>
                <h2>Welcome, {student.name}</h2>
                <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px'}}>
                  <p style={{margin: 0, color: '#64748b'}}>Total Invested</p>
                  <h3 style={{margin: '5px 0', fontSize: '24px'}}>{totalPaid.toLocaleString()} Ks</h3>
                </div>
                <h3>Recent Payments</h3>
                <PaymentList payments={payments} />
              </div>
            )}

            {activeTab === 'classroom' && (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px'}}>
                {payments.map(cls => (
                  <div key={cls.id} style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative'}}>
                     <span className={`status-badge status-${cls.status}`} style={{position: 'absolute', top: '15px', right: '15px'}}>
                        {cls.status.toUpperCase()}
                     </span>
                     <h3 style={{fontSize: '17px', marginBottom: '5px'}}>{cls.course_name}</h3>
                     <p style={{fontSize: '13px', color: '#64748b'}}>{cls.batch_name}</p>
                     <div style={{marginTop: '20px'}}>
                        {cls.status === 'verified' ? (
                           <button onClick={() => setSelectedClass({id: cls.batch_id, name: cls.course_name})} style={{width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>▶ Enter Class</button>
                        ) : cls.status === 'rejected' ? (
                           <button disabled style={{width: '100%', padding: '10px', background: '#f1f5f9', color: '#94a3b8', border: 'none', borderRadius: '8px'}}>🚫 Access Denied</button>
                        ) : (
                           <button disabled style={{width: '100%', padding: '10px', background: '#fffbeb', color: '#d97706', border: 'none', borderRadius: '8px'}}>⏳ Verifying...</button>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h2 style={{marginBottom: '20px'}}>💳 Payment History</h2>
                <div style={{background: 'white', borderRadius: '10px', overflowX: 'auto'}}>
                   <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '500px'}}>
                      <thead style={{background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                         <tr>
                            <th style={{padding: '12px', textAlign: 'left'}}>Date</th>
                            <th style={{padding: '12px', textAlign: 'left'}}>Course</th>
                            <th style={{padding: '12px', textAlign: 'center'}}>Status</th>
                         </tr>
                      </thead>
                      <tbody>
                         {payments.map(p => (
                            <tr key={p.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                               <td style={{padding: '12px', fontSize: '13px'}}>{new Date(p.payment_date).toLocaleDateString()}</td>
                               <td style={{padding: '12px', fontSize: '14px', fontWeight: 'bold'}}>{p.course_name}</td>
                               <td style={{padding: '12px', textAlign: 'center'}}>
                                  <span className={`status-badge status-${p.status}`}>{p.status === 'verified' ? 'အောင်မြင်' : p.status === 'rejected' ? 'ငြင်းပယ်ခံရ' : 'စောင့်ဆိုင်းဆဲ'}</span>
                                </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="mobile-bottom-nav" style={{display: 'none'}}>
           <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><span>📊</span>Overview</div>
           <div className={`nav-item ${activeTab === 'classroom' ? 'active' : ''}`} onClick={() => setActiveTab('classroom')}><span>📚</span>Classes</div>
           <div className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}><span>💳</span>Payments</div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;