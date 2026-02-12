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
  const [fetchError, setFetchError] = useState(""); // Error message ပြရန်

  const accountInfo = {
    "KPay": { number: "09123456789", name: "U Kyaw Kyaw" },
    "Wave": { number: "09987654321", name: "Daw Mya Mya" },
    "CB": { number: "001122334455", name: "U Ba Maung" }
  };

  // ✅ 1. Fetch Batches with Debugging Logs
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        console.log("Fetching batches from backend..."); // Log 1
        const res = await fetch('https://myanedu-backend.onrender.com/students/active-batches');
        
        if (!res.ok) {
            throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();
        console.log("Batches received:", data); // Log 2

        if (Array.isArray(data) && data.length > 0) {
            setBatches(data);
            setFetchError("");
        } else {
            setFetchError("No active courses found.");
        }

        // Renew Logic
        if (preSelectedBatch && data.length > 0) {
            const found = data.find(b => b.id == preSelectedBatch);
            if (found) {
                setSelectedBatchId(found.id);
                setAmount(found.fees);
            }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setFetchError("Cannot load courses. Check Backend.");
      }
    };
    fetchBatches();
  }, [preSelectedBatch]);

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    const selected = batches.find(b => b.id == batchId);
    if (selected) {
        setAmount(selected.fees);
    } else {
        setAmount("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatchId || !amount || !transactionId || !receipt) {
      return alert("Please fill all fields and upload receipt.");
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
        alert("Payment Submitted Successfully!");
        setSelectedBatchId("");
        setAmount("");
        setTransactionId("");
        setReceipt(null);
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        alert(data.message || "Payment Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          {/* Debug Error Message Show Here */}
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
            style={{backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b'}}
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
    </div>
  );
}

export default OnlinePayment;