import React, { useState, useEffect } from 'react';
import './Instructors.css';

function Instructors() {
  const [teachers, setTeachers] = useState([]);

  // Backend မှ Data လှမ်းဆွဲခြင်း
  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/public/instructors')
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(err => console.error("Failed to fetch instructors:", err));
  }, []);

  // နာမည်၏ ပထမဆုံး စာလုံးကို ယူပြီး Logo လုပ်ခြင်း (ဥပမာ: Tr. Hla -> T)
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="instructor-section">
      <div className="instructor-header">
        <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>EXPERT TEAM</span>
        <h2>ကျွမ်းကျင် ဆရာ/ဆရာမများ</h2>
        <p>
          နိုင်ငံတကာ အသိအမှတ်ပြု လက်မှတ်ရရှိထားပြီး သင်ကြားရေးအတွေ့အကြုံရင့်ကျက်သော 
          ဆရာ/ဆရာမများက အနီးကပ် သင်ကြားပေးလျက်ရှိပါသည်။
        </p>
      </div>

      <div className="instructor-grid">
        {teachers.map((tr) => (
          <div key={tr.id} className="instructor-card">
            {/* Initials Avatar */}
            <div className="avatar-circle">
                {getInitials(tr.name)}
            </div>

            <h3 className="inst-name">{tr.name}</h3>
            <span className="inst-role">{tr.role}</span>
            <p className="inst-bio">{tr.bio}</p>
            
            {/* Experience Badge */}
            {tr.experience_badge && (
                <span className="exp-badge">🏆 {tr.experience_badge}</span>
            )}
          </div>
        ))}

        {/* Data မရှိသေးလျှင် ပြရန် */}
        {teachers.length === 0 && (
            <p style={{ color: '#94a3b8' }}>Loading Instructors...</p>
        )}
      </div>
    </div>
  );
}

export default Instructors;