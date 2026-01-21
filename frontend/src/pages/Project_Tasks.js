import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Project_Tasks.css';
import { mockUser } from '../mock/mockData';

const Project_Tasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navUser = location.state?.user;
  const user = navUser || { ...mockUser, role: 'Project Manager' };

  // URL ของ Backend (ถ้าไม่ได้ตั้ง .env ให้ใช้ localhost:4000)
  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  // --- State สำหรับฟอร์มสร้างงานใหม่ (แบบรองรับ MILP) ---
  const [jobForm, setJobForm] = useState({
    job_name: '',
    job_type: 'งานเหล็กเสริม (Rebar)',
    required_level: 1,
    site_name: '',
    description: '',
    milp_tags: 'ทั่วไป' // ตัวเลือกสำคัญ: ทั่วไป, ด่วน, ซับซ้อน
  });

  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // ฟังก์ชันอัปเดตข้อมูลในฟอร์ม
  const handleChange = (key) => (e) => {
    setJobForm({ ...jobForm, [key]: e.target.value });
  };

  // --- 1. ฟังก์ชันกดปุ่ม "สร้างงาน" ---
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Logic: เอา Tag MILP ไปแปะท้าย Description เพื่อให้ Backend จับได้
    let finalDescription = jobForm.description;
    
    if (jobForm.milp_tags === 'ด่วน') finalDescription += " [ด่วน]";
    if (jobForm.milp_tags === 'ซับซ้อน') finalDescription += " [งานซับซ้อน]";
    if (jobForm.milp_tags === 'ละเอียด') finalDescription += " [งานละเอียด]";
    
    // ถ้าเป็นงานทั่วไป ของ Level 1
    if (jobForm.milp_tags === 'ทั่วไป' && Number(jobForm.required_level) === 1) {
        finalDescription += " [งานทั่วไป]"; 
    }

    const payload = {
        ...jobForm,
        required_level: Number(jobForm.required_level),
        description: finalDescription
    };

    try {
      const token = sessionStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        alert(' สร้างงานสำเร็จ! ข้อมูลถูกส่งเข้าระบบแล้ว');
        // ล้างฟอร์ม
        setJobForm({
            job_name: '',
            job_type: 'งานเหล็กเสริม (Rebar)',
            required_level: 1,
            site_name: '',
            description: '',
            milp_tags: 'ทั่วไป'
        });
      } else {
        alert(data.message || 'สร้างงานไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เชื่อมต่อ Server ไม่ได้');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ฟังก์ชันกดปุ่ม "Auto Assign" (รัน AI) ---
  const handleAutoAssign = async () => {
    if (!window.confirm("ต้องการรันระบบจัดสรรงาน (AI) หรือไม่?")) return;
    setAssignLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/job-assignments/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) {
        alert(` จัดสรรงานเรียบร้อย! จับคู่ได้ทั้งหมด ${data.data.length} รายการ (ดูผลที่ Dashboard)`);
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      alert("เชื่อมต่อ Server ไม่สำเร็จ");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="dash-layout">
      {/* เมนูด้านซ้าย */}
      <aside className="dash-sidebar">
        <nav className="menu">
          <button type="button" className="menu-item" onClick={() => navigate('/pm', { state: { user } })}>Dashboard</button>
          <button type="button" className="menu-item active" onClick={() => navigate('/project-tasks', { state: { user } })}>Tasks</button>
          <button type="button" className="menu-item">Projects</button>
        </nav>
      </aside>

      <main className="dash-main">
        {/* แถบด้านบน */}
        <div className="dash-topbar">
          <div className="role-pill">Create New Task</div>
          <div className="top-actions">
            
            {/* ปุ่มรันยู่ตรงนี้ */}
            <button 
                className="btn-ai"
                onClick={handleAutoAssign}
                disabled={assignLoading}
            >
                {assignLoading ? 'กำลังคำนวณ...' : '⚡ รันระบบ Auto Assign'}
            </button>

            <span className="profile">
              <span className="avatar" />
              {user?.email && (
                <span className="phone" style={{ marginLeft: '1rem' }}>{user.email}</span>
              )}
            </span>
          </div>
        </div>

        <div className="task-page">
          <header className="task-header">
            <h1>สร้างใบงานใหม่</h1>
            <p style={{color:'#666', fontSize:'14px', marginTop:'-10px'}}>กรอกข้อมูลเพื่อส่งให้ระบบ MILP คำนวณความเหมาะสม</p>
          </header>

          <div className="task-grid">
            {/* --- ฟอร์มกรอกข้อมูล (ซ้าย) --- */}
            <section className="task-form">
              <h2 className="section-title">รายละเอียดงาน</h2>
              <form onSubmit={handleCreateJob}>
                
                <div className="field">
                    <label>ชื่องาน</label>
                    <input className="input" placeholder="เช่น ผูกเหล็กคานชั้น 2" value={jobForm.job_name} onChange={handleChange('job_name')} required />
                </div>
                
                <div className="field-row">
                    <div className="field half">
                        <label>ประเภทงาน</label>
                        <select className="select" value={jobForm.job_type} onChange={handleChange('job_type')}>
                            <option>งานเหล็กเสริม (Rebar)</option>
                            <option>งานคอนกรีต (Concrete)</option>
                            <option>งานไม้แบบ (Formwork)</option>
                            <option>องค์อาคาร (Structure)</option>
                            <option>งานทั่วไป (General)</option>
                        </select>
                    </div>
                    <div className="field half">
                        <label>Level ขั้นต่ำ</label>
                        <select className="select" value={jobForm.required_level} onChange={handleChange('required_level')}>
                            <option value={1}>Level 1 (พื้นฐาน)</option>
                            <option value={2}>Level 2 (ปานกลาง)</option>
                            <option value={3}>Level 3 (สูง/ยาก)</option>
                        </select>
                    </div>
                </div>

                {/* 🔥 กล่องเลือก MILP */}
                <div className="milp-container">
                    <label style={{color:'#d35400', fontWeight:'bold'}}> เงื่อนไขพิเศษ (สำหรับ MILP)</label>
                    <select className="select milp-select" value={jobForm.milp_tags} onChange={handleChange('milp_tags')}>
                        <option value="ทั่วไป">งานทั่วไป (General)</option>
                        <option value="ด่วน"> งานด่วน (High Priority)</option>
                        <option value="ซับซ้อน"> งานซับซ้อน (Complex)</option>
                        <option value="ละเอียด"> งานละเอียด (Precision)</option>
                    </select>
                    <small>เลือก "ด่วน/ซับซ้อน" เพื่อให้ AI คัดเลือกช่างฝีมือดีที่สุดมาทำงานนี้</small>
                </div>

                <div className="field">
                    <label>สถานที่ / ไซต์งาน</label>
                    <input className="input" placeholder="เช่น โซน A, อาคาร 5" value={jobForm.site_name} onChange={handleChange('site_name')} />
                </div>
                
                <div className="field">
                    <label>รายละเอียดเพิ่มเติม</label>
                    <textarea className="input textarea" rows="3" placeholder="รายละเอียดอื่นๆ..." value={jobForm.description} onChange={handleChange('description')} />
                </div>

                <div className="actions">
                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'กำลังบันทึก...' : ' บันทึกงานเข้าระบบ'}
                  </button>
                </div>
              </form>
            </section>

            {/* --- คำแนะนำ (ขวา) --- */}
            <aside className="workers">
              <h2 className="section-title">คำแนะนำ</h2>
              <div className="worker-card">
                <div className="avatar small" style={{background:'#f39c12', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>1</div>
                <div>
                  <div className="w-name">สร้างงาน</div>
                  <div className="w-sub">กรอกข้อมูลและเลือกเงื่อนไข MILP</div>
                </div>
              </div>
              <div className="worker-card">
                <div className="avatar small" style={{background:'#27ae60', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>2</div>
                <div>
                  <div className="w-name">กด Auto Assign</div>
                  <div className="w-sub">กดปุ่มด้านบนเพื่อจับคู่ช่าง</div>
                </div>
              </div>
              <div className="worker-card">
                <div className="avatar small" style={{background:'#3498db', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>3</div>
                <div>
                  <div className="w-name">ดูผลลัพธ์</div>
                  <div className="w-sub">ไปที่หน้า Dashboard เพื่อดูตารางงาน</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Project_Tasks;