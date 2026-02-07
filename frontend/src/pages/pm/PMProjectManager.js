import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../pm/WKDashboard.css';
import { mockUser } from '../../mock/mockData';

const ProjectManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navUser = location.state?.user;
  const user = navUser || { ...mockUser, role: 'Project Manager' };

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const [counts, setCounts] = useState([]); 
  const [workers, setWorkers] = useState([]);
  const [workerLoading, setWorkerLoading] = useState(false);

  const stats = useMemo(() => {
    const toNum = (v) => (v == null ? 0 : Number(v));
    return {
      totalProjects: counts.length,
      totalTasks: counts.reduce((acc, c) => acc + toNum(c.tasks_total), 0),
      activeTasks: counts.reduce((acc, c) => acc + (toNum(c.tasks_todo) + toNum(c.tasks_in_progress)), 0),
      doneTasks: counts.reduce((acc, c) => acc + toNum(c.tasks_done), 0)
    };
  }, [counts]);

  // ✅ ดึงข้อมูลและกรองคนที่มีระดับแล้วออก
  const loadWorkers = async () => {
    setWorkerLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      const res = await fetch(`${API}/api/workers/list`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      if (res.ok) {
        const data = await res.json();
        // 🎯 แสดงเฉพาะคนที่ยังไม่มีระดับ (รอประเมิน / ยังไม่ทำข้อสอบ)
        setWorkers(data.filter(w => w.status !== "ประเมินแล้ว"));
      } else {
        // Mock Data ทดสอบ
        const mockData = [
          { id: 2, name: "นายวิชัย สายไฟ", skill: "ช่างไฟฟ้า", exam_score: 42, status: "รอการประเมิน" },
          { id: 3, name: "นายกอไก่ ใจดี", skill: "ช่างประปา", exam_score: 0, status: "ยังไม่ได้ทำข้อสอบ" },
        ];
        setWorkers(mockData);
      }
    } catch (e) { 
      console.error(e); 
      setWorkers([]);
    } finally { 
      setWorkerLoading(false); 
    }
  };

  const loadCounts = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard/project-task-counts`);
      if (res.ok) setCounts(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadCounts();
    loadWorkers();
  }, []);

  const getWorkerStatusBadge = (status) => {
    switch (status) {
      case "รอการประเมิน":
        return <span className="pill small" style={{background: '#e3f2fd', color: '#1976d2', border: '1px solid #bbdefb'}}>สอบผ่านแล้ว (รอประเมินหน้างาน)</span>;
      case "ยังไม่ได้ทำข้อสอบ":
        return <span className="pill small" style={{background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2'}}>ยังไม่ได้ทำข้อสอบ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>PM Portal</div>
        <nav className="menu">
          <button className="menu-item active" onClick={() => navigate('/pm')}>หน้าหลัก</button>
          <button className="menu-item" onClick={() => navigate('/project-tasks')}>มอบหมายงาน</button>
          <button className="menu-item" onClick={() => navigate('/projects')}>โครงการทั้งหมด</button>
          <button className="menu-item logout-btn" style={{ marginTop: '20px', color: '#ef4444' }} onClick={handleLogout}>ออกจากระบบ</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill">{user?.role || 'Project Manager'}</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar" />
              {user?.email && <span className="phone" style={{ marginLeft: '2rem' }}>{user.email}</span>}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="pm-stats" style={{ marginTop: '25px', marginBottom: '25px' }}>
          <div className="stat"><div className="value">{stats.totalProjects}</div><div className="label">Number of projects</div></div>
          <div className="stat"><div className="value">{stats.activeTasks}</div><div className="label">Active tasks</div></div>
          <div className="stat"><div className="value">{stats.doneTasks}</div><div className="label">Completed</div></div>
          <div className="stat"><div className="value">{stats.totalTasks}</div><div className="label">Total tasks</div></div>
        </div>

        {/* ✅ ตารางจัดการช่างที่ต้องมอบหมายงานเพื่อไปประเมิน */}
        <div className="panel" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>👷‍♂️ รายชื่อช่างรอรับงาน (เพื่อประเมินหน้างานโดย Foreman)</h3>
            <button className="pill" onClick={loadWorkers}>🔄 รีเฟรชข้อมูล</button>
          </div>
          
          <div className="table">
            <div className="thead" style={{ gridTemplateColumns: '1.5fr 1.2fr 1fr 1.5fr 1fr' }}>
              <div>ชื่อช่าง</div><div>สาขาทักษะ</div><div>คะแนนสอบ</div><div>สถานะปัจจุบัน</div><div>การจัดการ</div>
            </div>
            <div className="tbody">
              {workerLoading ? <div className="empty">กำลังโหลด...</div> : 
                workers.map((w) => (
                  <div className="tr" key={w.id} style={{ gridTemplateColumns: '1.5fr 1.2fr 1fr 1.5fr 1fr' }}>
                    <div className="td"><strong>{w.name}</strong></div>
                    <div className="td">{w.skill}</div>
                    <div className="td">{w.exam_score > 0 ? `${w.exam_score}/60` : '-'}</div>
                    <div className="td">{getWorkerStatusBadge(w.status)}</div>
                    <div className="td">
                      {w.status === "รอการประเมิน" ? (
                        <button 
                          onClick={() => navigate('/define-tasks', { state: { selectedWorker: w, mode: 'assessment' } })}
                          style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          มอบหมายงาน
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>รอช่างทำข้อสอบ</span>
                      )}
                    </div>
                  </div>
                ))
              }
              {workers.length === 0 && !workerLoading && <div className="empty">ไม่มีช่างที่รอการประเมินในขณะนี้</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectManager;