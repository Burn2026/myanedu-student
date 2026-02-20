import React, { useState, useEffect } from 'react';
import DiscussionSection from './DiscussionSection';
import './Classroom.css';

function Classroom({ batchId, courseName, onBack, studentName }) {
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ (FIXED) API လမ်းကြောင်းကို /students/lessons သို့ ပြောင်းထားပါသည်
    fetch(`https://myanedu-backend.onrender.com/students/lessons?batch_id=${batchId}`)
      .then(res => {
          if (!res.ok) throw new Error("Failed to fetch lessons");
          return res.json();
      })
      .then(data => {
        setLessons(data);
        if (data.length > 0) setCurrentLesson(data[0]); 
        setLoading(false);
      })
      .catch(err => {
          console.error("Lesson Fetch Error:", err);
          setLoading(false);
      });
  }, [batchId]);

  // ✅ (NEW) Video URL ကို Cloudinary သို့မဟုတ် Local အလိုအလျောက် ခွဲခြားပေးမည့် Function
  const getVideoUrl = (path) => {
    if (!path) return "";
    let cleanPath = String(path).trim().replace(/\\/g, '/');
    
    // Cloudinary URL (http/https) ပါရင် တိုက်ရိုက်ယူမည်
    const httpIndex = cleanPath.indexOf("http");
    if (httpIndex !== -1) {
        return cleanPath.substring(httpIndex);
    }
    
    // Cloudinary URL ဖြစ်ပြီး http မပါခဲ့ရင်
    if (cleanPath.includes("cloudinary.com")) {
        cleanPath = cleanPath.replace(/^\/+/, ''); 
        return `https://${cleanPath}`;
    }
    
    // Local Server Path အတွက်
    cleanPath = cleanPath.replace(/^\/+/, '');
    return `https://myanedu-backend.onrender.com/${cleanPath}`;
  };

  return (
    <div className="classroom-wrapper">
      <div className="classroom-container">
        
        {/* Left/Top: Video Section */}
        <div className="video-section">
             <button onClick={onBack} className="back-btn">
                ← Back to Classes
             </button>
             
             {loading ? (
                 <div className="loading-state">Loading lessons...</div>
             ) : currentLesson ? (
               <>
                 <div className="video-wrapper">
                    {/* ✅ Video URL ကို Helper Function ဖြင့် ပြင်ဆင်ထားသည် */}
                    <video controls className="video-player" key={currentLesson.video_url} controlsList="nodownload">
                       <source src={getVideoUrl(currentLesson.video_url)} type="video/mp4" />
                       Your browser does not support HTML video.
                    </video>
                 </div>
                 <h2 className="lesson-title">{currentLesson.title}</h2>
                 <p className="lesson-desc">{currentLesson.description}</p>
                 
                 <div className="discussion-wrapper">
                    <DiscussionSection lessonId={currentLesson.id} studentName={studentName} />
                 </div>
               </>
             ) : (
                 <div className="no-lesson-state">
                     <p>No lessons available for this course yet.</p>
                 </div>
             )}
        </div>

        {/* Right/Bottom: Playlist Sidebar */}
        <div className="playlist-sidebar">
            <div className="playlist-header">
                Course Content ({lessons.length})
            </div>
            <div className="playlist-items">
                {lessons.map((lesson, idx) => (
                    <div 
                        key={lesson.id} 
                        className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''}`} 
                        onClick={() => setCurrentLesson(lesson)}
                    >
                        <div className={`lesson-number ${currentLesson?.id === lesson.id ? 'active-num' : ''}`}>
                            {idx + 1}
                        </div>
                        <div className="lesson-name">{lesson.title}</div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}

export default Classroom;