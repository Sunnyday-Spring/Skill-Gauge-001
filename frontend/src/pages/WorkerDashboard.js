import React from 'react';
import { useNavigate } from 'react-router-dom';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  // Mock User (สมมติว่าเป็นช่างล็อกอินเข้ามา)
  const user = { role: 'worker', name: 'นายช่าง มีฝีมือ' };

  return (
    <div className="dash-layout">
      {/* Sidebar สำหรับ Worker */}
      <aside className="dash-sidebar" style={{ background: '#2c3e50' }}>
        <div className="sidebar-logo">SkillGauge</div>
        <nav className="menu">
          <button className="menu-item active">Dashboard</button>
          <button className="menu-item" onClick={() => navigate('/worker/test')}>ทำแบบทดสอบ</button>
          <button className="menu-item">ผลการประเมิน</button>
          <button className="menu-item">ออกจากระบบ</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill bg-success text-white">Worker (ช่าง)</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar-circle" style={{ background: '#27ae60' }}>W</span>
              <span className="username">{user.name}</span>
            </span>
          </div>
        </div>

        <div className="dashboard-content" style={{ padding: '20px' }}>
          <h1>👋 สวัสดี, {user.name}</h1>
          <p className="text-gray-600">ยินดีต้อนรับสู่ระบบประเมินทักษะฝีมือแรงงาน</p>
          
          <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
            
            {/* --- Card 1: ปุ่มกดไปทำข้อสอบ --- */}
            <div className="card-action" 
                 style={{ 
                     background: 'white', 
                     padding: '30px', 
                     borderRadius: '12px', 
                     boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                     cursor: 'pointer', 
                     borderLeft: '5px solid #3498db',
                     transition: 'transform 0.2s'
                 }}
                 onClick={() => navigate('/worker/test')}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>ทำแบบทดสอบ (Skill Test)</h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>
                แบบทดสอบวัดระดับความรู้ <br/>
                <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>*ยังไม่ได้ทำ</span>
              </p>
              <button style={{ 
                  marginTop: '15px', 
                  padding: '10px 20px', 
                  background: '#3498db', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%'
              }}>
                เริ่มทำข้อสอบ 👉
              </button>
            </div>

            {/* --- Card 2: ดูผลคะแนน (Mockup) --- */}
            <div className="card-action" 
                 style={{ 
                     background: 'white', 
                     padding: '30px', 
                     borderRadius: '12px', 
                     boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                     borderLeft: '5px solid #f1c40f',
                     opacity: 0.7 // ทำให้ดูจางๆ เพราะยังไม่มีคะแนน
                 }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>ผลการประเมิน</h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>รอผลการประเมินจากหัวหน้างาน</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;