import React, { useState, useEffect } from 'react';
import './ClassEnrollment.css';

function ClassEnrollment({ student, onEnrollSuccess }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 1. Premium Modal အတွက် State သတ်မှတ်ခြင်း
  const [modal, setModal] = useState({ 
      isOpen: false, 
      type: 'success', // 'success' သို့မဟုတ် 'error'
      title: '', 
      message: '' 
  });

  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/public/batches')
      .then(res => res.json())
      .then(data => setBatches(data))
      .catch(err => console.error("Error fetching batches:", err));
  }, []);

  const handleEnroll = async () => {
    if (!selectedBatch) {
        // ရိုးရိုး alert အစား Modal ပြမည်
        setModal({ isOpen: true, type: 'error', title: 'လိုအပ်ချက်ရှိနေပါသည်', message: 'ကျေးဇူးပြု၍ တက်ရောက်လိုသော အတန်းတစ်ခုကို ရွေးချယ်ပါ။' });
        return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://myanedu-backend.onrender.com/public/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.id,
          batch_id: selectedBatch
        })
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ အောင်မြင်ကြောင်း Modal ပြမည်
        setModal({ isOpen: true, type: 'success', title: 'အောင်မြင်ပါသည်', message: result.message || 'အတန်းအပ်နှံခြင်း အောင်မြင်ပါသည်။' });
        setSelectedBatch(""); 
        if(onEnrollSuccess) onEnrollSuccess(); // Parent ကို အသိပေးပြီး Data ပြန် Refresh လုပ်ခိုင်းမည်
      } else {
        // ❌ Error ဖြစ်ကြောင်း (ဥပမာ - Pending ဖြစ်နေသည်) Modal ပြမည်
        setModal({ isOpen: true, type: 'error', title: 'အသိပေးချက်', message: result.message || 'လုပ်ဆောင်မှု မအောင်မြင်ပါ။' });
      }
    } catch (err) {
        setModal({ isOpen: true, type: 'error', title: 'ချိတ်ဆက်မှု အခက်အခဲ', message: 'Connection Error! အင်တာနက်ချိတ်ဆက်မှုကို ပြန်လည်စစ်ဆေးပါ။' });
    }
    setLoading(false);
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  return (
    <div className="enrollment-card">
      <h3 className="enroll-title">🎓 အတန်းသစ် အပ်နှံရန် (New Enrollment)</h3>
      <p className="enroll-subtitle">တက်ရောက်လိုသော အတန်းကို ရွေးချယ်ပြီး အပ်နှံနိုင်ပါသည်</p>

      <div className="enroll-form">
        <select 
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="enroll-select"
        >
          <option value="">-- အတန်းရွေးချယ်ပါ --</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.course_name} - {batch.batch_name}
            </option>
          ))}
        </select>

        <button 
          onClick={handleEnroll}
          disabled={loading}
          className="enroll-btn"
        >
          {loading ? "လုပ်ဆောင်နေသည်..." : "+ အပ်နှံမည်"}
        </button>
      </div>

      {/* --- ✅ PREMIUM MODAL DIALOG --- */}
      {modal.isOpen && (
        <div className="ce-modal-overlay" onClick={closeModal}>
            <div className="ce-modal-box" onClick={(e) => e.stopPropagation()}>
                
                {/* Icon (Success = ✅, Error = ⚠️) */}
                <div className={`ce-modal-icon ${modal.type}`}>
                    {modal.type === 'success' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" width="36" height="36">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="36" height="36">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                </div>

                <h3 className="ce-modal-title">{modal.title}</h3>
                <p className="ce-modal-message">{modal.message}</p>
                
                <button className={`ce-modal-btn ${modal.type}`} onClick={closeModal}>
                    အိုကေ (OK)
                </button>
            </div>
        </div>
      )}

    </div>
  );
}

export default ClassEnrollment;