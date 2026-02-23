import React, { useState, useEffect, useRef } from 'react';
import './DiscussionSection.css'; // ✅ CSS အသစ်ချိတ်ဆက်ထားသည်

function DiscussionSection({ lessonId, studentName }) {
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ FIX: API Endpoint ကို Admin နှင့် တူညီအောင် ပြင်ဆင်ထားသည်
  const fetchComments = async () => {
    if (!lessonId) return;
    try {
      // မှတ်ချက် - backend တွင် public (သို့) admin comments လမ်းကြောင်းတူပါက /admin/comments ကိုသာ သုံးပါ
      const res = await fetch(`https://myanedu-backend.onrender.com/admin/comments?lesson_id=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Backend မှ data ဝင်လာသည့် ပုံစံအမျိုးမျိုးကို အလိုအလျောက် ဖြေရှင်းပေးမည်
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
    const interval = setInterval(fetchComments, 5000); // 5 စက္ကန့်တစ်ခါ အလိုလို refresh လုပ်မည်
    return () => clearInterval(interval);
  }, [lessonId]);

  // အောက်ဆုံးသို့ အလိုအလျောက် scroll လုပ်မည်
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !lessonId) return;

    setLoading(true);
    try {
      // ✅ FIX: Backend သို့ပို့မည့် API လမ်းကြောင်းကို အမှန်တကယ်အလုပ်လုပ်သော admin/comments သို့ ပြောင်းထားသည်
      // (ကျောင်းသားအတွက် သီးသန့် students/comments ရှိပါက ထိုလမ်းကြောင်းကို ပြန်ပြောင်းပေးနိုင်ပါသည်)
      await fetch('https://myanedu-backend.onrender.com/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          user_name: studentName || 'Student', // နာမည်မရှိပါက Student ဟုထားမည်
          user_role: 'student', // ✅ Admin နှင့်ခွဲခြားရန်
          message: newMessage,
          comment: newMessage // Backend လိုအပ်ချက်အရ နှစ်မျိုးလုံးပို့ထားသည်
        })
      });
      setNewMessage("");
      fetchComments(); // စာပို့ပြီးသည်နှင့် ချက်ချင်းပြန်ခေါ်မည်
    } catch (err) {
      alert("Network Error: အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ds-container">
      <div className="ds-header">
        <div className="ds-header-icon">💬</div>
        <h3 className="ds-title">Q&A Discussion</h3>
        <span className="ds-badge">{comments.length} message(s)</span>
      </div>

      {/* Messages Area */}
      <div className="ds-chat-area">
        {comments.length === 0 ? (
          <div className="ds-empty-state">
              <div className="ds-empty-icon">👋</div>
              <p>No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          comments.map((c, index) => {
            const isAdmin = c.user_role === 'admin' || c.role === 'admin' || c.isAdmin === true;
            // ကျောင်းသားကိုယ်တိုင် ပို့ထားသောစာဖြစ်ပါက ညာဘက်တွင်ပြမည်
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
  );
}

export default DiscussionSection;