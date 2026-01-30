import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../pages/general/Dashboard.css';

const ForemanReportSystem = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('daily'); // 'daily', 'weekly', 'monthly'

  // ✅ State สำหรับฟอร์ม (ลบ progress ออก และเพิ่ม file แทน)
  const [reportForm, setReportForm] = useState({
    title: '',
    details: '',
    remark: '',
    attachedFile: null // สำหรับเก็บไฟล์ที่อัปโหลด
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm({ ...reportForm, [name]: value });
  };

  // ✅ ฟังก์ชันจัดการการเลือกไฟล์
  const handleFileChange = (e) => {
    setReportForm({ ...reportForm, attachedFile: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`บันทึกรายงาน ${reportType}:`, reportForm);
    alert('บันทึกรายงานและอัปโหลดไฟล์สำเร็จแล้ว!');
  };

  return (
    <div className="dash-layout">
      {/* --- Sidebar สำหรับ Foreman --- */}
      <aside className="dash-sidebar">
        <div className="sidebar-header">
          <h2>Foreman Panel</h2>
        </div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/foreman')}> Dashboard</button>
          <button className="menu-item active" onClick={() => navigate('/foreman-reports')}> เขียนรายงาน</button>
          <button className="menu-item" onClick={() => navigate('/project-detail')}> My Projects</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ padding: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#1e293b' }}>บันทึกรายงานความคืบหน้าหน้างาน</h1>
            <p style={{ color: '#64748b' }}>กรอกรายละเอียดการตรวจสอบงานและแนบหลักฐานภาพถ่าย</p>
          </header>

          {/* ส่วนเลือกประเภทรายงาน */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            {['daily', 'weekly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                style={{
                  padding: '12px 25px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  background: reportType === type ? '#2c3e50' : '#e2e8f0',
                  color: reportType === type ? 'white' : '#64748b'
                }}
              >
                {type === 'daily' ? 'รายงานรายวัน' : type === 'weekly' ? 'รายงานรายสัปดาห์' : 'รายงานรายเดือน'}
              </button>
            ))}
          </div>

          {/* ✅ ฟอร์มเขียนรายงาน (ปรับปรุงตามสั่ง) */}
          <section style={{ background: 'white', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <label style={labelStyle}>หัวข้อการรายงาน</label>
                <input 
                  type="text" 
                  name="title"
                  value={reportForm.title}
                  onChange={handleInputChange}
                  placeholder="เช่น รายงานการเทคานคอดิน หรือ สรุปงานโครงสร้างสัปดาห์ที่ 2"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={labelStyle}>รายละเอียดการปฏิบัติงาน (อธิบายสิ่งที่ทำสำเร็จ)</label>
                <textarea 
                  name="details"
                  value={reportForm.details}
                  onChange={handleInputChange}
                  placeholder="อธิบายรายละเอียดงาน เช่น เข้าแบบเสร็จแล้ว 10 ต้น, เทปูนเสร็จแล้ว..."
                  style={{ ...inputStyle, height: '150px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                {/* ✅ เปลี่ยนจากความคืบหน้า (%) เป็น ส่วนอัปโหลดไฟล์ */}
                <div>
                  <label style={labelStyle}>📸 อัปโหลดรูปภาพ ไฟล์แนบ</label>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    style={{ ...inputStyle, padding: '10px' }}
                    accept="image/*,.pdf"
                  />
                  <small style={{ color: '#94a3b8' }}>* แนบรูปถ่ายเพื่อยืนยันความคืบหน้า</small>
                </div>
                <div>
                  <label style={labelStyle}>หมายเหตุ</label>
                  <input 
                    type="text" 
                    name="remark"
                    value={reportForm.remark}
                    onChange={handleInputChange}
                    placeholder="ถ้าไม่มีให้ใส่ -"
                    style={inputStyle}
                  />
                </div>
              </div>

              <button type="submit" style={{ width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
                ส่งรายงานพร้อมไฟล์แนบให้ PM
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155', fontSize: '15px' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box', outline: 'none' };

export default ForemanReportSystem;