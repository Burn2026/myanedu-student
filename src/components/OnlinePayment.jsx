import React, { useState, useEffect } from 'react';
import './OnlinePayment.css'; 

function OnlinePayment({ student, onPaymentSuccess, preSelectedBatch }) {
  const [batches, setBatches] = useState([]); 
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [amount, setAmount] = useState(""); 
  const [paymentMethod, setPaymentMethod] = useState("KPay");
  const [transactionId, setTransactionId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(""); 

  // ✅ 1. Premium Modal အတွက် State သတ်မှတ်ခြင်း
  const [modal, setModal] = useState({ 
      isOpen: false, 
      type: 'success', // 'success' သို့မဟုတ် 'error'
      title: '', 
      message: '' 
  });

  const accountInfo = {
    "KPay": { number: "09123456789", name: "U Kyaw Kyaw" },
    "Wave": { number: "09987654321", name: "Daw Mya Mya" },
    "CB": { number: "001122334455", name: "U Ba Maung" }
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch('https://myanedu-backend.onrender.com/students/active-batches');
        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            setBatches(data);
            setFetchError("");
        } else {
            setFetchError("No active courses found.");
        }

        if (preSelectedBatch && data.length > 0) {
            const found = data.find(b => b.id == preSelectedBatch);
            if (found) {
                setSelectedBatchId(found.id);
                setAmount(found.fees);
            }
        }
      } catch (err) {
        setFetchError("Cannot load courses. Check Backend.");
      }
    };
    fetchBatches();
  }, [preSelectedBatch]);

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    const selected = batches.find(b => b.id == batchId);
    if (selected) setAmount(selected.fees);
    else setAmount("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !amount || !transactionId || !receipt) {
        // ရိုးရိုး alert အစား Modal ပြမည်
        setModal({ isOpen: true, type: 'error', title: 'လိုအပ်ချက်ရှိနေပါသည်', message: 'ကျေးဇူးပြု၍ အချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်သွင်းပြီး ငွေလွှဲပြေစာ တင်ပေးပါ။' });
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('phone', student.phone_primary);
    formData.append('batch_id', selectedBatchId); 
    formData.append('amount', amount);
    formData.append('payment_method', paymentMethod);
    formData.append('transaction_id', transactionId);
    formData.append('receipt_image', receipt);

    try {
      const res = await fetch('https://myanedu-backend.onrender.com/students/payments', {
        method: 'POST',
        body: formData, 
      });

      const data = await res.json();
      if (res.ok) {
        // ✅ အောင်မြင်ကြောင်း Modal ပြမည်
        setModal({ isOpen: true, type: 'success', title: 'အောင်မြင်ပါသည်', message: 'သင်၏ ငွေပေးချေမှုကို လက်ခံရရှိပါသည်။ Admin မှ မကြာမီ အတည်ပြုပေးပါမည်။' });
        setSelectedBatchId("");
        setAmount("");
        setTransactionId("");
        setReceipt(null);
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        // ❌ Error ဖြစ်ကြောင်း (Double Payment စသည်ဖြင့်) Modal ပြမည်
        setModal({ isOpen: true, type: 'error', title: 'အသိပေးချက်', message: data.message || 'ငွေပေးချေမှု တင်သွင်းခြင်း မအောင်မြင်ပါ။' });
      }
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'ချိတ်ဆက်မှု အခက်အခဲ', message: 'Connection Error! အင်တာနက်ချိတ်ဆက်မှုကို ပြန်လည်စစ်ဆေးပါ။' });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  return (
    <div className="payment-form-container">
      <h3 className="payment-title">💸 Make Payment</h3>
      
      <form onSubmit={handleSubmit} className="payment-form">
        
        {/* Course Selection */}
        <div className="form-group">
          <label>Select Course/Batch</label>
          <select 
            value={selectedBatchId} 
            onChange={handleBatchChange}
            required
            className="form-input select-arrow"
            style={{backgroundColor: '#fff'}}
          >
            <option value="">-- Choose Course --</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.course_name} - {b.batch_name} ({Number(b.fees).toLocaleString()} Ks)
              </option>
            ))}
          </select>
          {fetchError && <p style={{color: 'red', fontSize: '12px', marginTop: '5px'}}>{fetchError}</p>}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label>Amount (Ks)</label>
          <input 
            type="text" 
            value={amount ? Number(amount).toLocaleString() : ""} 
            readOnly 
            placeholder="Course fees will appear here"
            className="form-input readonly-input"
          />
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label>Payment Method</label>
          <div className="method-options">
            {Object.keys(accountInfo).map(method => (
              <button 
                type="button" 
                key={method}
                className={`method-btn ${paymentMethod === method ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Transfer Info */}
        <div className="transfer-info-box">
            <p>Please transfer to this <span style={{color:'#2563eb', fontWeight:'bold'}}>{paymentMethod}</span> account:</p>
            <h2 className="account-number">{accountInfo[paymentMethod].number}</h2>
            <p className="account-name">({accountInfo[paymentMethod].name})</p>
        </div>

        {/* Transaction ID */}
        <div className="form-group">
          <label>Transaction ID (Last 6 Digits) *</label>
          <input 
            type="text" 
            value={transactionId} 
            onChange={(e) => setTransactionId(e.target.value)} 
            placeholder="e.g. 012345"
            required
            className="form-input"
          />
        </div>

        {/* Receipt Upload */}
        <div className="form-group">
          <label>Upload Screenshot *</label>
          <div className="file-upload-wrapper">
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setReceipt(e.target.files[0])}
                required 
                className="file-input"
                id="receipt-upload"
            />
            <label htmlFor="receipt-upload" className="upload-placeholder">
                {receipt ? (
                    <span style={{color: '#16a34a', fontWeight: 'bold'}}>✅ {receipt.name}</span>
                ) : (
                    <span>📸 Tap to upload receipt</span>
                )}
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Processing..." : "Confirm Payment"}
        </button>

      </form>

      {/* --- ✅ PREMIUM MODAL DIALOG --- */}
      {modal.isOpen && (
        <div className="op-modal-overlay" onClick={closeModal}>
            <div className="op-modal-box" onClick={(e) => e.stopPropagation()}>
                
                {/* Icon */}
                <div className={`op-modal-icon ${modal.type}`}>
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

                <h3 className="op-modal-title">{modal.title}</h3>
                <p className="op-modal-message">{modal.message}</p>
                
                <button className={`op-modal-btn ${modal.type}`} onClick={closeModal}>
                    အိုကေ (OK)
                </button>
            </div>
        </div>
      )}

    </div>
  );
}

export default OnlinePayment;