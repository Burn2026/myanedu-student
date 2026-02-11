import { useState, useEffect } from 'react';

function CourseShowcase({ onRegisterClick }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/public/promo-courses')
      .then(res => res.json())
      .then(data => {
        // Backend က Array မဟုတ်ဘဲ Error ပြန်လာရင် စစ်မယ်
        if (Array.isArray(data)) {
            setCourses(data);
        } else {
            console.error("Invalid data format:", data);
            setCourses([]); // Array မဟုတ်ရင် ဘာမှမပြဘူး
        }
      })
      .catch(err => {
          console.error(err);
          setCourses([]);
      });
  }, []);

  const getIcon = (title) => {
    // Safety Check: Title မရှိရင် (သို့) undefined ဖြစ်နေရင် စာအုပ်ပုံပဲ ပြမယ် (Error မတက်အောင် ကာကွယ်ခြင်း)
    if (!title) return '📚';

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
        {courses.length > 0 ? (
            courses.map((course) => (
            <div key={course.id} className="promo-card" style={{ opacity: course.is_full ? 0.8 : 1 }}>
                
                <div className={`status-badge-corner ${course.is_full ? 'status-full' : 'status-open'}`}>
                {course.is_full ? 'CLOSED' : 'OPEN'}
                </div>

                <div className="course-img-placeholder">
                {/* ဒီနေရာမှာ course_name (သို့) title လို့ Backend ကလာတဲ့ နာမည်အတိုင်းထည့်ပါ */}
                {getIcon(course.course_name || course.title)}
                </div>

                <h3 className="promo-course-title">{course.course_name || course.title}</h3>
                <p className="promo-batch">{course.batch_name}</p>

                {!course.is_full && (
                    <div className="seats-info">🔥 {course.seats_left || 0} seats left</div>
                )}
                {course.is_full && (
                    <div className="seats-info" style={{color: '#ef4444'}}>⛔ Fully Booked</div>
                )}

                <button 
                className={`promo-btn ${course.is_full ? 'btn-full' : 'btn-register'}`}
                onClick={() => !course.is_full && onRegisterClick(course.id)} 
                disabled={course.is_full}
                >
                {course.is_full ? "လူပြည့်သွားပါပြီ" : "ယခု စာရင်းသွင်းမည်"}
                </button>
            </div>
            ))
        ) : (
            <p style={{textAlign: 'center', color: '#666'}}>သင်တန်းများ ရှာဖွေနေပါသည်...</p>
        )}
      </div>
    </div>
  );
}

export default CourseShowcase;