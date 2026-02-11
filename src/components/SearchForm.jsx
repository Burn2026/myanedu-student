import { useState } from 'react';
import './SearchForm.css';

function SearchForm({ onLoginSuccess }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('https://myanedu-backend.onrender.com/public/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ အရေးကြီး: Login ဝင်တာနဲ့ Data အကုန်သိမ်းပါ (App.jsx က ပြန်မရှာရအောင်)
        localStorage.setItem('studentAuth', JSON.stringify(data.user)); 
        localStorage.setItem('studentPhone', phone);
        
        // App.jsx ကို အသိပေးမည်
        onLoginSuccess(phone); 
      } else {
        setError(data.message || "Login Failed");
      }
    } catch (err) {
      setError("Server Error. ချိတ်ဆက်၍မရပါ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>အကောင့်ဝင်ရန် (Login)</h2>

      {error && (
        <div className="error-msg" style={{ fontSize: '14px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', fontSize: '13px', color: '#64748b' }}>ဖုန်းနံပါတ်</label>
            <input 
              required
              type="text" 
              placeholder="09xxxxxxxxx"
              className="search-input"
              style={{ width: '100%', marginTop: '5px' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
        </div>

        <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', fontSize: '13px', color: '#64748b' }}>စကားဝှက် (Password)</label>
            <input 
              required
              type="password" 
              placeholder="••••••"
              className="search-input"
              style={{ width: '100%', marginTop: '5px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
        </div>

        <button type="submit" className="search-btn" disabled={loading} style={{ marginTop: '10px' }}>
           {loading ? "စစ်ဆေးနေသည်..." : "Login ဝင်မည်"}
        </button>

      </form>
    </div>
  );
}

export default SearchForm;