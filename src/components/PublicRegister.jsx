import { useState } from "react";
import LoadingSpinner from './LoadingSpinner';

function PublicRegister({ onRegisterSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date_of_birth: "",
    address: "",
    password: "" // (1) Password State အသစ်
  });
  
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://myanedu-backend.onrender.com/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);
        setShowSuccess(true);
        setTimeout(() => {
            onRegisterSuccess(formData.phone);
        }, 2000);
      } else {
        setLoading(false);
        alert("⚠️ " + data.message);
      }
    } catch (err) {
      setLoading(false);
      alert("Server Error");
    }
  };

  return (
    <div className="table-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      
      {loading && <LoadingSpinner />}
      {showSuccess && <LoadingSpinner isSuccess={true} message="အကောင့်စာရင်းသွင်းခြင်း အောင်မြင်သည်" />}

      <h2 style={{ color: '#2563eb', marginTop: 0 }}>📝 ကျောင်းသားသစ် စာရင်းသွင်းရန်</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        အချက်အလက်များကို မှန်ကန်စွာ ဖြည့်စွက်ပေးပါ
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Name Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>ကျောင်းသား အမည်</label>
            <input 
              required placeholder="အမည် အပြည့်အစုံ" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
        </div>
        
        {/* Phone Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>ဖုန်းနံပါတ် (Login ဝင်ရန်)</label>
            <input 
              required placeholder="09xxxxxxxxx" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
        </div>

        {/* (2) Password Input အသစ် */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>စကားဝှက် (Password/PIN)</label>
            <input 
              required 
              type="password"
              placeholder="အနည်းဆုံး ၄ လုံး" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
        </div>

        {/* DOB Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>မွေးသက္ကရာဇ်</label>
            <input 
              required type="date"
              value={formData.date_of_birth}
              onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'inherit' }}
            />
        </div>

        {/* Address Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>နေရပ်လိပ်စာ</label>
            <textarea 
              required placeholder="အိမ်အမှတ်၊ လမ်း၊ မြို့နယ်..." rows="3"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'inherit' }}
            />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                မလုပ်တော့ပါ
            </button>
            <button type="submit" disabled={loading || showSuccess} style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? "..." : "စာရင်းသွင်းမည်"}
            </button>
        </div>
      </form>
    </div>
  );
}

export default PublicRegister;