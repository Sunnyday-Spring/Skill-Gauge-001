import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../pm/WKDashboard.css'; // ใช้ CSS ชุดเดียวกันเพื่อความสวยงาม
import { mockUser } from '../../mock/mockData';

const ForemanDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navUser = location.state?.user;
  const user = navUser || { ...mockUser, role: 'Foreman' };

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  // --- States ---
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ activeTasks: 0, pendingAssess: 0, completed: 0 });

  // ✅ 1. ดึงรายชื่อช่างที่ PM มอบหมายงานมาให้ประเมิน (สถานะ: รอการประเมิน)
  const loadAssignedWorkers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/foreman/assigned-workers`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      } else {
        // 🎯 Mock Data สำหรับทดสอบ Workflow
        setWorkers([
          { id: 2, name: "นายวิชัย สายไฟ", skill: "ช่างไฟฟ้า", taskName: "เดินสายไฟบ้านโครงการ 2", status: "รอการประเมิน" },
          { id: 5, name: "นายมานะ อดทน", skill: "ช่างโครงสร้าง", taskName: "ก่ออิฐโครงการ 1", status: "รอการประเมิน" },
        ]);
        setStats({ activeTasks: 5, pendingAssess: 2, completed: 12 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedWorkers();
  }, []);

  return (
    <div className="dash-layout">
      {/* Sidebar - สไตล์เดียวกับ PM Portal */}
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
          Foreman Portal
        </div>
        <nav className="menu">
          <button className="menu-item active" onClick={() => navigate('/foreman')}>หน้าหลัก</button>
          <button className="menu-item" onClick={() => navigate('/foreman-reports')}>รายงานหน้างาน</button>
          <button className="menu-item" onClick={() => navigate('/foreman-settings')}>ตั้งค่า</button>
          <button className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ef4444' }} onClick={handleLogout}>ออกจากระบบ</button>
        </nav>
      </aside>

      <main className="dash-main">
        {/* Topbar */}
        <div className="dash-topbar">
          <div className="role-pill">Foreman (ผู้คุมงาน)</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar" />
              {user?.email && <span className="phone" style={{ marginLeft: '2rem' }}>{user.email}</span>}
            </span>
          </div>
        </div>

        {/* 📊 สถิติภาพรวม Foreman */}
        <div className="pm-stats" style={{ marginTop: '25px', marginBottom: '25px' }}>
          <div className="stat"><div className="value">{stats.activeTasks}</div><div className="label">งานที่ดูแลอยู่</div></div>
          <div className="stat"><div className="value" style={{ color: '#f59e0b' }}>{stats.pendingAssess}</div><div className="label">ช่างที่รอประเมิน</div></div>
          <div className="stat"><div className="value">{stats.completed}</div><div className="label">งานที่เสร็จแล้ว</div></div>
          <div className="stat"><div className="value">100%</div><div className="label">ความปลอดภัย</div></div>
        </div>

        {/* ✅ ตารางหลัก: ช่างที่ต้องเข้าไปประเมินหน้างานจริง ✅ */}
        <div className="panel" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>👷‍♂️ รายชื่อช่างที่ต้องประเมินทักษะหน้างาน</h3>
            <button className="pill" onClick={loadAssignedWorkers}>🔄 อัปเดตรายชื่อ</button>
          </div>
          
          <div className="table">
            <div className="thead" style={{ gridTemplateColumns: '1.5fr 1.2fr 1.5fr 1.2fr 1fr' }}>
              <div>ชื่อช่าง</div><div>สาขาทักษะ</div><div>ภารกิจที่ได้รับมอบหมาย</div><div>สถานะ</div><div>การประเมิน</div>
            </div>
            <div className="tbody">
              {loading ? <div className="empty">กำลังโหลด...</div> : 
                workers.map((w) => (
                  <div className="tr" key={w.id} style={{ gridTemplateColumns: '1.5fr 1.2fr 1.5fr 1.2fr 1fr' }}>
                    <div className="td"><strong>{w.name}</strong></div>
                    <div className="td">{w.skill}</div>
                    <div className="td" style={{ color: '#64748b', fontSize: '13px' }}>{w.taskName}</div>
                    <div className="td">
                       <span className="pill small" style={{background: '#fff3e0', color: '#ef6c00', border: '1px solid #ffe0b2'}}>
                          กำลังปฏิบัติงาน
                       </span>
                    </div>
                    <div className="td">
                      <button 
                        onClick={() => navigate('/foreman-assessment', { state: { selectedWorker: w } })}
                        style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        เริ่มให้คะแนน
                      </button>
                    </div>
                  </div>
                ))
              }
              {workers.length === 0 && !loading && <div className="empty">ไม่มีช่างที่รอการประเมินหน้างาน</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForemanDashboard;