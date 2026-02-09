import jsPDF from 'jspdf';

function PaymentList({ payments, student }) {

  const generateReceipt = (payment) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Myanmar Education Portal", 105, 20, null, null, "center");
    doc.setFontSize(14);
    doc.text("Official Payment Receipt", 105, 30, null, null, "center");

    // Receipt Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Receipt ID: #${payment.id.substring(0, 8)}`, 20, 60);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 150, 60);

    // Student Info Box
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 70, 170, 30);
    doc.text(`Student Name: ${student.name}`, 30, 85);
    doc.text(`Phone: ${student.phone_primary}`, 120, 85);

    // Payment Details
    doc.setFontSize(14);
    doc.text("Payment Details", 20, 120);
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 125, 170, 10, 'F');
    doc.setFontSize(12);
    doc.text("Description", 30, 131);
    doc.text("Amount", 150, 131);

    // Table Content
    doc.text(payment.course_name || "Course Fees", 30, 145);
    doc.text(`${payment.amount} MMK`, 150, 145);
    doc.text(`Method: ${payment.payment_method}`, 30, 155);

    // Total
    doc.setLineWidth(0.5);
    doc.line(140, 160, 190, 160);
    doc.setFontSize(14);
    doc.text(`Total: ${payment.amount} MMK`, 150, 170);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for your payment!", 105, 200, null, null, "center");
    doc.text("This is a computer generated receipt.", 105, 205, null, null, "center");

    // Download
    doc.save(`Receipt_${student.name}_${payment.payment_date}.pdf`);
  };

  return (
    <div className="table-card">
      <h3>💵 ငွေပေးချေမှု မှတ်တမ်း ({payments.length})</h3>
      
      {payments.length === 0 ? (
        <p style={{textAlign: 'center', color: '#666'}}>ငွေသွင်းထားခြင်း မရှိသေးပါ</p>
      ) : (
        <div className="table-scroll">
            <table>
            <thead>
                <tr>
                <th>ရက်စွဲ</th>
                <th>သင်တန်း (Course)</th>
                <th>ပမာဏ</th>
                <th>Method</th>
                <th>Status</th>
                <th>Receipt</th>
                </tr>
            </thead>
            <tbody>
                {payments.map((pay) => (
                <tr key={pay.id}>
                    <td>{new Date(pay.payment_date).toLocaleDateString()}</td>
                    <td>
                        <div style={{fontWeight: 'bold'}}>{pay.course_name}</div>
                        <small style={{color: '#666'}}>{pay.batch_name}</small>
                    </td>
                    <td style={{fontWeight: 'bold'}}>{pay.amount} Ks</td>
                    <td>{pay.payment_method}</td>
                    
                    {/* Status ပြသခြင်း */}
                    <td>
                      {pay.status === 'pending' ? (
                         <span className="status-badge" style={{background: '#fef3c7', color: '#d97706'}}>⏳ စောင့်ဆိုင်းဆဲ</span>
                      ) : (
                         <span className="status-badge success">✅ အောင်မြင်</span>
                      )}
                    </td>
                    
                    {/* PDF Button (Condition ခံလိုက်ပါပြီ) */}
                    <td>
                      {pay.status === 'pending' ? (
                        // Pending ဖြစ်နေရင် Button မပြဘဲ စာသားပဲပြမယ်
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>N/A</span>
                      ) : (
                        // Verified ဖြစ်မှ Button ပြမယ်
                        <button 
                            onClick={() => generateReceipt(pay)}
                            style={{
                            background: '#2563eb', color: 'white', border: 'none', 
                            padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                            }}>
                            ⬇️ PDF
                        </button>
                      )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
}

export default PaymentList;