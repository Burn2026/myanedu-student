import React, { useState, useEffect } from 'react';
import './StudentDashboard.css'; 
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
  const [previewImage, setPreviewImage] = useState(null);

  // Phone Mapping
  const accountInfo = {
    "KPay": "09123456789 (U Kyaw Kyaw)",
    "Wave": "09987654321 (Daw Mya Mya)",
    "CB": "001122334455 (U Ba Maung)"
  };

  // --- LOGIC 1: Filter & Merge Active Classes ---
  // Verified ဖြစ်ပြီးသားများကိုသာ ယူမည်၊ တူညီသော Course/Batch ဖြစ်ပါက ရက်ပေါင်းထည့်မည်
  const getUniqueActiveClasses = (allPayments) => {
    // 1. Verified payments only
    const verifiedPayments = allPayments.filter(p => p.status === 'verified');
    
    // 2. Group by Batch ID (or Course Name if needed)
    const classMap = new Map();

    verifiedPayments.forEach(p => {
        const key = p.batch_id; // Batch ID တူရင် ပေါင်းမည်
        
        // Expiry Date တွက်ချက်ခြင်း
        const expireDate = new Date(p.expire_date);
        const now = new Date();
        const daysLeft = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));

        if (classMap.has(key)) {
            // ရှိပြီးသားဆိုရင် ရက်တွေ ထပ်ပေါင်းမယ် (အကယ်၍ လိုအပ်ရင် Logic ပြင်နိုင်သည်)
            // လက်ရှိ Logic: နောက်ဆုံး expire_date ကိုပဲ ယူသုံးတာ ပိုမှန်ကန်လေ့ရှိပါတယ် (System က Auto တွက်ပေးထားလို့)
            // သို့သော် UI မှာ ရက်ပေါင်းပြချင်ရင် ဒီနေရာမှာ Logic ထပ်ဖြည့်နိုင်ပါတယ်
            
            // For simplicity and accuracy based on most LMS:
            // We usually take the entry with the FARTHEST expire date
            const existing = classMap.get(key);
            if (new Date(p.expire_date) > new Date(existing.expire_date)) {
                classMap.set(key, p);
            }
        } else {
            // အသစ်ဆိုရင် ထည့်မယ်
            classMap.set(key, p);
        }
    });

    return Array.from(classMap.values());
  };

  const activeClasses = getUniqueActiveClasses(payments); // For Classroom Tab
  
  // Stats Logic
  const activePayments = payments.filter(p => p.status === 'verified');
  const totalPaid = activePayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCourses = new Set(activePayments.map(p => p.course_name)).size;

  // Helpers
  const getDaysRemaining = (expireDate) => {
    if (!expireDate) return 0;
    const diff = new Date(expireDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)); 
  };

  const getDisplayID = (payment) => {
    const tID = payment.transaction_id || payment.trans_id || payment.tid;
    if (tID && String(tID) !== "null" && String(tID) !== "") {
        return String(tID);
    }
    return `#${payment.id}`;
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://myanedu-backend.onrender.com/${path}`;
  };

  const handleEnterClass = (batchId, courseName, expireDate, status) => {
    if (status !== 'verified') return alert("Access Denied.");
    if (getDaysRemaining(expireDate) <= 0) return alert("Subscription Expired! Please renew.");
    setSelectedClass({ id: batchId, name: courseName });
  };

  const handleRenew = (batchId) => {
      setRenewBatchId(batchId);
      setActiveTab('payment'); 
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateReceipt = (payment) => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); doc.text("MyanEdu Portal", 105, 20, null, null, "center");
    doc.setFontSize(14); doc.text("Official Payment Receipt", 105, 30, null, null, "center");
    
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    doc.text(`Receipt ID: ${getDisplayID(payment)}`, 20, 60);
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
      
      {/* SIDEBAR */}
      <div className="sidebar">
         {[
           {id: 'overview', icon: '📊', label: 'Overview'},
           {id: 'classroom', icon: '📚', label: 'My Classes'},
           {id: 'payment', icon: '💳', label: 'Payments'},
           {id: 'exams', icon: '📝', label: 'Exam Results'},
           {id: 'profile', icon: '👤', label: 'Profile'},
         ].map(item => (
           <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
             <span className="nav-icon">{item.icon}</span>{item.label}
           </div>
         ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="welcome-title">Welcome back, {student.name}!</h2>
            
            <div className="stats-grid">
              <div className="premium-card stat-box">
                <div className="stat-icon">📚</div>
                <div><div className="stat-value">{totalCourses}</div><div className="stat-label">Active Courses</div></div>
              </div>
              <div className="premium-card stat-box">
                <div className="stat-icon">💰</div>
                <div><div className="stat-value money">{totalPaid.toLocaleString()} Ks</div><div className="stat-label">Total Invested</div></div>
              </div>
            </div>

            <h3 className="section-title">Recent Activity</h3>
            <div className="history-list">
                {payments.slice(0, 3).map(p => (
                    <div key={p.id} className="history-card" onClick={() => setSelectedPayment(p)}>
                        <div className="history-info">
                            <div className="history-course">{p.course_name}</div>
                            <div className="history-meta">
                                <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                                <span className="history-id">{getDisplayID(p)}</span>
                            </div>
                        </div>
                        <span className={`badge ${p.status}`}>{p.status}</span>
                    </div>
                ))}
                {payments.length === 0 && <div className="premium-card no-data">No recent activity.</div>}
            </div>
          </div>
        )}

        {/* CLASSROOM TAB (✅ UPDATED LOGIC) */}
        {activeTab === 'classroom' && (
          <div>
            <h2 className="welcome-title">My Classroom</h2>
            <div className="course-grid">
              {activeClasses.length > 0 ? (
                  activeClasses.map(cls => {
                    const daysLeft = getDaysRemaining(cls.expire_date);
                    const isExpired = daysLeft <= 0;
                    
                    return (
                      <div key={cls.id} className="premium-card" style={{borderTop: `4px solid #2563eb`}}>
                        <div className="card-header">
                            <span className={`badge verified`}>VERIFIED</span>
                            <span className={`days-left ${isExpired ? 'expired' : ''}`}>{isExpired ? 'Expired' : `${daysLeft} Days Left`}</span>
                        </div>
                        <h3 className="card-title">{cls.course_name}</h3>
                        <p className="card-subtitle">{cls.batch_name}</p>
                        <div className="card-footer">
                          {isExpired ? 
                             <button onClick={() => handleRenew(cls.batch_id)} className="action-btn renew">Renew Now</button> :
                             <button onClick={() => handleEnterClass(cls.batch_id, cls.course_name, cls.expire_date, cls.status)} className="action-btn enter">Enter Class</button>
                          }
                        </div>
                      </div>
                    );
                  })
              ) : (
                  <div className="premium-card no-data" style={{gridColumn: '1 / -1'}}>
                      You have no active classes yet.
                  </div>
              )}
            </div>
          </div>
        )}

        {/* PAYMENT TAB */}
        {activeTab === 'payment' && (
          <div>
            <h2 className="welcome-title">Manage Payments</h2>
            <div style={{maxWidth:'600px', margin:'0 auto'}}>
                <OnlinePayment student={student} onPaymentSuccess={refreshData} preSelectedBatch={renewBatchId || preSelectedBatch} />
            </div>
            <h3 className="section-title">Payment History</h3>
            <div className="history-list">
                {payments.map(p => (
                    <div key={p.id} className="history-card" onClick={() => setSelectedPayment(p)}>
                        <div className="history-info">
                            <div className="history-course">{p.course_name}</div>
                            <div className="history-meta">
                                <span className="history-id" style={{fontWeight:'bold'}}>{getDisplayID(p)}</span>
                                <span>• {new Date(p.payment_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <span className={`badge ${p.status}`}>{p.status}</span>
                            <div className="click-hint">View details</div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'exams' && <div className="premium-card"><h2 className="welcome-title">Exam Results</h2><ExamList exams={exams} /></div>}
        {activeTab === 'profile' && <div style={{maxWidth:'600px', margin:'0 auto'}}><h2 className="welcome-title">My Profile</h2><StudentCard student={student} onUpdate={refreshData} /></div>}
      </div>

      {/* MOBILE NAV */}
      <div className="mobile-nav">
         {[{id: 'overview', icon: '📊', label: 'Overview'}, {id: 'classroom', icon: '📚', label: 'Classes'}, {id: 'payment', icon: '💳', label: 'Pay'}, {id: 'exams', icon: '📝', label: 'Exams'}, {id: 'profile', icon: '👤', label: 'Profile'}].map(item => (
           <div key={item.id} className={`mobile-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
             <span className="mobile-icon">{item.icon}</span><span>{item.label}</span>
           </div>
         ))}
      </div>

      {/* PAYMENT MODAL */}
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
                        <span className="pm-value" style={{fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb'}}>
                            {getDisplayID(selectedPayment)}
                        </span>
                    </div>
                    <div className="pm-row">
                        <span className="pm-label">Transfer To</span>
                        <span className="pm-value">
                            {accountInfo[selectedPayment.payment_method] || selectedPayment.payment_method}
                        </span>
                    </div>
                    <div className="pm-row">
                        <span className="pm-label">Date</span>
                        <span className="pm-value">{new Date(selectedPayment.payment_date).toLocaleString()}</span>
                    </div>

                    {selectedPayment.receipt_image ? (
                        <div className="pm-receipt-box">
                            <p style={{fontSize:'12px', marginBottom:'8px', color:'#64748b'}}>Uploaded Screenshot (Click to zoom):</p>
                            <img 
                                src={getImageUrl(selectedPayment.receipt_image)} 
                                alt="Receipt" 
                                className="pm-receipt-img"
                                style={{border: '1px solid #e2e8f0', cursor: 'zoom-in', maxWidth: '100%'}}
                                onClick={() => setPreviewImage(getImageUrl(selectedPayment.receipt_image))}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className="pm-receipt-box" style={{color: '#94a3b8', fontStyle: 'italic'}}>No screenshot uploaded</div>
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

      {/* LIGHTBOX PREVIEW */}
      {previewImage && (
        <div 
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 3000, 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setPreviewImage(null)}
        >
            <button 
                onClick={() => setPreviewImage(null)}
                style={{
                    position: 'absolute', top: '20px', right: '20px', 
                    background: 'white', border: 'none', borderRadius: '50%', 
                    width: '40px', height: '40px', fontSize: '24px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                ×
            </button>
            <img 
                src={previewImage} 
                alt="Full Preview" 
                style={{
                    maxWidth: '90%', maxHeight: '90%', 
                    objectFit: 'contain', borderRadius: '8px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
      )}

    </div>
  );
}

export default StudentDashboard;