import { useState, useEffect } from 'react';
import './ClassEnrollment.css';

function ClassEnrollment({ student, onEnrollSuccess }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);

  // ၁. ရှိသမျှ အတန်းများကို လှမ်းယူခြင်း
  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/public/batches')
      .then(res => res.json())
      .then(data => setBatches(data))
      .catch(err => console.error("Error fetching batches:", err));
  }, []);

  // ၂. အတန်းအပ်နှံခြင်း ခလုတ်နှိပ်လျှင်
  const handleEnroll = async () => {
    if (!selectedBatch) return alert("ကျေးဇူးပြု၍ အတန်းတစ်ခု ရွေးချယ်ပါ");

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
        alert("✅ " + result.message);
        setSelectedBatch(""); // Reset selection
        onEnrollSuccess(); // Parent ကို အသိပေးပြီး Refresh လုပ်ခိုင်းမယ်
      } else {
        alert("⚠️ " + result.message);
      }
    } catch (err) {
      alert("Connection Error!");
    }
    setLoading(false);
  };

  return (
    <div className="table-card" style={{ borderLeft: '5px solid #d97706' }}>
      <h3 style={{ marginTop: 0, color: '#d97706' }}>🎓 အတန်းသစ် အပ်နှံရန် (New Enrollment)</h3>
      <p style={{ color: '#666', fontSize: '14px' }}>တက်ရောက်လိုသော အတန်းကို ရွေးချယ်ပြီး အပ်နှံနိုင်ပါသည်</p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
        <select 
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '200px' }}
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
          style={{ 
            padding: '12px 20px', 
            background: '#d97706', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? "လုပ်ဆောင်နေသည်..." : "+ အပ်နှံမည်"}
        </button>
      </div>
    </div>
  );
}

export default ClassEnrollment;