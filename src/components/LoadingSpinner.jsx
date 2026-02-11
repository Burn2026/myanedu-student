import React from 'react';
import './LoadingSpinner.css';

// Props လက်ခံအောင် ပြင်လိုက်သည်
function LoadingSpinner({ message = "လုပ်ဆောင်နေပါသည်...", isSuccess = false }) {
  return (
    <div className="loading-overlay">
      {isSuccess ? (
        // Success ဖြစ်ရင် အမှန်ခြစ်ပြမည်
        <div className="success-icon-circle" style={{ marginBottom: '20px', animation: 'popIn 0.5s' }}>
          <span className="success-icon">✓</span>
        </div>
      ) : (
        // Loading ဖြစ်ရင် Spinner ပြမည်
        <div className="spinner"></div>
      )}
      
      <div 
        className="loading-text" 
        style={{ 
            color: isSuccess ? '#16a34a' : '#334155', // Success ဆို အစိမ်းရောင်စာလုံးပြမည်
            fontSize: isSuccess ? '18px' : '16px'
        }}
      >
        {message}
      </div>
    </div>
  );
}

export default LoadingSpinner;