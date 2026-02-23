import React, { useState, useEffect, useRef } from 'react';
import './DiscussionSection.css'; 

function DiscussionSection({ lessonId, studentName }) {
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  const [readCount, setReadChats] = useState(() => {
      const saved = localStorage.getItem(`studentRead_${lessonId}`);
      return saved ? parseInt(saved, 10) : 0;
  });

  const fetchComments = async () => {
    if (!lessonId) return;
    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/admin/comments?lesson_id=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        let messages = [];
        if (Array.isArray(data)) {
            messages = data;
        } else if (data && Array.isArray(data.data)) {
            messages = data.data;
        } else if (data && Array.isArray(data.comments)) {
            messages = data.comments;
        }
        setComments(messages);
      }
    } catch (err) { console.error("Error fetching comments:", err); }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 5000); 
    return () => clearInterval(interval);
  }, [lessonId]);

  useEffect(() => {
    if (isOpen && comments.length > 0) {
        setReadChats(comments.length);
        localStorage.setItem(`studentRead_${lessonId}`, comments.length.toString());
    }
  }, [isOpen, comments, lessonId]);

  useEffect(() => {
    if (isOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !lessonId) return;

    setLoading(true);
    try {
      await fetch('https://myanedu-backend.onrender.com/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          user_name: studentName || 'Student', 
          user_role: 'student', 
          message: newMessage,
          comment: newMessage 
        })
      });
      setNewMessage("");
      fetchComments(); 
    } catch (err) {
      alert("Network Error: အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။");
    } finally {
      setLoading(false);
    }
  };

  // စာအသစ် အရေအတွက် တွက်ချက်ခြင်း
  const hasNewMessage = comments.length > readCount;
  const unreadCount = comments.length - readCount;

  return (
    <div className="ds-container">
      
      {/* Clickable Header for Toggle */}
      <div className="ds-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="ds-header-icon">💬</div>
        <h3 className="ds-title">
            Q&A Discussion
            {/* စာအသစ်ရှိပြီး ပိတ်ထားပါက အနီရောင်အစက်ပြမည် */}
            {hasNewMessage && !isOpen && <span className="ds-red-dot"></span>}
        </h3>
        
        {/* ✅ FIX: စာအသစ်ရှိပြီး မဖွင့်ရသေးမှသာ အရေအတွက်ကို ပြမည်။ ဖွင့်ပြီးသွားလျှင် အပြီးတိုင် ဖျောက်ထားမည်။ */}
        {hasNewMessage && !isOpen && (
            <span className="ds-badge">{unreadCount} New</span>
        )}
        
        {/* Toggle Icon (အပေါ်/အောက် မြှား) */}
        <div className={`ds-chevron ${isOpen ? 'open' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="18" height="18">
             <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
           </svg>
        </div>
      </div>

      {/* Messages Area (ဖွင့်ထားမှသာ ပြမည်) */}
      {isOpen && (
        <div className="ds-body-wrapper">
            <div className="ds-chat-area">
              {comments.length === 0 ? (
                <div className="ds-empty-state">
                    <div className="ds-empty-icon">👋</div>
                    <p>No questions yet. Ask your teacher!</p>
                </div>
              ) : (
                comments.map((c, index) => {
                  const isAdmin = c.user_role === 'admin' || c.role === 'admin' || c.isAdmin === true;
                  const isMe = c.user_name === studentName || c.user_role === 'student';
                  const messageContent = c.message || c.comment || c.text || "No content";
                  const timeString = c.created_at ? new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                  return (
                    <div key={c.id || index} className={`ds-message-row ${isMe ? 'is-me' : 'is-other'}`}>
                      <div className="ds-message-sender">
                          {isAdmin ? '🎓 Teacher (Admin)' : (isMe ? 'You' : `👤 ${c.user_name}`)}
                      </div>
                      <div className={`ds-message-bubble ${isAdmin ? 'admin-bubble' : ''}`}>
                          {messageContent}
                      </div>
                      {timeString && <div className="ds-message-time">{timeString}</div>}
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="ds-reply-form">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask a question about this lesson..."
                className="ds-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !newMessage.trim()}
                className="ds-btn-send"
              >
                {loading ? (
                   <span className="ds-spinner"></span>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                     <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                   </svg>
                )}
              </button>
            </form>
        </div>
      )}
    </div>
  );
}

export default DiscussionSection;