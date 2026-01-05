import React from 'react';
import { useNavigate } from 'react-router-dom';


const ForemanDashboard = () => {
  const navigate = useNavigate();
  // Mock User
  const user = { role: 'foreman', name: 'หัวหน้าช่าง สมชาย' };

  return (
    <div className="dash-layout">
      {/* Sidebar สำหรับ Foreman */}
      <aside className="dash-sidebar">
        <div className="sidebar-logo">SkillGauge</div>
        <nav className="menu">
          <button className="menu-item active">Dashboard</button>
          <button className="menu-item" onClick={() => navigate('/foreman/assessment')}>ประเมินหน้างาน</button>
          <button className="menu-item">ประวัติงาน</button>
          <button className="menu-item">ออกจากระบบ</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill bg-warning text-dark">Foreman</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar-circle">F</span>
              <span className="username">{user.name}</span>
            </span>
          </div>
        </div>

        <div className="dashboard-content" style={{ padding: '20px' }}>
          <h1>👋 สวัสดี, {user.name}</h1>
          <p className="text-gray-600">ยินดีต้อนรับสู่ระบบบริหารจัดการหน้างาน</p>
          
          <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {/* Card ปุ่มลัด */}
            <div className="card-action" 
                 style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer', borderLeft: '5px solid #27ae60' }}
                 onClick={() => navigate('/foreman/assessment')}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📋 ประเมินช่าง (Onsite)</h3>
              <p style={{ margin: 0, color: '#7f8c8d' }}>คลิกเพื่อเริ่มทำแบบประเมิน 17 ข้อ</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForemanDashboard;