import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockUser } from '../mock/mockData';
import './Dashboard.css';

const WKCreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navUser = location.state?.user;
  const user = navUser || { ...mockUser, role: 'Project Manager' };

  const [projectInfo, setProjectInfo] = useState({
    projectName: '',        // 1. ชื่อโครงการ
    projectType: 'บ้านพักอาศัย', // 2. ประเภทโครงการ
    locationDetail: '',     // 3. สถานที่
    mapLink: '',            // 5. พิกัด
    startDate: '',          // 6. วันเริ่มต้น
    endDate: '',            // 6. วันสิ้นสุด
    pmName: user.name || 'สมชาย ใจดี',
  });

  const handleChange = (e) => {
    setProjectInfo({ ...projectInfo, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate('/define-tasks', { state: { project: projectInfo, user } });
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
          <button type="button" className="menu-item" onClick={() => navigate('/pm', { state: { user } })}>Dashboard</button>
          <button type="button" className="menu-item active" onClick={() => navigate('/project-tasks', { state: { user } })}>Tasks</button>
          <button type="button" className="menu-item" onClick={() => navigate('/projects', { state: { user } })}>Projects</button>
          <button type="button" className="menu-item">History</button>
          <button type="button" className="menu-item">Settings</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill">{user.role}</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar" />
              {user.email && <span className="phone" style={{ marginLeft: '1rem' }}>{user.email}</span>}
            </span>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <header style={{ marginBottom: '30px', borderBottom: '2px solid #f1f2f6', paddingBottom: '20px' }}>
                <h2 style={{ color: '#2c3e50', margin: 0 }}>ขั้นตอนที่ 1: สร้างโครงการหลัก</h2>
            </header>

            <form onSubmit={handleNext}>
              {/* แถวที่ 1: ชื่อโครงการ และ ประเภทโครงการ อยู่คู่กัน */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                <div>
                  <label style={labelStyle}>ชื่อโครงการ / รหัสหน้างาน</label>
                  <input style={inputStyle} name="projectName" placeholder="เช่น หมู่บ้านแสนสุข" onChange={handleChange} required />
                </div>

                <div>
                  <label style={labelStyle}>2. ประเภทโครงการ</label>
                  <select style={inputStyle} name="projectType" onChange={handleChange}>
                    <option value="บ้านพักอาศัย">บ้านพักอาศัย</option>
                    <option value="คอนโด/อาคารสูง">อาคารสูง</option>
                    <option value="คอนโด/อาคารสูง">คอนโด</option>
                    <option value="คอนโด/อาคารสูง">คลังสินค้า</option>
                    <option value="โรงงาน/คลังสินค้า">โรงงาน</option>
                  </select>
                </div>
              </div>

              {/* ส่วนอื่นๆ ของฟอร์ม */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>สถานที่/รายละเอียดที่อยู่หน้างาน</label>
                  <textarea style={{ ...inputStyle, minHeight: '100px' }} name="locationDetail" placeholder="ระบุที่ตั้งหน้างานอย่างละเอียด" onChange={handleChange} required></textarea>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>พิกัดพิกัด (Google Maps Link)</label>
                  <input style={inputStyle} name="mapLink" placeholder="วางลิงก์พิกัดจาก Google Maps" onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>วันเริ่มต้นงาน</label>
                  <input style={inputStyle} type="date" name="startDate" onChange={handleChange} required />
                </div>

                <div>
                  <label style={labelStyle}>วันสิ้นสุดงาน (โดยประมาณ)</label>
                  <input style={inputStyle} type="date" name="endDate" onChange={handleChange} required />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <button type="submit" style={btnStyle}>ขั้นตอนถัดไป: กำหนดงานย่อย ➝</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#34495e', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcdfe6', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { background: '#3498db', color: 'white', padding: '16px 60px', borderRadius: '40px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)' };

export default WKCreateProject;