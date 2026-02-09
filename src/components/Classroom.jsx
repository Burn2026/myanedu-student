import React, { useState, useEffect } from 'react';
import DiscussionSection from './DiscussionSection'; // (NEW) Import

function Classroom({ batchId, courseName, onBack, studentName }) { // (NEW) Accept studentName prop
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data Fetching
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
    <>
      <style>
        {`
          .classroom-container {
            display: flex;
            flex-direction: column;
            height: 85vh;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
          }
          .classroom-header {
            padding: 15px 25px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fff;
          }
          .classroom-body {
            display: flex;
            flex: 1;
            overflow: hidden;
          }
          .video-section {
            flex: 1;
            padding: 25px;
            overflow-y: auto;
            background: #f8fafc;
          }
          .video-wrapper {
            width: 100%;
            aspect-ratio: 16 / 9;
            background: black;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          .video-player {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .playlist-sidebar {
            width: 350px;
            border-left: 1px solid #e2e8f0;
            background: white;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
          }
          .lesson-item {
            padding: 15px 20px;
            border-bottom: 1px solid #f1f5f9;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: start;
            gap: 12px;
          }
          .lesson-item:hover {
            background: #f8fafc;
          }
          .lesson-item.active {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
          }
          @media (max-width: 900px) {
            .classroom-container {
              height: auto;
              min-height: 80vh;
            }
            .classroom-body {
              flex-direction: column;
            }
            .video-section {
              padding: 15px;
            }
            .playlist-sidebar {
              width: 100%;
              height: 400px;
              border-left: none;
              border-top: 1px solid #e2e8f0;
            }
          }
        `}
      </style>

      <div className="classroom-container">
        
        {/* Header */}
        <div className="classroom-header">
          <div>
             <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>📺 {courseName}</h3>
             <span style={{ fontSize: '12px', color: '#64748b' }}>Premium Video Classroom</span>
          </div>
          <button onClick={onBack} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569', transition: '0.2s' }}>
            ← Back
          </button>
        </div>

        <div className="classroom-body">
          
          {/* (Left) Video Player & Discussion Area */}
          <div className="video-section">
             {loading ? (
                <div style={{textAlign: 'center', padding: '50px', color: '#64748b'}}>Loading Lessons...</div>
             ) : (
               currentLesson ? (
                 <>
                   {/* Video Player Wrapper */}
                   <div className="video-wrapper">
                      <video 
                        controls 
                        className="video-player"
                        key={currentLesson.video_url} 
                        poster="https://via.placeholder.com/1280x720/000000/FFFFFF/?text=Loading+Video..." 
                      >
                        <source src={`https://myanedu-backend.onrender.com/${currentLesson.video_url}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                   </div>

                   <h2 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '22px' }}>{currentLesson.title}</h2>
                   
                   <div style={{ padding: '20px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', lineHeight: '1.6', color: '#475569' }}>
                      <strong style={{display:'block', marginBottom:'8px', color:'#334155'}}>📝 Lesson Description:</strong>
                      {currentLesson.description || "No description provided."}
                   </div>

                   {/* (NEW) Discussion Section */}
                   <DiscussionSection 
                      lessonId={currentLesson.id} 
                      studentName={studentName} 
                   />
                 </>
               ) : (
                 <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                    <div style={{fontSize: '40px', marginBottom: '10px'}}>📂</div>
                    <h3>No Lessons Uploaded Yet</h3>
                    <p>ဆရာမများ သင်ခန်းစာ တင်မည့်အချိန်ကို စောင့်မျှော်ပေးပါ။</p>
                 </div>
               )
             )}
          </div>

          {/* (Right) Lesson List Sidebar */}
          <div className="playlist-sidebar">
             <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', position: 'sticky', top: 0 }}>
               <div style={{fontWeight: 'bold', color: '#334155'}}>Course Content</div>
               <div style={{fontSize: '12px', color: '#64748b'}}>{lessons.length} Lessons Total</div>
             </div>
             
             {lessons.map((lesson, index) => (
               <div 
                 key={lesson.id}
                 className={`lesson-item ${currentLesson?.id === lesson.id ? 'active' : ''}`}
                 onClick={() => setCurrentLesson(lesson)}
               >
                  <div style={{ 
                      minWidth: '24px', height: '24px', borderRadius: '50%', background: currentLesson?.id === lesson.id ? '#2563eb' : '#e2e8f0', 
                      color: currentLesson?.id === lesson.id ? 'white' : '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                  }}>
                      {index + 1}
                  </div>
                  <div>
                      <div style={{ fontWeight: '500', color: currentLesson?.id === lesson.id ? '#2563eb' : '#1e293b', fontSize: '14px' }}>
                         {lesson.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                         <span>🎥 Video Lesson</span>
                      </div>
                  </div>
               </div>
             ))}
          </div>

        </div>
      </div>
    </>
  );
}

export default Classroom;