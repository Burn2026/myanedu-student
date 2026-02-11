import React, { useState } from 'react';
import StudentCard from './StudentCard';
import OnlinePayment from './OnlinePayment';
import ExamList from './ExamList';
import Classroom from './Classroom';
import jsPDF from 'jspdf'; // PDF Download အတွက် import

function StudentDashboard({ student, payments, exams, onLogout, refreshData, preSelectedBatch }) {
  const [activeTab, setActiveTab] = useState(preSelectedBatch ? 'payment' : 'overview');
  const [selectedClass, setSelectedClass] = useState(null); 
  const [renewBatchId, setRenewBatchId] = useState(null);
  
  // (New) Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);

  // --- STATS LOGIC ---
  const activePayments = payments.filter(p => p.status === 'verified');
  const totalPaid = activePayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCourses = new Set(activePayments.map(p => p.course_name)).size;
  const latestExam = exams.length > 0 ? exams[0].grade : '-';
  const allClasses = payments; 

  // --- HELPERS ---
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

  // --- PDF GENERATION LOGIC ---
  const generateReceipt = (payment) => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); doc.text("MyanEdu Portal", 105, 20, null, null, "center");
    doc.setFontSize(14); doc.text("Official Receipt", 105, 30, null, null, "center");
    
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    doc.text(`Receipt ID: #${payment.transaction_id || payment.id.substring(0, 8)}`, 20, 60);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 150, 60);
    
    doc.setDrawColor(200); doc.rect(20, 70, 170, 25);
    doc.text(`Student: ${student.name}`, 30, 82); doc.text(`Phone: ${student.phone_primary}`, 120, 82);
    
    doc.setFontSize(14); doc.text("Payment Details", 20, 115);
    doc.setFillColor(240); doc.rect(20, 120, 170, 10, 'F');
    doc.setFontSize(12); doc.text("Description", 30, 126); doc.text("Amount", 160, 126);
    
    doc.text(payment.course_name, 30, 140);
    doc.text(`${Number(payment.amount).toLocaleString()} Ks`, 160, 140);
    doc.setFontSize(10); doc.text(`Method: ${payment.payment_method}`, 30, 146);
    
    doc.line(140, 155, 190, 155);
    doc.setFontSize(14); doc.text(`Total: ${Number(payment.amount).toLocaleString()} Ks`, 160, 165);
    
    doc.save(`Receipt_${student.name}.pdf`);
  };

  if (selectedClass) {
    return <Classroom batchId={selectedClass.id} courseName={selectedClass.name} onBack={() => setSelectedClass(null)} studentName={student.name} />;
  }

  return (
    <div className="dashboard-root">
      
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
             <span className="nav-icon">{item.icon}</span>
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
            {/* Using the new List View for Overview as well */}
            <div className="history-list">
                {payments.slice(0, 3).map(p => (
                    <div key={p.id} className="history-card" onClick={() => setSelectedPayment(p)}>
                        <div className="history-info">
                            <div className="history-course">{p.course_name}</div>
                            <div className="history-meta">
                                <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                                <span className="history-id">ID: {p.transaction_id || 'N/A'}</span>
                            </div>
                        </div>
                        <span className={`badge ${p.status}`}>{p.status}</span>
                    </div>
                ))}
                {payments.length === 0 && <p style={{textAlign:'center', color:'#94a3b8'}}>No recent activity.</p>}
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

        {/* 3. PAYMENT (UPDATED LIST VIEW) */}
        {activeTab === 'payment' && (
          <div>
            <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'20px'}}>Manage Payments</h2>
            <div style={{maxWidth:'600px', margin:'0 auto'}}>
                <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
            </div>
            
            <h3 style={{marginTop:'40px', marginBottom:'15px'}}>Payment History</h3>
            
            {/* NEW LIST VIEW instead of Table */}
            <div className="history-list">
                {payments.map(p => (
                    <div key={p.id} className="history-card" onClick={() => setSelectedPayment(p)}>
                        <div className="history-info">
                            <div className="history-course">{p.course_name}</div>
                            <div className="history-meta">
                                {/* Transaction ID & Date shown here */}
                                <span className="history-id">#{p.transaction_id || '....'}</span>
                                <span style={{fontSize:'11px'}}>• {new Date(p.payment_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                            {/* Status Badge */}
                            <span className={`badge ${p.status}`}>{p.status}</span>
                            <div style={{fontSize:'10px', color:'#94a3b8', marginTop:'4px'}}>Click for details</div>
                        </div>
                    </div>
                ))}
                {payments.length === 0 && <div className="premium-card" style={{textAlign:'center', color:'#64748b'}}>No transaction history found.</div>}
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

      {/* --- PAYMENT DETAIL MODAL --- */}
      {selectedPayment && (
        <div className="payment-modal-overlay" onClick={() => setSelectedPayment(null)}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pm-header">
                    <div>
                        <div className="pm-course-title">{selectedPayment.course_name}</div>
                        <div className="pm-batch">{selectedPayment.batch_name}</div>
                    </div>
                    <button className="pm-close" onClick={() => setSelectedPayment(null)}>×</button>
                </div>
                
                <div className="pm-body">
                    <div className="pm-amount">{Number(selectedPayment.amount).toLocaleString()} Ks</div>
                    
                    <div className="pm-row">
                        <span className="pm-label">Status</span>
                        <span className={`badge ${selectedPayment.status}`}>{selectedPayment.status.toUpperCase()}</span>
                    </div>
                    <div className="pm-row">
                        <span className="pm-label">Transaction ID</span>
                        <span className="pm-value">{selectedPayment.transaction_id || "N/A"}</span>
                    </div>
                    <div className="pm-row">
                        <span className="pm-label">Date</span>
                        <span className="pm-value">{new Date(selectedPayment.payment_date).toLocaleString()}</span>
                    </div>
                    <div className="pm-row">
                        <span className="pm-label">Method</span>
                        <span className="pm-value">{selectedPayment.payment_method}</span>
                    </div>

                    {selectedPayment.receipt_image && (
                        <div className="pm-receipt-box">
                            <p style={{fontSize:'12px', marginBottom:'8px'}}>Uploaded Screenshot:</p>
                            <img 
                                src={`https://myanedu-backend.onrender.com/${selectedPayment.receipt_image}`} 
                                alt="Receipt" 
                                className="pm-receipt-img"
                            />
                        </div>
                    )}
                </div>

                <div className="pm-actions">
                    {selectedPayment.status === 'verified' && (
                        <button className="btn-download" onClick={() => generateReceipt(selectedPayment)}>
                            <span>⬇️</span> Download Receipt
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;