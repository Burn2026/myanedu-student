import React from 'react';

function ExamList({ exams }) {
  
  // Grade ပေါ်မူတည်ပြီး အရောင်ခွဲခြားသည့် Function
  const getStatusColor = (grade) => {
      if(grade === 'F') return { bg: '#fee2e2', text: '#ef4444', label: 'FAIL' };
      if(grade === 'A' || grade === 'A+') return { bg: '#dcfce7', text: '#16a34a', label: 'EXCELLENT' };
      return { bg: '#eff6ff', text: '#2563eb', label: 'PASS' };
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      
      {/* Table Header (Desktop) */}
      <div className="exam-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
          <div>Course / Batch</div>
          <div>Exam Title</div>
          <div style={{textAlign: 'center'}}>Marks</div>
          <div style={{textAlign: 'center'}}>Total</div>
          <div style={{textAlign: 'right'}}>Result</div>
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
                  <div key={exam.id} style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', 
                      padding: '20px', 
                      borderBottom: '1px solid #f1f5f9',
                      alignItems: 'center'
                  }}>
                      {/* 1. Course Info */}
                      <div>
                          <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>
                              {exam.course_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                              BATCH: <span style={{color: '#2563eb'}}>{exam.batch_name}</span>
                          </div>
                      </div>

                      {/* 2. Exam Title */}
                      <div style={{ fontWeight: '500', color: '#334155' }}>
                          📝 {exam.exam_title}
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                              {new Date(exam.result_date).toLocaleDateString()}
                          </div>
                      </div>

                      {/* 3. Marks */}
                      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>
                          {exam.marks_obtained}
                      </div>

                      {/* 4. Total Marks */}
                      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                          / {exam.total_marks}
                      </div>

                      {/* 5. Status Badge */}
                      <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                              background: status.bg, 
                              color: status.text, 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              fontSize: '11px', 
                              fontWeight: 'bold',
                              display: 'inline-block',
                              minWidth: '60px',
                              textAlign: 'center'
                          }}>
                              {exam.grade}
                          </span>
                      </div>
                  </div>
              );
          })
      )}

      {/* Mobile Responsive Style Fix */}
      <style>
        {`
            @media (max-width: 768px) {
                .exam-header { display: none !important; }
                .exam-item { display: flex; flex-direction: column; gap: 10px; }
            }
        `}
      </style>
    </div>
  );
}

export default ExamList;