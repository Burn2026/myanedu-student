import { useState, useEffect } from 'react'
import './App.css'

// Components
import Navbar from './components/Navbar';
import SearchForm from './components/SearchForm';
import PublicRegister from './components/PublicRegister';
import CourseShowcase from './components/CourseShowcase'; 
import LoadingSpinner from './components/LoadingSpinner'; 
import Instructors from './components/Instructors';
import Footer from './components/Footer';
import StudentDashboard from './components/StudentDashboard'; 

function App() {
  const [view, setView] = useState('search'); 
  const [phone, setPhone] = useState("");
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]); 
  const [exams, setExams] = useState([]); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetBatchId, setTargetBatchId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- Page Load Logic ---
  useEffect(() => {
    try {
        const savedPhone = localStorage.getItem('studentPhone');
        const savedAuth = localStorage.getItem('studentAuth');

        if (savedPhone) {
            setPhone(savedPhone);
            if(savedAuth) {
                try {
                    const parsedAuth = JSON.parse(savedAuth);
                    if (parsedAuth && parsedAuth.id) setStudent(parsedAuth);
                } catch (e) {
                    localStorage.removeItem('studentAuth');
                }
            }
            fetchAllData(savedPhone); 
        }
    } catch (err) { console.error("App Init Error:", err); }
  }, []);

  const fetchAllData = async (phoneNum) => {
      if(!phoneNum) return;
      setLoading(true); 
      try {
        const studentRes = await fetch(`https://myanedu-backend.onrender.com/students/search?phone=${phoneNum}`);
        if (!studentRes.ok) {
          handleLogout();
          setError("Session Expired. Please login again.");
          return;
        }
        const studentData = await studentRes.json();
        
        if (studentData && studentData.id) {
            setStudent(studentData); 
            localStorage.setItem('studentAuth', JSON.stringify(studentData));

            const paymentRes = await fetch(`https://myanedu-backend.onrender.com/students/payments?phone=${phoneNum}`);
            const paymentData = await paymentRes.json();
            setPayments(Array.isArray(paymentData) ? paymentData : []); 

            const examRes = await fetch(`https://myanedu-backend.onrender.com/students/exams?phone=${phoneNum}`);
            const examData = await examRes.json();
            setExams(Array.isArray(examData) ? examData : []);
        } 
      } catch (err) {
        console.error(err);
        setError("Connection Error. Server ကို မချိတ်ဆက်နိုင်ပါ");
      } finally {
        setLoading(false); 
      }
  };

  const handleLoginSuccess = (loggedInPhone) => {
    localStorage.setItem('studentPhone', loggedInPhone);
    setPhone(loggedInPhone);
    setError(""); 
    fetchAllData(loggedInPhone);
  };

  const handleRegisterSuccess = (registeredPhone) => {
    localStorage.setItem('studentPhone', registeredPhone);
    setView('search');
    setPhone(registeredPhone);
    fetchAllData(registeredPhone);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentPhone');
    localStorage.removeItem('studentAuth');
    setStudent(null);
    setPhone("");
    setPayments([]);
    setExams([]);
    setView('search');
    window.location.reload(); 
  };

  const handleNavigate = (section) => {
    if (section === 'home') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
       if(!student) setView('search'); 
    } else {
       const element = document.getElementById(section);
       if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowcaseRegister = (batchId) => {
    setTargetBatchId(batchId); 
    setShowAuthModal(true);   
  };

  const handleExistingAccount = () => {
    setShowAuthModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError("မိမိဖုန်းနံပါတ်ဖြင့် Login ဝင်ပြီး ငွေပေးချေမှုကို ဆက်လက်ပြုလုပ်ပါ");
  };

  const handleNewAccount = () => {
    setShowAuthModal(false);
    setView('register'); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      
      <Navbar student={student} onLogout={handleLogout} onNavigate={handleNavigate} />

      {loading && <LoadingSpinner />}

      {/* Main Layout Logic:
          - If LOGGED IN: Render Dashboard Full Width (Sidebar handles layout)
          - If GUEST: Render Landing Page centered in .container
      */}
      
      {student && student.id ? (
          // --- LOGGED IN VIEW (Full Width) ---
          <div style={{ marginTop: '70px', flex: 1, width: '100%' }}>
             <StudentDashboard 
                student={student}
                payments={payments}
                exams={exams}
                onLogout={handleLogout}
                refreshData={() => fetchAllData(phone)}
                preSelectedBatch={targetBatchId}
            />
          </div>
      ) : (
          // --- GUEST VIEW (Centered Container) ---
          <div className="container">
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }} id="home">
              <h1 className="responsive-title" style={{ color: '#2563eb', marginBottom: '10px' }}>Myanmar Education Portal</h1>
              <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                  {view === 'search' ? "မိမိ၏ ကျောင်းအပ်နှံမှု အခြေအနေကို စစ်ဆေးပါ" : "ကျောင်းသားသစ် စာရင်းသွင်းရန်"}
              </p>
            </div>

            {view === 'register' && (
                <PublicRegister 
                  onRegisterSuccess={handleRegisterSuccess} 
                  onCancel={() => setView('search')} 
                />
            )}

            {view === 'search' && (
                <div style={{ marginBottom: '40px' }}>
                    <SearchForm onLoginSuccess={handleLoginSuccess} />
                    
                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <p style={{ color: '#64748b', marginBottom: '5px' }}>အကောင့်မရှိသေးဘူးလား?</p>
                        <button 
                            onClick={() => setView('register')}
                            style={{ 
                                background: 'none', border: 'none', color: '#2563eb', 
                                textDecoration: 'underline', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                            }}>
                            ကျောင်းသားသစ် စာရင်းသွင်းရန် နှိပ်ပါ
                        </button>
                    </div>

                    <div id="courses">
                      <CourseShowcase onRegisterClick={handleShowcaseRegister} />
                    </div>
                    <div style={{ margin: '60px 0' }}></div> 
                    <div id="instructors">
                      <Instructors />
                    </div>
                </div>
            )}
          </div>
      )}

      {/* Auth Modal (Pop up) */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="auth-modal-box">
            <div className="auth-modal-header">
              <h3>စာရင်းသွင်းရန် ရွေးချယ်ပါ</h3>
              <p>သင်တန်းအပ်နှံရန်အတွက် သင့်တွင် အကောင့်ရှိပါသလား?</p>
            </div>
            <div className="auth-options-grid">
              <div className="auth-option-card" onClick={handleExistingAccount}>
                <span className="auth-icon">🔐</span>
                <span className="auth-label">အကောင့်ရှိပြီးသား</span>
                <span className="auth-sub">Login ဝင်ပြီး ငွေသွင်းမည်</span>
              </div>
              <div className="auth-option-card" onClick={handleNewAccount}>
                <span className="auth-icon">📝</span>
                <span className="auth-label">အကောင့်သစ်ဖွင့်မည်</span>
                <span className="auth-sub">ကျောင်းသားသစ် စာရင်းသွင်းမည်</span>
              </div>
            </div>
            <button className="close-modal-btn" onClick={() => setShowAuthModal(false)}>
              မလုပ်ဆောင်တော့ပါ (Cancel)
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default App;