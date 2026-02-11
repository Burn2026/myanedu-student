import React, { useState } from 'react';
import './StudentDashboard.css'; // Import CSS
import StudentCard from './StudentCard';
import OnlinePayment from './OnlinePayment';
import ExamList from './ExamList';
import Classroom from './Classroom';
import jsPDF from 'jspdf';

function StudentDashboard({ student, payments, exams, onLogout, refreshData, preSelectedBatch }) {
  const [activeTab, setActiveTab] = useState(preSelectedBatch ? 'payment' : 'overview');
  const [selectedClass, setSelectedClass] = useState(null); 
  const [renewBatchId, setRenewBatchId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Stats Logic
  const activePayments = payments.filter(p => p.status === 'verified');
  const totalPaid = activePayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCourses = new Set(activePayments.map(p => p.course_name)).size;
  const allClasses = payments; 

  const getDaysRemaining = (expireDate) => {
    if (!expireDate) return 0;
    const diff = new Date(expireDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); 
  };

  const handleEnterClass = (batchId, courseName, expireDate, status) => {
    if (status !== 'verified') return alert("Access Denied.");
    if (getDaysRemaining(expireDate) <= 0) return alert("Subscription Expired!");
    setSelectedClass({ id: batchId, name: courseName });
  };

  const handleRenew = (batchId) => {
      setRenewBatchId(batchId); setActiveTab('payment'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateReceipt = (payment) => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); doc.text("MyanEdu Portal", 105, 20, null, null, "center");
    
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    const receiptID = payment.transaction_id || payment.id.substring(0, 8);
    doc.text(`Receipt ID: #${receiptID}`, 20, 60);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 150, 60);
    
    doc.text(`Student: ${student.name}`, 30, 80); 
    doc.text(`Course: ${payment.course_name}`, 30, 100);
    doc.text(`Amount: ${Number(payment.amount).toLocaleString()} Ks`, 30, 110);
    
    doc.save(`Receipt_${student.name}.pdf`);
  };

  if (selectedClass) {
    return <Classroom batchId={selectedClass.id} courseName={selectedClass.name} onBack={() => setSelectedClass(null)} studentName={student.name} />;
  }

  return (
    <div className="dashboard-root">
      
      {/* SIDEBAR */}
      <div className="sidebar">
         {[{id: 'overview', icon: '📊', label: 'Overview'}, {id: 'classroom', icon: '📚', label: 'My Classes'}, {id: 'payment', icon: '💳', label: 'Payments'}, {id: 'exams', icon: '📝', label: 'Exams'}, {id: 'profile', icon: '👤', label: 'Profile'}].map(item => (
           <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
             <span className="nav-icon">{item.icon}</span>{item.label}
           </div>
         ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="welcome-title">Welcome back, {student.name}!</h2>
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
            
            <h3 style={{fontSize:'18px', fontWeight:'700', margin:'30px 0 15px 0'}}>Recent Activity</h3>
            <div className="history-list">
                {payments.slice(0, 3).map(p => (
                    <div key={p.id} className="history-card" onClick={() => setSelectedPayment(p)}>
                        <div className="history-info">
                            <div className="history-course">{p.course_name}</div>
                            <div className="history-meta">
                                <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                                {/* ✅ Fix 1: Transaction ID ပြသခြင်း */}
                                <span className="history-id">
                                    {p.transaction_id ? `#${p.transaction_id}` : 'Processing...'}
                                </span>
                            </div>
                        </div>
                        <span className={`badge ${p.status}`}>{p.status}</span>
                    </div>
                ))}
                {payments.length === 0 && <div className="premium-card" style={{textAlign:'center', color:'#94a3b8'}}>No recent activity.</div>}
            </div>
          </div>
        )}

        {/* --- CLASSROOM TAB --- */}
        {activeTab === 'classroom' && (
          <div className="course-grid">
              {allClasses.map(cls => {
                const isRejected = cls.status === 'rejected';
                const isPending = cls.status === 'pending';
                const isExpired = getDaysRemaining(cls.expire_date) <= 0;
                return (
                  <div key={cls.id} className="premium-card" style={{borderTop: `4px solid ${isRejected?'#ef4444':isPending?'#eab308':'#2563eb'}`}}>
                    <h3 style={{fontSize:'17px', margin:'0 0 5px 0'}}>{cls.course_name}</h3>
                    <p style={{fontSize:'13px', color:'#64748b'}}>{cls.batch_name}</p>
                    <div style={{marginTop:'15px'}}>
                        <button 
                            onClick={() => !isRejected && !isPending && handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)}
                            disabled={isRejected || isPending}
                            style={{width:'100%', padding:'10px', background: isRejected?'#f1f5f9':'#2563eb', color: isRejected?'#94a3b8':'white', border:'none', borderRadius:'8px', fontWeight:'bold'}}
                        >
                            {isRejected ? 'Access Revoked' : isPending ? 'Pending...' : isExpired ? 'Renew Now' : 'Enter Class'}
                        </button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {/* --- PAYMENT TAB --- */}
        {activeTab === 'payment' && (
          <div>
            <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'20px'}}>Manage Payments</h2>
            <div style={{maxWidth:'600px', margin:'0 auto'}}>
                <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
            </div>
            <h3 style={{fontSize:'18px', fontWeight:'700', margin:'40px 0 15px 0'}}>Payment History</h3>
            <div className="history-list">
                {payments.map(p => (
                    <div key={p.id} className="history-card" onClick={() => setSelectedPayment(p)}>
                        <div className="history-info">
                            <div className="history-course">{p.course_name}</div>
                            <div className="history-meta">
                                {/* ✅ Fix 2: Transaction ID in full list */}
                                <span className="history-id">
                                    {p.transaction_id ? `#${p.transaction_id}` : 'Processing...'}
                                </span>
                                <span>• {new Date(p.payment_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <span className={`badge ${p.status}`}>{p.status}</span>
                            <div style={{fontSize:'10px', color:'#94a3b8', marginTop:'4px'}}>View Details</div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'exams' && <div className="premium-card"><ExamList exams={exams} /></div>}
        {activeTab === 'profile' && <div style={{maxWidth:'600px', margin:'0 auto'}}><StudentCard student={student} onUpdate={refreshData} /></div>}
      </div>

      {/* Mobile Nav */}
      <div className="mobile-nav">
         {[{id: 'overview', icon: '📊', label: 'Overview'}, {id: 'classroom', icon: '📚', label: 'Classes'}, {id: 'payment', icon: '💳', label: 'Pay'}, {id: 'exams', icon: '📝', label: 'Exams'}, {id: 'profile', icon: '👤', label: 'Profile'}].map(item => (
           <div key={item.id} className={`mobile-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
             <span className="mobile-icon">{item.icon}</span><span>{item.label}</span>
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
                    <div className="pm-row"><span className="pm-label">Status</span><span className={`badge ${selectedPayment.status}`}>{selectedPayment.status.toUpperCase()}</span></div>
                    
                    {/* ✅ Fix 3: Transaction ID in Modal */}
                    <div className="pm-row">
                        <span className="pm-label">Transaction ID</span>
                        <span className="pm-value" style={{fontFamily:'monospace', background:'#f1f5f9', padding:'2px 5px', borderRadius:'4px'}}>
                            {selectedPayment.transaction_id || "N/A"}
                        </span>
                    </div>
                    
                    <div className="pm-row"><span className="pm-label">Date</span><span className="pm-value">{new Date(selectedPayment.payment_date).toLocaleString()}</span></div>
                    <div className="pm-row"><span className="pm-label">Method</span><span className="pm-value">{selectedPayment.payment_method}</span></div>
                    
                    {/* ✅ Screenshot Display */}
                    {selectedPayment.receipt_image && (
                        <div className="pm-receipt-box">
                            <p style={{fontSize:'12px', marginBottom:'8px', color:'#64748b'}}>Uploaded Screenshot:</p>
                            <img src={`https://myanedu-backend.onrender.com/${selectedPayment.receipt_image}`} alt="Receipt" className="pm-receipt-img" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                    )}
                </div>
                <div className="pm-actions">
                    {selectedPayment.status === 'verified' && (
                        <button className="btn-download" onClick={() => generateReceipt(selectedPayment)}>Download Receipt</button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;