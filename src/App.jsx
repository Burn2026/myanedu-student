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

  // --- (New) Page Load ဖြစ်တာနဲ့ Login စစ်ဆေးခြင်း ---
  useEffect(() => {
    const savedPhone = localStorage.getItem('studentPhone');
    if (savedPhone) {
        setPhone(savedPhone);
        fetchAllData(savedPhone); // ဖုန်းနံပါတ်ရှိရင် Data ချက်ချင်းပြန်ဆွဲမယ်
    }
  }, []);

  // Data များကို ဆွဲယူမည့် Function
  const fetchAllData = async (phoneNum) => {
      setLoading(true); 
      try {
        const studentRes = await fetch(`https://myanedu-backend.onrender.com/students/search?phone=${phoneNum}`);
        if (!studentRes.ok) {
          // Data မတွေ့ရင် LocalStorage ပါ ရှင်းပစ်မယ် (Logout သဘောမျိုး)
          localStorage.removeItem('studentPhone');
          setStudent(null);
          setError("Session Expired. Please login again.");
          return;
        }
        const studentData = await studentRes.json();
        setStudent(studentData); 

        // ကျန် Data များ ဆက်ဆွဲမယ်
        const paymentRes = await fetch(`https://myanedu-backend.onrender.com/students/payments?phone=${phoneNum}`);
        const paymentData = await paymentRes.json();
        setPayments(paymentData);

        const examRes = await fetch(`https://myanedu-backend.onrender.com/students/exams?phone=${phoneNum}`);
        const examData = await examRes.json();
        setExams(examData);

      } catch (err) {
        setError("Connection Error. Server ကို မချိတ်ဆက်နိုင်ပါ");
      } finally {
        setLoading(false); 
      }
  };

  // Login အောင်မြင်ပါက
  const handleLoginSuccess = (loggedInPhone) => {
    // (New) Browser ထဲ မှတ်ထားမည်
    localStorage.setItem('studentPhone', loggedInPhone);
    
    setPhone(loggedInPhone);
    setError(""); 
    fetchAllData(loggedInPhone);
  };

  // Register အောင်မြင်ပါက
  const handleRegisterSuccess = (registeredPhone) => {
    // (New) Browser ထဲ မှတ်ထားမည်
    localStorage.setItem('studentPhone', registeredPhone);

    setView('search');
    setPhone(registeredPhone);
    fetchAllData(registeredPhone);
  };

  // Logout လုပ်ပါက
  const handleLogout = () => {
    // (New) Browser ထဲကပါ ဖျက်မည်
    localStorage.removeItem('studentPhone');

    setStudent(null);
    setPhone("");
    setPayments([]);
    setExams([]);
    setView('search');
  };

  const handleNavigate = (section) => {
    if (section === 'home') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <Navbar student={student} onLogout={handleLogout} onNavigate={handleNavigate} />

      {loading && <LoadingSpinner />}

      <div className="container" style={{ maxWidth: '1200px', marginTop: '100px', flex: 1 }}>
        
        {/* Header Title (Login မဝင်ရသေးမှ ပြမည်) */}
        {!student && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }} id="home">
            <h1 style={{ color: '#2563eb', marginBottom: '10px' }}>Myanmar Education Portal</h1>
            <p style={{ color: '#6b7280' }}>
                {view === 'search' ? "မိမိ၏ ကျောင်းအပ်နှံမှု အခြေအနေကို စစ်ဆေးပါ" : "ကျောင်းသားသစ် စာရင်းသွင်းရန်"}
            </p>
          </div>
        )}

        {/* View 1: Register Form */}
        {view === 'register' && (
            <PublicRegister 
              onRegisterSuccess={handleRegisterSuccess} 
              onCancel={() => setView('search')} 
            />
        )}

        {/* View 2: Search/Login & Public Info */}
        {view === 'search' && !student && (
            <div style={{ marginBottom: '40px' }}>
                <SearchForm onLoginSuccess={handleLoginSuccess} />
                
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <p style={{ color: '#666' }}>အကောင့်မရှိသေးဘူးလား?</p>
                    <button 
                        onClick={() => setView('register')}
                        style={{ 
                            background: 'none', border: 'none', color: '#2563eb', 
                            textDecoration: 'underline', cursor: 'pointer', fontSize: '16px' 
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

        {/* View 3: Student Dashboard (Login ဝင်ပြီး) */}
        {student && (
            <StudentDashboard 
                student={student}
                payments={payments}
                exams={exams}
                onLogout={handleLogout}
                refreshData={() => fetchAllData(phone)}
                preSelectedBatch={targetBatchId}
            />
        )}

        {/* Auth Modal */}
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

      </div>

      <Footer />
    </div>
  )
}

export default App;