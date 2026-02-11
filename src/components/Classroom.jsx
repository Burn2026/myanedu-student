import React, { useState, useEffect } from 'react';
import DiscussionSection from './DiscussionSection';
import './Classroom.css';

function Classroom({ batchId, courseName, onBack, studentName }) {
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://myanedu-backend.onrender.com/public/lessons?batch_id=${batchId}`)
      .then(res => res.json())
      .then(data => {
        setLessons(data);
        if (data.length > 0) setCurrentLesson(data[0]); 
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [batchId]);

  return (
    <>  <div className="classroom-container">
        {/* Left: Video */}
        <div className="video-section">
             <button onClick={onBack} style={{marginBottom: '15px', background: 'none', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer'}}>← Back to Classes</button>
             
             {loading ? <p>Loading...</p> : currentLesson ? (
               <>
                 <div className="video-wrapper">
                    <video controls className="video-player" key={currentLesson.video_url}>
                       <source src={`https://myanedu-backend.onrender.com/${currentLesson.video_url}`} type="video/mp4" />
                    </video>
                 </div>
                 <h2 style={{fontSize: '20px', marginBottom: '10px'}}>{currentLesson.title}</h2>
                 <p style={{color: '#64748b', fontSize: '14px', lineHeight: '1.6'}}>{currentLesson.description}</p>
                 
                 <DiscussionSection lessonId={currentLesson.id} studentName={studentName} />
               </>
             ) : <p>No lessons available.</p>}
        </div>

        {/* Right: Playlist */}
        <div className="playlist-sidebar">
            <div style={{padding: '15px', background: '#f8fafc', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0'}}>
                Course Content ({lessons.length})
            </div>
            {lessons.map((lesson, idx) => (
                <div key={lesson.id} className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''}`} onClick={() => setCurrentLesson(lesson)}>
                    <div style={{background: currentLesson?.id === lesson.id ? '#2563eb' : '#e2e8f0', color: currentLesson?.id === lesson.id ? 'white' : '#64748b', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>{idx + 1}</div>
                    <div style={{fontSize: '14px', fontWeight: '500'}}>{lesson.title}</div>
                </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default Classroom;