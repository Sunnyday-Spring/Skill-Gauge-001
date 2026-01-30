import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockUser } from '../../mock/mockData';
import '../../pages/general/Dashboard.css';

const PMProjects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = location.state?.user || { ...mockUser, role: 'Project Manager' };

  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Logic ดึงข้อมูล
  useEffect(() => {
    try {
      const localJobs = JSON.parse(localStorage.getItem('mock_jobs') || '[]');
      const processed = localJobs.reduce((acc, current) => {
        if (!current || !current.projectName) return acc;
        if (!acc.find(item => item.projectName === current.projectName)) {
          acc.push({
            ...current,
            pendingRfi: Math.floor(Math.random() * 5), 
            daysLeft: Math.floor(Math.random() * 30) + 1
          });
        }
        return acc;
      }, []);
      setProjects(processed);
    } catch (error) {
      setProjects([]);
    }
  }, []);

  // 2. Logic กรองข้อมูล
  const filteredProjects = projects.filter(p => {
    const name = (p.projectName || "").toLowerCase();
    const location = (p.locationDetail || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || location.includes(search);
  });

  // คำนวณตัวเลขสรุป (Stats) เพื่อแก้ความโล่ง
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'กำลังดำเนินการ').length;
  const completedProjects = projects.filter(p => p.status === 'เสร็จสิ้น').length;

  const getStatusBadge = (status) => {
    const s = (status || 'รอดำเนินการ').toLowerCase();
    if (s.includes('ทำ')) return { bg: '#e3f2fd', color: '#1976d2', text: 'กำลังดำเนินการ' };
    if (s.includes('เสร็จ')) return { bg: '#e8f5e9', color: '#2e7d32', text: 'เสร็จสิ้น' };
    return { bg: '#f5f5f5', color: '#616161', text: 'รอดำเนินการ' };
  };

  // --- Style ปุ่ม Sidebar (การ์ดขาว) ---
  const btnStyle = {
    width: '100%', padding: '12px', marginBottom: '10px',
    borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', 
    color: '#334155', fontSize: '15px', fontWeight: '600', cursor: 'pointer', 
    textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s'
  };

  const activeBtnStyle = {
    ...btnStyle,
    background: '#e0e7ff', border: '1px solid #c7d2fe', color: '#3730a3'
  };

  // --- Style การ์ดสรุป (Layer ใหม่) ---
  const statCardStyle = {
    flex: 1, background: 'white', padding: '20px', borderRadius: '16px',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    display: 'flex', flexDirection: 'column', gap: '5px'
  };

  return (
    <div className="dash-layout">
      
      {/* Sidebar: โครงสร้างเดิมที่คุณต้องการ */}
      <aside className="dash-sidebar">
        <nav className="menu">
          <button type="button" className="menu-item" style={btnStyle} onClick={() => navigate('/pm', { state: { user } })}>Dashboard</button>
          <button type="button" className="menu-item" style={btnStyle} onClick={() => navigate('/project-tasks', { state: { user } })}>Tasks</button>
          
          {/* Active */}
          <button type="button" className="menu-item active" style={activeBtnStyle} onClick={() => navigate('/projects', { state: { user } })}>Projects</button>
          
          <button type="button" className="menu-item" style={btnStyle}>History</button>
          <button type="button" className="menu-item" style={btnStyle}>Settings</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ padding: '30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Layer 1: Header + Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h2 style={{ margin: '0', color: '#1e293b', fontSize: '24px' }}>Projects Overview</h2>
              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '14px' }}>จัดการและติดตามสถานะโครงการทั้งหมดของคุณ</p>
            </div>
            <div style={{ position: 'relative', width: '300px' }}>
              <input 
                type="text" 
                placeholder="🔍 ค้นหาโครงการ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
              />
            </div>
          </div>

          {/* Layer 2: Stats Cards (เพิ่มมาแก้ความโล่ง) */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={statCardStyle}>
               <span style={{ fontSize: '14px', color: '#64748b' }}> โครงการทั้งหมด</span>
               <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>{totalProjects}</span>
            </div>
            <div style={statCardStyle}>
               <span style={{ fontSize: '14px', color: '#64748b' }}> กำลังดำเนินการ</span>
               <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{activeProjects}</span>
            </div>
            <div style={statCardStyle}>
               <span style={{ fontSize: '14px', color: '#64748b' }}> เสร็จสิ้นแล้ว</span>
               <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{completedProjects}</span>
            </div>
          </div>

          {/* Layer 3: Main Table */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '18px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ชื่อโครงการ / สถานที่</th>
                  <th style={{ padding: '18px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>จำนวนงานย่อย</th>
                  <th style={{ padding: '18px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>สถานะงาน</th>
                  <th style={{ padding: '18px', color: '#64748b', fontSize: '13px', fontWeight: '600', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? filteredProjects.map((p, index) => {
                  const badge = getStatusBadge(p.status);
                  const taskCount = p.tasks?.length || 0;

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '18px' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{p.projectName}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>📍 {p.locationDetail || '-'}</div>
                      </td>
                      
                      {/* แสดงจำนวนงานแบบคลีนๆ (ไม่มีกรอบ) */}
                      <td style={{ padding: '18px', color: '#334155', fontWeight: '500' }}>
                        {taskCount} ภารกิจ
                      </td>

                      <td style={{ padding: '18px' }}>
                        <span style={{ background: badge.bg, color: badge.color, padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                          {badge.text}
                        </span>
                      </td>
                      <td style={{ padding: '18px', textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate('/project-detail', { state: { project: p, user } })}
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                        >
                          เปิดดู
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>ไม่พบข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PMProjects;