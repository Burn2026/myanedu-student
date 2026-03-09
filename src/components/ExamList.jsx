import React from 'react';
import './ExamList.css'; // ✅ CSS ဖိုင်အသစ်ကို ချိတ်ဆက်ထားသည်

function ExamList({ exams }) {
  
  // Grade ပေါ်မူတည်ပြီး အရောင်ခွဲခြားသည့် Function
  const getStatusColor = (grade) => {
      if(grade === 'F') return { bg: '#fee2e2', text: '#ef4444' };
      if(grade === 'A' || grade === 'A+') return { bg: '#dcfce7', text: '#16a34a' };
      return { bg: '#eff6ff', text: '#2563eb' };
  };

  return (
    <div className="el-wrapper">
      
      {/* Table Header (Desktop Only) */}
      <div className="el-header">
          <div>Course / Batch</div>
          <div>Exam Title</div>
          <div className="el-col-center">Marks</div>
          <div className="el-col-center">Total</div>
          <div className="el-col-right">Result</div>
      </div>

      {/* Exam List Items */}
      {exams.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No exam results released yet.
          </div>
      ) : (
          exams.map((exam) => {
              const status = getStatusColor(exam.grade);
              
              return (
                  <div key={exam.id} className="el-item">
                      
                      {/* 1. Course Info */}
                      <div>
                          <div className="el-course-title">{exam.course_name}</div>
                          <div className="el-batch-name">
                              BATCH: <span>{exam.batch_name}</span>
                          </div>
                      </div>

                      {/* 2. Exam Title */}
                      <div className="el-mobile-row">
                          <span className="el-mobile-label">Exam:</span>
                          <div>
                              <div className="el-exam-title">📝 {exam.exam_title}</div>
                              <div className="el-exam-date">{new Date(exam.result_date).toLocaleDateString()}</div>
                          </div>
                      </div>

                      {/* 3. Marks */}
                      <div className="el-col-center el-mobile-row">
                          <span className="el-mobile-label">Obtained Marks:</span>
                          <div className="el-marks">{exam.marks_obtained}</div>
                      </div>

                      {/* 4. Total Marks */}
                      <div className="el-col-center el-mobile-row">
                          <span className="el-mobile-label">Total Marks:</span>
                          <div className="el-total">/ {exam.total_marks}</div>
                      </div>

                      {/* 5. Status Badge */}
                      <div className="el-col-right el-mobile-row">
                          <span className="el-mobile-label">Grade:</span>
                          <div>
                              <span 
                                  className="el-status-badge"
                                  style={{ background: status.bg, color: status.text }}
                              >
                                  {exam.grade}
                              </span>
                          </div>
                      </div>
                      
                  </div>
              );
          })
      )}
    </div>
  );
}

export default ExamList;