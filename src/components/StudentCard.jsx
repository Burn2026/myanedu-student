import React, { useState } from 'react';
import './StudentCard.css';

function StudentCard({ student, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: student?.name || '',
    address: student?.address || '',
    old_password: '',
    new_password: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Image URL Helper (Cloudinary & Local ကို အလိုအလျောက် ခွဲခြားပေးမည်)
  const getImageUrl = (path) => {
    if (!path) return "https://ui-avatars.com/api/?name=" + (student?.name || 'User') + "&background=2563eb&color=fff";
    let cleanPath = String(path).trim().replace(/\\/g, '/');
    const httpIndex = cleanPath.indexOf("http");
    if (httpIndex !== -1) return cleanPath.substring(httpIndex);
    if (cleanPath.includes("cloudinary.com")) return `https://${cleanPath.replace(/^\/+/, '')}`;
    return `https://myanedu-backend.onrender.com/${cleanPath.replace(/^\/+/, '')}`;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('address', formData.address);
    if (formData.old_password) data.append('old_password', formData.old_password);
    if (formData.new_password) data.append('new_password', formData.new_password);
    if (profileImage) data.append('profile_image', profileImage);

    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/students/profile/${student.id}`, {
        method: 'PUT',
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
        if (onUpdate) onUpdate(); // Refresh dashboard data
      } else {
        alert(result.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  if (!student) return <p>Loading profile...</p>;

  return (
    <div className="profile-wrapper animate-fade-in">
      
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-avatar-section">
          <img src={getImageUrl(student.profile_image)} alt="Profile" className="profile-avatar" />
          <h2 className="profile-name">{student.name}</h2>
          <p className="profile-role">Student Account</p>
          <p className="profile-phone-main">{student.phone_primary}</p>
          
          {!isEditing && (
            <button className="btn-settings" onClick={() => setIsEditing(true)}>
              ⚙️ Settings
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* EDIT MODE FORM */
        <div className="profile-info-card">
          <h3 className="card-title">Edit Profile</h3>
          <form onSubmit={handleSave} className="edit-form">
            
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="form-input" />
            </div>

            <div className="form-group">
              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="form-input file-input" />
            </div>

            <hr className="divider" />
            <h4 style={{marginBottom: '10px', fontSize: '14px', color: '#1e293b'}}>Change Password (Optional)</h4>

            <div className="form-group">
              <label>Current Password</label>
              <input type="password" name="old_password" value={formData.old_password} onChange={handleInputChange} className="form-input" placeholder="Enter current password to change" />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input type="password" name="new_password" value={formData.new_password} onChange={handleInputChange} className="form-input" placeholder="Enter new password" />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* VIEW MODE (READ ONLY) */
        <div className="profile-info-card">
          <h3 className="card-title">Personal Information</h3>
          
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">ADDRESS</span>
              <span className="info-value">{student.address || "Not provided"}</span>
            </div>
            
            {student.dob && (
              <div className="info-row">
                <span className="info-label">DATE OF BIRTH</span>
                <span className="info-value">{new Date(student.dob).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="info-row">
              <span className="info-label">PHONE (2)</span>
              <span className="info-value">{student.phone_secondary || "-"}</span>
            </div>

            <div className="info-row">
              <span className="info-label">JOINED DATE</span>
              <span className="info-value">{new Date(student.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <h3 className="card-title" style={{marginTop: '30px'}}>Account Security</h3>
          <div className="info-list">
            <div className="info-row">
              <span className="info-label">PASSWORD</span>
              {/* ✅ Password ကို ဖုံးကွယ်ထားသည် (••••••••) */}
              <span className="info-value password-masked">••••••••••••</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentCard;