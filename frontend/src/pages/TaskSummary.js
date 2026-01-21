import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUser } from '../mock/mockData';
import './Dashboard.css';

const TaskSummary = () => {
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState([]);
  const user = { ...mockUser, role: 'Project Manager' };

  // ✅ ดึงข้อมูลงานทั้งหมดที่มีในระบบมาแสดง
  useEffect(() => {
    const currentJobs = JSON.parse(localStorage.getItem('mock_jobs') || '[]');
    setAllProjects(currentJobs);
  }, []);

  return (
    <div className="dash-layout">
      {/* Sidebar เมนูที่เชื่อมกับหน้านี้ */}
      <aside className="dash-sidebar">
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/pm')}>Dashboard</button>
          <button className="menu-item active" onClick={() => navigate('/task-summary')}>Tasks</button>
          <button className="menu-item" onClick={() => navigate('/projects')}>Projects</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ width: '100%', marginLeft: 0 }}>
        <div style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>📋 รายการงานย่อยที่มอบหมายทั้งหมด</h2>
            <button 
              onClick={() => navigate('/project-tasks')} 
              style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + มอบหมายงานใหม่
            </button>
          </div>

          {allProjects.length > 0 ? allProjects.map((project, pIdx) => (
            <div key={pIdx} style={{ marginBottom: '40px' }}>
              {/* หัวข้อโครงการหลัก */}
              <div style={{ background: '#2c3e50', color: 'white', padding: '15px 25px', borderRadius: '12px 12px 0 0' }}>
                <strong style={{ fontSize: '18px' }}>🏢 โครงการ: {project.projectName}</strong>
              </div>

              {/* รายการงานย่อยในโครงการนี้ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '25px', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0' }}>
                {project.tasks && project.tasks.length > 0 ? project.tasks.map((task, tIdx) => (
                  <div key={tIdx} style={{ background: 'white', border: '1px solid #edf2f7', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ background: '#ffffff', padding: '15px 20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{tIdx + 1}. {task.taskName} ({task.taskType})</strong>
                      <span style={{ color: '#e67e22', fontWeight: 'bold' }}>เงื่อนไข: {task.milpCondition}</span>
                    </div>
                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }}>
                      <div>
                        <h4 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>รายละเอียดงาน:</h4>
                        <p style={{ fontSize: '14px', color: '#475569' }}>{task.taskDetail}</p>
                      </div>
                      <div>
                        <h4 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px' }}>ทีมช่างปฏิบัติการ ({task.assigned_workers?.length} คน):</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {task.assigned_workers?.map((w, i) => (
                            <div key={i} style={{ padding: '10px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span><strong>{w.name}</strong> (อายุ {w.age} | ปสก. {w.experience_years})</span>
                              <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Lv.{w.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p style={{ textAlign: 'center', color: '#94a3b8' }}>ยังไม่มีงานย่อยในโครงการนี้</p>
                )}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '20px' }}>
              <p style={{ fontSize: '18px', color: '#94a3b8' }}>ยังไม่พบข้อมูลการมอบหมายงานในระบบ</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskSummary;