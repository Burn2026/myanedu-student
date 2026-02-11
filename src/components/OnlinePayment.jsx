import { useState, useEffect } from 'react';

function OnlinePayment({ student, onPaymentSuccess, preSelectedBatch }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(preSelectedBatch || "");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("KPay");
  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Image Preview
  const [loading, setLoading] = useState(false);

  // Backend URL
  const API_URL = "https://myanedu-backend.onrender.com"; 

  // Payment Accounts Mapping
  const paymentAccounts = {
    "KPay": { name: "U Kyaw Kyaw", phone: "09123456789", color: "#2563eb", bg: "#eff6ff" },
    "Wave": { name: "Daw Mya Mya", phone: "09987654321", color: "#d97706", bg: "#fffbeb" },
    "CB": { name: "U Ba Maung", phone: "001122334455", color: "#ea580c", bg: "#fff7ed" }
  };

  const activeAccount = paymentAccounts[paymentMethod];

  useEffect(() => {
    fetch(`${API_URL}/public/batches`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setBatches(data);
        // Pre-select logic
        if (preSelectedBatch) {
            const found = data.find(b => b.id === preSelectedBatch);
            if (found) {
                setAmount(found.fees);
                setSelectedBatch(preSelectedBatch);
            }
        }
      })
      .catch(err => console.error("Error fetching batches:", err));
  }, [preSelectedBatch]);

  // Handle File Selection & Preview
  const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
          setFile(selectedFile);
          setPreviewUrl(URL.createObjectURL(selectedFile));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch || !amount || !file || !transactionId) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // LocalStorage မှ Data ကိုမယူဘဲ Props မှ student ID ကိုသုံးမည် (ပိုစိတ်ချရ)
    formData.append("student_id", student.id);
    formData.append("batch_id", selectedBatch);
    formData.append("amount", amount);
    formData.append("payment_method", paymentMethod);
    formData.append("transaction_id", transactionId);
    formData.append("receipt", file);

    try {
      const res = await fetch(`${API_URL}/public/payment-upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Payment Submitted! Please wait for admin approval.");
        // Reset Form
        setAmount("");
        setFile(null);
        setPreviewUrl(null);
        setTransactionId("");
        onPaymentSuccess(); // Refresh Data
      } else {
        alert(data.message || "Upload Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
        <h2 style={styles.header}>💸 Make Payment</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Batch Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Select Course/Batch</label>
            <select 
              style={styles.input}
              value={selectedBatch} 
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                const batch = batches.find(b => b.id === Number(e.target.value)); // Ensure ID types match
                if(batch) setAmount(batch.fees);
              }}
              required
            >
              <option value="">-- Choose Course --</option>
              {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.course_title} - {batch.batch_name}
                  </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Amount (Ks)</label>
            <input 
              type="number" 
              style={styles.input}
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="e.g. 50000"
              required 
            />
          </div>

          {/* Payment Method Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Payment Method</label>
            <div style={{display: 'flex', gap: '10px'}}>
                {['KPay', 'Wave', 'CB'].map(method => (
                    <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: `2px solid ${paymentMethod === method ? paymentAccounts[method].color : '#e2e8f0'}`,
                            background: paymentMethod === method ? paymentAccounts[method].bg : 'white',
                            color: paymentMethod === method ? paymentAccounts[method].color : '#64748b',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {method}
                    </button>
                ))}
            </div>
          </div>

          {/* Dynamic Account Info Box */}
          <div style={{
              backgroundColor: activeAccount.bg,
              border: `1px dashed ${activeAccount.color}`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              margin: '10px 0',
              transition: 'all 0.3s ease'
          }}>
            <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>
              Please transfer to this <strong style={{color: activeAccount.color}}>{paymentMethod}</strong> account:
            </p>
            <h3 style={{margin: '10px 0', fontSize: '28px', color: '#1e293b', letterSpacing: '1px'}}>
                {activeAccount.phone}
            </h3>
            <p style={{margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155'}}>
                ({activeAccount.name})
            </p>
          </div>

          {/* Transaction ID */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Transaction ID (Last 6 Digits) *</label>
            <input 
              type="text" 
              style={styles.input}
              value={transactionId} 
              onChange={(e) => setTransactionId(e.target.value)} 
              placeholder="e.g. 012345"
              required 
            />
          </div>

          {/* File Upload with Preview */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Upload Screenshot *</label>
            <div style={{border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '12px', textAlign: 'center', position: 'relative', cursor: 'pointer', background: '#f8fafc'}}>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}}
                    required 
                />
                {previewUrl ? (
                    <div style={{position: 'relative'}}>
                        <img src={previewUrl} alt="Preview" style={{maxHeight: '150px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                        <p style={{fontSize: '12px', color: '#16a34a', marginTop: '5px'}}>✅ Image Selected</p>
                    </div>
                ) : (
                    <div>
                        <span style={{fontSize: '24px'}}>📷</span>
                        <p style={{fontSize: '13px', color: '#64748b', margin: '5px 0'}}>Tap to upload receipt</p>
                    </div>
                )}
            </div>
          </div>

          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>

        </form>
    </div>
  );
}

// Inline Styles
const styles = {
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0'
  },
  header: {
    color: '#1e293b',
    marginBottom: '25px',
    textAlign: 'center',
    fontSize: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.9rem',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none'
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
  }
};

export default OnlinePayment;