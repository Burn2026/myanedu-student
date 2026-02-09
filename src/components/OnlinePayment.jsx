import { useState, useEffect } from 'react';
import "../App.css";  
import LoadingSpinner from './LoadingSpinner';

function OnlinePayment({ student, onPaymentSuccess, preSelectedBatch }) {
  const [batches, setBatches] = useState([]); 
  const [formData, setFormData] = useState({
    batch_id: '', 
    amount: '',
    payment_method: 'KPay',
    transaction_ref: ''
  });
  const [receiptImage, setReceiptImage] = useState(null); 
  
  // (1) Loading နှင့် Spinner Success State များ
  const [loading, setLoading] = useState(false);
  const [showSpinnerSuccess, setShowSpinnerSuccess] = useState(false);
  
  // (2) Final Modal (Premium Box) State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // (3) Copy State (New)
  const [copied, setCopied] = useState(false);

  // Payment Account Details Configuration
  const paymentAccounts = {
    "KPay": {
      name: "U Kyaw Kyaw",
      phone: "09123456789"
    },
    "Wave Money": {
      name: "Daw Mya Mya",
      phone: "09987654321"
    },
    "CB Pay": {
      name: "U Ba Hla",
      phone: "0011223344556677"
    },
    "AYA Pay": {
      name: "Daw Hla Hla",
      phone: "09112233445"
    },
    "Cash": {
        name: "School Counter",
        phone: "Office Payment"
    }
  };

  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/public/batches') 
      .then(res => res.json())
      .then(data => {
        setBatches(data);
        if (preSelectedBatch) {
            setFormData(prev => ({ ...prev, batch_id: preSelectedBatch }));
        }
      })
      .catch(err => console.error(err));
  }, [preSelectedBatch]);

  // --- (New) Copy to Clipboard Function ---
  const handleCopy = (text) => {
    if (!text || text === "Office Payment") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2 စက္ကန့်ကြာရင် ပြန်ပျောက်မည်
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.batch_id) return alert("⚠️ ကျေးဇူးပြု၍ 'အတန်း (Course/Batch)' ကို ရွေးချယ်ပေးပါ။");
    if (!formData.amount) return alert("⚠️ ကျေးဇူးပြု၍ 'ငွေပမာဏ' ထည့်သွင်းပေးပါ။");
    if (!formData.transaction_ref) return alert("⚠️ ကျေးဇူးပြု၍ 'လုပ်ဆောင်မှု နံပါတ်' ထည့်သွင်းပေးပါ။");
    if (!receiptImage) return alert("⚠️ ကျေးဇူးပြု၍ 'ငွေလွှဲ Screenshot' တင်ပေးပါ။");

    setLoading(true); 
    
    try {
      const data = new FormData();
      data.append('student_id', student.id); 
      data.append('batch_id', formData.batch_id);
      data.append('amount', formData.amount);
      data.append('payment_method', formData.payment_method);
      data.append('transaction_ref', formData.transaction_ref);
      data.append('receipt_image', receiptImage); 

      const response = await fetch('https://myanedu-backend.onrender.com/public/payment', {
        method: 'POST',
        body: data
      });
      const result = await response.json();

      if (response.ok) {
        setLoading(false);
        setShowSpinnerSuccess(true);

        setTimeout(() => {
            setShowSpinnerSuccess(false);
            setShowSuccessModal(true);
            
            // Form Reset
            setFormData({ batch_id: '', amount: '', payment_method: 'KPay', transaction_ref: '' });
            setReceiptImage(null); 
            document.getElementById('fileInput').value = ""; 
            
            onPaymentSuccess();
        }, 2000);

      } else {
        setLoading(false);
        alert("⚠️ Error: " + result.message);
      }
    } catch (err) {
      setLoading(false);
      alert("Connection Error.");
      console.error(err);
    }
  };

  const currentAccount = paymentAccounts[formData.payment_method];

  return (
    <>
      {loading && <LoadingSpinner />}
      
      {showSpinnerSuccess && (
        <LoadingSpinner 
            isSuccess={true} 
            message="ငွေပေးချေမှု အောင်မြင်သည်" 
        />
      )}

      <div className="table-card" style={{ borderLeft: '5px solid #0891b2' }}>
        <h3 style={{ marginTop: 0, color: '#0891b2' }}>💳 အွန်လိုင်း ငွေပေးချေရန် (Make Payment)</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>အတန်း (Course/Batch) ရွေးချယ်ပါ <span style={{color:'red'}}>*</span></label>
              <select 
                  required
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  value={formData.batch_id}
                  onChange={e => setFormData({...formData, batch_id: e.target.value})}
              >
                  <option value="">-- သင်တန်းအားလုံး --</option>
                  {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>{batch.course_name} - {batch.batch_name}</option>
                  ))}
              </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>ငွေပမာဏ (Kyats) <span style={{color:'red'}}>*</span></label>
              <input 
                  required type="number" placeholder="50000"
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
              />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>ငွေပေးချေမှု ပုံစံ</label>
              <select 
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  value={formData.payment_method}
                  onChange={e => setFormData({...formData, payment_method: e.target.value})}
              >
                  {Object.keys(paymentAccounts).map(method => (
                      <option key={method} value={method}>{method}</option>
                  ))}
              </select>
          </div>

          {/* --- Dynamic Payment Account Display (With Copy Feature) --- */}
          <div style={{ 
                gridColumn: '1 / -1',
                background: '#f0fdfa', 
                border: '1px dashed #0d9488', 
                borderRadius: '8px', 
                padding: '15px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#0f766e', fontWeight: 'bold' }}>
                    Please transfer to this {formData.payment_method} account:
                </p>
                
                {/* Phone Number & Copy Button */}
                <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    marginBottom: '5px'
                }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#115e59', letterSpacing: '1px' }}>
                        {currentAccount?.phone}
                    </div>
                    
                    {/* Copy Button (Only shows if not Cash) */}
                    {formData.payment_method !== 'Cash' && (
                        <button 
                            type="button"
                            onClick={() => handleCopy(currentAccount?.phone)}
                            style={{
                                background: copied ? '#10b981' : '#e2e8f0',
                                color: copied ? 'white' : '#64748b',
                                border: 'none', borderRadius: '6px',
                                padding: '5px 10px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            {copied ? "✓ Copied!" : "📋 Copy"}
                        </button>
                    )}
                </div>

                <div style={{ fontSize: '14px', color: '#134e4a' }}>
                    ({currentAccount?.name})
                </div>
          </div>
          {/* ------------------------------------------- */}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>လုပ်ဆောင်မှု နံပါတ် (Last 4 Digits) <span style={{color:'red'}}>*</span></label>
              <input 
                  required placeholder="e.g., 1234"
                  maxLength="6"
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  value={formData.transaction_ref}
                  onChange={e => setFormData({...formData, transaction_ref: e.target.value})}
              />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
              <label style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>ငွေလွှဲ Screenshot (ပြေစာ) <span style={{color:'red'}}>*</span></label>
              <input 
                  required id="fileInput" type="file" accept="image/*"
                  onChange={e => setReceiptImage(e.target.files[0])}
                  style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '6px', background: '#f9fafb' }}
              />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
              <button 
                  type="submit" disabled={loading || showSpinnerSuccess}
                  style={{ 
                      width: '100%', padding: '12px', background: '#0891b2', color: 'white', 
                      border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1
                  }}>
                  {loading ? "..." : "ငွေသွင်းမည် (Pay Now)"}
              </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="success-icon-circle"><span className="success-icon">✓</span></div>
            <h3 className="modal-title">ငွေပေးချေမှု အောင်မြင်သည်!</h3>
            <p className="modal-desc">
              ငွေသွင်းခြင်းနှင့် အတန်းအပ်နှံခြင်းအတွက် ကျေးဇူးတင်ပါသည်။ 
              Admin မှ အတည်ပြုပြီးပါက ပြေစာ (Receipt) ရယူနိုင်ပါပြီ။
            </p>
            <button className="modal-btn" onClick={() => setShowSuccessModal(false)}>
              ကောင်းပါပြီ (OK)
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default OnlinePayment;