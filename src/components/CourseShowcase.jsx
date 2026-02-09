import { useState, useEffect } from 'react';

function CourseShowcase({ onRegisterClick }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/public/promo-courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  }, []);

  const getIcon = (title) => {
    if (title.includes('English')) return '🇬🇧';
    if (title.includes('Japanese')) return '🇯🇵';
    if (title.includes('Korean')) return '🇰🇷';
    if (title.includes('Chinese')) return '🇨🇳';
    return '📚';
  };

  return (
    <div className="promo-section">
      <div className="promo-header">
        <span style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b', letterSpacing: '2px'}}>THIS MONTH'S CLASSES</span>
        <h2 className="promo-title">ဖွင့်လှစ်မည့် သင်တန်းများ</h2>
      </div>
      
      <div className="promo-grid">
        {courses.map((course) => (
          <div key={course.id} className="promo-card" style={{ opacity: course.is_full ? 0.8 : 1 }}>
            
            <div className={`status-badge-corner ${course.is_full ? 'status-full' : 'status-open'}`}>
              {course.is_full ? 'CLOSED' : 'OPEN'}
            </div>

            <div className="course-img-placeholder">
              {getIcon(course.course_name)}
            </div>

            <h3 className="promo-course-title">{course.course_name}</h3>
            <p className="promo-batch">{course.batch_name}</p>

            {!course.is_full && (
               <div className="seats-info">🔥 {course.seats_left} seats left</div>
            )}
            {course.is_full && (
               <div className="seats-info" style={{color: '#ef4444'}}>⛔ Fully Booked</div>
            )}

            <button 
              className={`promo-btn ${course.is_full ? 'btn-full' : 'btn-register'}`}
              // (ပြင်ဆင်ချက်) အတန်း ID ကိုပါ onRegisterClick ထဲ ထည့်ပေးလိုက်သည်
              onClick={() => !course.is_full && onRegisterClick(course.id)} 
              disabled={course.is_full}
            >
              {course.is_full ? "လူပြည့်သွားပါပြီ" : "ယခု စာရင်းသွင်းမည်"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseShowcase;