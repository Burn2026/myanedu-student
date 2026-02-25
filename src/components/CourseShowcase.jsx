import { useState, useEffect } from 'react';
import './CourseShowcase.css';

function CourseShowcase({ onRegisterClick }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state ထည့်ထားသည်

  useEffect(() => {
    // ✅ FIX: ယခင် promo-courses အစား Admin ထိန်းချုပ်သော active-batches API ကို ချိတ်ဆက်ခြင်း
    fetch('https://myanedu-backend.onrender.com/students/active-batches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setCourses(data);
        } else {
            console.error("Invalid data format:", data);
            setCourses([]);
        }
        setLoading(false);
      })
      .catch(err => {
          console.error("Fetch Error:", err);
          setCourses([]);
          setLoading(false);
      });
  }, []);

  const getIcon = (title) => {
    if (!title) return '📚';
    const t = title.toLowerCase();
    if (t.includes('english')) return '🇬🇧';
    if (t.includes('japanese')) return '🇯🇵';
    if (t.includes('korean')) return '🇰🇷';
    if (t.includes('chinese')) return '🇨🇳';
    return '📚';
  };

  return (
    <div className="promo-section">
      <div className="promo-header">
        <span style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b', letterSpacing: '2px'}}>THIS MONTH'S CLASSES</span>
        <h2 className="promo-title">ဖွင့်လှစ်မည့် သင်တန်းများ</h2>
      </div>
      
      {loading ? (
        <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>Loading Classes...</p>
      ) : (
        <div className="promo-grid">
            {courses.length > 0 ? (
                courses.map((course) => (
                <div key={course.id} className="promo-card">
                    
                    {/* Status Badge */}
                    <div className="status-badge-corner status-open">
                        OPEN
                    </div>

                    <div className="course-img-placeholder">
                        {getIcon(course.course_name || course.title)}
                    </div>

                    {/* Course Title & Batch */}
                    <h3 className="promo-course-title">{course.course_name}</h3>
                    <p className="promo-batch">{course.batch_name}</p>

                    {/* ✅ FIX: Seats Left အစား Admin သတ်မှတ်ထားသော Fees (ဈေးနှုန်း) ကို ပြသခြင်း */}
                    <div className="seats-info" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                        💰 {Number(course.fees).toLocaleString()} Ks
                    </div>

                    {/* Register Button */}
                    <button 
                        className="promo-btn btn-register"
                        onClick={() => onRegisterClick(course.id)} 
                    >
                        ယခု စာရင်းသွင်းမည်
                    </button>
                </div>
                ))
            ) : (
                <p style={{textAlign: 'center', color: '#666', gridColumn: '1/-1'}}>
                    လောလောဆယ် သင်တန်းများ မရှိသေးပါ။
                </p>
            )}
        </div>
      )}
    </div>
  );
}

export default CourseShowcase;