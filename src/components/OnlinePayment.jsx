import { useState, useEffect } from 'react';

function OnlinePayment() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("KPay");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Backend URL (Render Link)
  const API_URL = "https://myanedu-backend.onrender.com"; 

  // ၁။ Component စပွင့်တာနဲ့ Backend က Batch တွေကို လှမ်းယူပါမယ်
  useEffect(() => {
    fetch(`${API_URL}/public/batches`)
      .then(res => res.json())
      .then(data => {
        setBatches(data); // ရလာတဲ့ Data ကို State ထဲထည့်မယ်
      })
      .catch(err => console.error("Error fetching batches:", err));
  }, []);

  // ၂။ ငွေလွှဲပြေစာ တင်သွင်းခြင်း
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch || !amount || !file) {
      alert("Please fill all fields and upload receipt!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Login ဝင်ထားသော ကျောင်းသား ID ကို LocalStorage မှ ယူပါမည်
    const studentData = JSON.parse(localStorage.getItem('studentAuth'));
    if (!studentData) {
        alert("Please Login first!");
        return;
    }

    formData.append("student_id", studentData.id);
    formData.append("batch_id", selectedBatch);
    formData.append("amount", amount);
    formData.append("payment_method", paymentMethod);
    formData.append("receipt", file);

    try {
      const res = await fetch(`${API_URL}/public/payment-upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Payment Submitted Successfully! Please wait for admin verification.");
        // Reset Form
        setAmount("");
        setFile(null);
        setSelectedBatch("");
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>💳 Make Payment (ငွေပေးချေရန်)</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* --- Batch Selection (Dynamic Dropdown) --- */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>သင်တန်းရွေးချယ်ပါ (Select Course/Batch)</label>
            <select 
              style={styles.input}
              value={selectedBatch} 
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                // အတန်းရွေးလိုက်ရင် Fees ကို Auto ဖြည့်ပေးမည့် Logic
                const batch = batches.find(b => b.id === e.target.value);
                if(batch) setAmount(batch.fees);
              }}
              required
            >
              <option value="">-- အတန်းရွေးချယ်ပါ --</option>
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.course_title} - {batch.batch_name} ({Number(batch.fees).toLocaleString()} Ks)
                  </option>
                ))
              ) : (
                <option disabled>Loading classes...</option>
              )}
            </select>
          </div>

          {/*Amount Input*/}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ငွေပမာဏ (Amount)</label>
            <input 
              type="number" 
              style={styles.input}
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Example: 50000"
              required 
            />
          </div>

          {/* Payment Method */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ငွေပေးချေမှု ပုံစံ</label>
            <select 
              style={styles.input}
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="KPay">KBZ Pay</option>
              <option value="Wave">Wave Money</option>
              <option value="CB">CB Pay</option>
            </select>
          </div>

          {/* Admin Account Info Box */}
          <div style={styles.infoBox}>
            <p style={{margin: 0, fontWeight: 'bold', color: '#15803d'}}>
              Please transfer to this {paymentMethod} account:
            </p>
            <h3 style={{margin: '10px 0', fontSize: '24px', letterSpacing: '1px'}}>09123456789</h3>
            <p style={{margin: 0, fontSize: '0.9rem'}}>(U Kyaw Kyaw)</p>
          </div>

          {/* File Upload */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>လုပ်ဆောင်မှု နံပါတ် (Transaction Screenshot) *</label>
            <input 
              type="file" 
              accept="image/*"
              style={{...styles.input, padding: '10px'}}
              onChange={(e) => setFile(e.target.files[0])} 
              required 
            />
          </div>

          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Payment (အတည်ပြုမည်)"}
          </button>

        </form>
      </div>
    </div>
  );
}

// --- Responsive CSS Styles ---
const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '80vh',
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px', // PC မှာ အရမ်းမကျယ်သွားအောင် ထိန်းထားခြင်း
  },
  header: {
    color: '#1f2937',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.95rem',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box', // Padding ကြောင့် Size မကြီးသွားအောင်
  },
  infoBox: {
    backgroundColor: '#ecfdf5',
    border: '1px dashed #10b981',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    margin: '10px 0',
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s',
    marginTop: '10px',
  }
};

export default OnlinePayment;