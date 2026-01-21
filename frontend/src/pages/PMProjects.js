import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; 
import { mockUser } from '../mock/mockData';

const PMProjects = () => {
  const navigate = useNavigate();
  const user = { ...mockUser, role: 'Project Manager' };
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลโครงการและจัดการข้อมูลซ้ำ
    const localJobs = JSON.parse(localStorage.getItem('mock_jobs') || '[]');
    const uniqueProjects = localJobs.reduce((acc, current) => {
      const x = acc.find(item => item.projectName === current.projectName);
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
    setProjects(uniqueProjects);
  }, []);

  // ฟังก์ชันช่วยจัดการสีของสถานะ
  const getStatusStyle = (status) => {
    const s = (status || 'รอดำเนินการ').toLowerCase();
    if (s.includes('ทำ') || s.includes('progress')) return { bg: '#e3f2fd', text: '#1976d2', label: 'กำลังดำเนินการ' };
    if (s.includes('เสร็จ') || s.includes('done')) return { bg: '#e8f5e9', text: '#2e7d32', label: 'เสร็จสิ้น' };
    return { bg: '#f5f5f5', text: '#616161', label: 'รอดำเนินการ' };
  };

  const handleViewDetail = (project) => {
    navigate('/project-detail', { state: { project, user } });
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
          <button type="button" className="menu-item" onClick={() => navigate('/pm')}>Dashboard</button>
          <button type="button" className="menu-item" onClick={() => navigate('/project-tasks')}>Tasks</button>
          <button type="button" className="menu-item active">Projects</button>
          <button type="button" className="menu-item">History</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar" style={{ justifyContent: 'space-between', padding: '0 30px' }}>
          <h2 style={{ fontSize: '20px', color: '#2c3e50' }}>📂 คลังข้อมูลโครงการหลัก</h2>
          <div className="user-info" style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Project Manager: <strong>{user.name || 'สมชาย ใจดี'}</strong>
          </div>
        </div>

        <div style={{ padding: '30px' }}>
          <div className="project-list-container" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            {/* Table Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '80px 2.5fr 1.2fr 1fr', 
              padding: '20px', 
              background: '#f8f9fa', 
              borderBottom: '2px solid #edf2f7',
              fontWeight: 'bold',
              color: '#4a5568',
              fontSize: '14px'
            }}>
              <div style={{ textAlign: 'center' }}>ลำดับ</div>
              <div>โครงการและสถานที่ตั้ง</div>
              <div style={{ textAlign: 'center' }}>สถานะ</div>
              <div style={{ textAlign: 'center' }}>การจัดการ</div>
            </div>

            {/* Table Body */}
            <div className="project-items">
              {projects.length > 0 ? projects.map((p, idx) => {
                const status = getStatusStyle(p.status);
                return (
                  <div key={idx} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '80px 2.5fr 1.2fr 1fr', 
                    padding: '25px 20px', 
                    borderBottom: '1px solid #edf2f7',
                    alignItems: 'center',
                    transition: 'background 0.2s'
                  }} className="project-row">
                    
                    <div style={{ textAlign: 'center', color: '#a0aec0', fontWeight: '500' }}>{String(idx + 1).padStart(2, '0')}</div>
                    
                    <div style={{ paddingLeft: '10px' }}>
                      <strong style={{ fontSize: '17px', color: '#2d3748', display: 'block', marginBottom: '4px' }}>{p.projectName}</strong>
                      <span style={{ fontSize: '13px', color: '#718096', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        📍 {p.locationDetail}
                      </span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ 
                        background: status.bg, 
                        color: status.text, 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600' 
                      }}>
                        ● {status.label}
                      </span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleViewDetail(p)}
                        style={{ 
                          background: 'white', 
                          color: '#3182ce', 
                          border: '1.5px solid #3182ce', 
                          padding: '8px 18px', 
                          borderRadius: '10px', 
                          cursor: 'pointer', 
                          fontWeight: '600',
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.target.style.background = '#3182ce'; e.target.style.color = 'white'; }}
                        onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#3182ce'; }}
                      >
                        เปิดดูข้อมูล
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: '60px', textAlign: 'center', color: '#a0aec0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📂</div>
                  <p>ยังไม่มีโครงการที่บันทึกในระบบ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMProjects;