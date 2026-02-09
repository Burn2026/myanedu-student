import React, { useState, useEffect } from 'react';

function DiscussionSection({ lessonId, studentName }) {
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Comment များကို ဆွဲယူခြင်း
  const fetchComments = async () => {
    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/public/comments?lesson_id=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (lessonId) fetchComments();
    // Real-time သဘောမျိုးဖြစ်အောင် ၅ စက္ကန့်တစ်ကြိမ် Auto Refresh လုပ်ပေးနိုင်သည်
    const interval = setInterval(() => {
        if(lessonId) fetchComments();
    }, 5000);
    return () => clearInterval(interval);
  }, [lessonId]);

  // Comment အသစ်တင်ခြင်း
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await fetch('https://myanedu-backend.onrender.com/students/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          user_name: studentName,
          message: newMessage
        })
      });
      setNewMessage("");
      fetchComments(); // ချက်ချင်းပြန်ဆွဲမည်
    } catch (err) {
      alert("Error sending message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
        💬 Q&A Discussion
      </h3>

      {/* Messages List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {comments.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>No questions yet. Be the first to ask!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={{ 
                alignSelf: c.user_role === 'admin' ? 'flex-start' : 'flex-end',
                maxWidth: '80%',
                display: 'flex', flexDirection: 'column', 
                alignItems: c.user_role === 'admin' ? 'flex-start' : 'flex-end' 
            }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>
                    {c.user_role === 'admin' ? '🎓 ' : ''}{c.user_name}
                </div>
                <div style={{
                    background: c.user_role === 'admin' ? '#eff6ff' : '#2563eb',
                    color: c.user_role === 'admin' ? '#1e293b' : 'white',
                    padding: '10px 15px', borderRadius: '12px',
                    borderTopLeftRadius: c.user_role === 'admin' ? '0' : '12px',
                    borderTopRightRadius: c.user_role === 'student' ? '0' : '12px',
                    fontSize: '14px', lineHeight: '1.5',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                    {c.message}
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
                    {new Date(c.created_at).toLocaleTimeString()}
                </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: '#2563eb', color: 'white', border: 'none', 
            padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' 
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default DiscussionSection;