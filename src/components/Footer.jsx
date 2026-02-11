import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        {/* Section 1: Brand Info */}
        <div className="footer-section">
          <h3>Myanmar Education Portal</h3>
          <p>
            နိုင်ငံတကာအဆင့်မီ ပညာရေးကို အိမ်မှနေ၍ လေ့လာသင်ယူနိုင်သော 
            မြန်မာနိုင်ငံ၏ ထိပ်တန်း Online Learning Platform ဖြစ်ပါသည်။
          </p>
          <div className="social-links">
            <span className="social-icon">f</span>
            <span className="social-icon">t</span>
            <span className="social-icon">in</span>
            <span className="social-icon">yt</span>
          </div>
        </div>

        {/* Section 2: Quick Links */}
        <div className="footer-section">
          <h3>အမြန် လမ်းညွှန်</h3>
          <a href="#">ပင်မစာမျက်နှာ</a>
          <a href="#">ဖွင့်လှစ်ထားသော သင်တန်းများ</a>
          <a href="#">ဆရာ/ဆရာမများ</a>
          <a href="#">ကျောင်းအပ်နှံရန်</a>
        </div>

        {/* Section 3: Contact Info */}
        <div className="footer-section">
          <h3>ဆက်သွယ်ရန်</h3>
          <p>📍 အမှတ် (၁၂၃)၊ ပန်းလှိုင်လမ်း၊ စမ်းချောင်းမြို့နယ်၊ ရန်ကုန်မြို့။</p>
          <p>📞 09-123456789, 09-987654321</p>
          <p>📧 info@myanmaredu.com</p>
          <p>⏰ နေ့စဉ် (မနက် ၉:၀၀ - ည ၅:၀၀)</p>
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Myanmar Education Portal. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;