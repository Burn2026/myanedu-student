import React, { useState } from 'react';
import './StudentCard.css';

function StudentCard({ student, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // အထွေထွေ အချက်အလက်များအတွက် State
  const [formData, setFormData] = useState({
    name: student.name,
    address: student.address,
  });

  // (New) စကားဝှက် ပြောင်းလဲခြင်းအတွက် သီးသန့် State
  const [passwordInputs, setPasswordInputs] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if(selected) setPreview(URL.createObjectURL(selected));
  };

  // Edit Mode ပိတ်ရင် State တွေကို မူလအတိုင်း ပြန်ထားမည်
  const handleCancel = () => {
    setIsEditing(false);
    setPreview(null);
    setFile(null);
    setFormData({ name: student.name, address: student.address });
    setPasswordInputs({ oldPassword: '', newPassword: '' }); // Password fields ကိုရှင်းမည်
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('address', formData.address);
    if (file) data.append('profile_image', file);

    // (New) စကားဝှက်အသစ် ထည့်ထားမှသာ Backend သို့ ပို့မည်
    if (passwordInputs.newPassword) {
        data.append('old_password', passwordInputs.oldPassword);
        data.append('new_password', passwordInputs.newPassword);
    }

    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/students/profile/${student.id}`, {
        method: 'PUT',
        body: data
      });

      const resJson = await res.json();

      if (res.ok) {
        alert("✅ " + resJson.message);
        setIsEditing(false);
        setPasswordInputs({ oldPassword: '', newPassword: '' }); // Reset inputs
        if (onUpdate) onUpdate(); 
      } else {
        // Backend မှ ပို့လိုက်သော Error Message (ဥပမာ: စကားဝှက်အဟောင်းမှားနေခြင်း) ကို ပြမည်
        alert("❌ Update Failed: " + resJson.message);
      }
    } catch (err) { alert("Server Error. Please try again later."); }
    finally { setLoading(false); }
  };

  // ... (Style အပိုင်းက မူလအတိုင်းပဲမို့ ချန်လှပ်ထားပါတယ် - ယခင်ကုဒ်အတိုင်းထားပါ) ...
  // style Tag အဖွင့်အပိတ်ကို ဒီကြားထဲမှာ ထည့်ထားပါ
    return (
    <>
      <style>
        {`
          .profile-container { display: flex; justify-content: center; align-items: flex-start; gap: 30px; padding: 20px; flex-wrap: wrap; }
          .identity-card { background: white; border-radius: 20px; padding: 40px 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; flex: 1; min-width: 300px; max-width: 400px; position: relative; overflow: hidden; }
          .identity-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 120px; background: linear-gradient(135deg, #2563eb, #60a5fa); z-index: 0; }
          .avatar-wrapper { position: relative; z-index: 1; margin-top: 40px; margin-bottom: 15px; }
          .avatar { width: 120px; height: 120px; border-radius: 50%; border: 5px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); object-fit: cover; background: #fff; }
          .student-name { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; position: relative; z-index: 1; }
          .student-role { font-size: 14px; color: #64748b; margin-bottom: 20px; font-weight: 500; position: relative; z-index: 1; }
          .details-card { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; flex: 2; min-width: 300px; }
          .section-title { font-size: 18px; font-weight: 700; color: #334155; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9; }
          .info-row { display: flex; margin-bottom: 20px; align-items: center; }
          .info-label { width: 120px; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; }
          .info-value { color: #1e293b; font-weight: 500; font-size: 15px; }
          .edit-btn { background: #2563eb; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); }
          .edit-btn:hover { background: #1d4ed8; transform: translateY(-2px); }
          .form-group { margin-bottom: 20px; }
          .form-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #475569; }
          .form-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; }
          .form-input:focus { border-color: #2563eb; outline: none; }
          .cancel-btn { background: transparent; color: #64748b; border: 1px solid #cbd5e1; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 600; margin-right: 10px; }
          .image-upload-wrapper { text-align: center; margin-bottom: 20px; border: 2px dashed #cbd5e1; padding: 20px; border-radius: 10px; cursor: pointer; transition: border-color 0.2s; }
          .image-upload-wrapper:hover { border-color: #2563eb; }
          @media (max-width: 768px) { .profile-container { flex-direction: column; align-items: stretch; } .identity-card { max-width: 100%; } }
        `}
      </style>

      <div className="profile-container">
        
        {/* --- Left Column: Identity (No Changes) --- */}
        <div className="identity-card">
          <div className="avatar-wrapper">
            {student.profile_image || preview ? (
               <img src={preview || `https://myanedu-backend.onrender.com/${student.profile_image}`} alt="Profile" className="avatar" />
            ) : (
               <div className="avatar" style={{display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', color:'#2563eb', background:'#eff6ff'}}>
                 {student.name.charAt(0)}
               </div>
            )}
          </div>
          <h2 className="student-name">{student.name}</h2>
          <p className="student-role">Student Account</p>
          <p style={{color: '#64748b', fontSize: '13px'}}>{student.phone_primary}</p>
          
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="edit-btn" style={{width: '100%', marginTop: '20px'}}>
              ⚙️ Settings
            </button>
          )}
        </div>

        {/* --- Right Column: Details or Edit Form --- */}
        <div className="details-card">
          
          {!isEditing ? (
            /* --- View Mode (No Changes) --- */
            <>
              <h3 className="section-title">Personal Information</h3>
              <div className="info-row">
                <div className="info-label">Address</div>
                <div className="info-value">{student.address || "Not set"}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Date of Birth</div>
                <div className="info-value">
                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : "Not set"}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Phone (2)</div>
                <div className="info-value">{student.phone_secondary || "-"}</div>
              </div>

              <h3 className="section-title" style={{marginTop: '30px'}}>Account Security</h3>
              <div className="info-row">
                <div className="info-label">Password</div>
                {/* Password ကို လုံးဝမပြတော့ဘဲ အစက်တွေပဲပြမည် */}
                <div className="info-value" style={{letterSpacing: '3px', fontSize: '20px', color: '#cbd5e1'}}>••••••••••</div>
              </div>
            </>
          ) : (
            /* --- Edit Mode (Modified for secure Password change) --- */
            <form onSubmit={handleSave}>
              <h3 className="section-title">Edit Profile</h3>
              
              {/* Photo Upload (No Changes) */}
              <label htmlFor="file-upload" className="image-upload-wrapper">
                 <div style={{fontSize: '24px', marginBottom: '5px'}}>📷</div>
                 <div style={{fontSize: '13px', color: '#64748b'}}>Click to upload new photo</div>
                 <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} />
                 {preview && <p style={{color:'#16a34a', fontSize:'12px', margin: '5px 0 0 0'}}>New image selected!</p>}
              </label>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-input" rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              {/* (New) Password Change Section */}
              <h3 className="section-title" style={{marginTop: '30px', fontSize: '16px', borderBottom: 'none', color: '#ef4444'}}>
                Change Password (Optional)
              </h3>
              <div style={{background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fee2e2'}}>
                  <div className="form-group">
                    <label className="form-label" style={{color: '#b91c1c'}}>Current Password (Required to change)</label>
                    <input 
                        className="form-input" 
                        type="password" // စာရိုက်ရင် မမြင်ရအောင်
                        placeholder="Enter current password to verify"
                        value={passwordInputs.oldPassword} 
                        onChange={e => setPasswordInputs({...passwordInputs, oldPassword: e.target.value})} 
                        style={{borderColor: '#fca5a5'}}
                    />
                  </div>

                  <div className="form-group" style={{marginBottom: 0}}>
                    <label className="form-label" style={{color: '#b91c1c'}}>New Password</label>
                    <input 
                        className="form-input" 
                        type="password" // စာရိုက်ရင် မမြင်ရအောင်
                        placeholder="Enter new password" 
                        value={passwordInputs.newPassword} 
                        onChange={e => setPasswordInputs({...passwordInputs, newPassword: e.target.value})}
                        style={{borderColor: '#fca5a5'}}
                        disabled={!passwordInputs.oldPassword} // Old Password မရိုက်ရသေးရင် New Password ပေးမရိုက်
                    />
                  </div>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                <button type="button" onClick={handleCancel} className="cancel-btn">
                    Cancel
                </button>
                <button type="submit" className="edit-btn" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </>
  );
}

export default StudentCard;