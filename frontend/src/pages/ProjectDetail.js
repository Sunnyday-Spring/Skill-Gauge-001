import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockUser } from '../mock/mockData';
import './Dashboard.css';

const ProjectDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ ดึงข้อมูลโครงการจาก state
  const { project } = location.state || {};
  const user = location.state?.user || { ...mockUser, role: 'Project Manager' };

  // ✅ State สำหรับช่องค้นหา
  const [searchTerm, setSearchTerm] = useState('');

  if (!project) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>ไม่พบข้อมูลโครงการ</h2>
        <button onClick={() => navigate('/projects')}>กลับไปหน้ารวมโครงการ</button>
      </div>
    );
  }

  // ✅ ฟังก์ชันข้ามไปหน้าเพิ่มงานย่อย
  const handleAddNewTask = () => {
    const projectData = {
      projectName: project.projectName,
      projectType: project.projectType,
      locationDetail: project.locationDetail,
      pmName: project.pmName || user.name,
      isExistingProject: true 
    };
    navigate('/define-tasks', { state: { project: projectData, user } });
  };

  // ✅ 1. ดึงรายการงานย่อยทั้งหมด (tasks) ออกมา ถ้าไม่มีให้มองเป็นอาร์เรย์ว่าง
  const allTasks = project.tasks || []; 
  
  // ✅ 2. กรองข้อมูลงานย่อยตามคำค้นหา (Search Logic เดิมของมึง)
  const filteredTasks = allTasks.filter(task => 
    task.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.taskType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/pm')}>Dashboard</button>
          <button className="menu-item" onClick={() => navigate('/project-tasks')}>Tasks</button>
          <button className="menu-item active" onClick={() => navigate('/projects')}>Projects</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ width: '100%', marginLeft: 0 }}>
        <div className="dash-topbar" style={{ padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => navigate('/projects')} style={{ background: '#f1f2f6', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>← ย้อนกลับ</button>
            <h2 style={{ margin: 0 }}>รายละเอียดโครงการฉบับเต็ม</h2>
          </div>
          <button onClick={handleAddNewTask} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            + เพิ่มงานย่อยใหม่
          </button>
        </div>

        <div style={{ padding: '30px' }}>
          {/* 📦 บ็อกซ์บน: ข้อมูลโครงการหลัก (กูคงสไตล์เดิมของมึงไว้เป๊ะๆ) */}
          <div style={{ background: '#2c3e50', color: 'white', padding: '30px', borderRadius: '20px', marginBottom: '30px' }}>
            <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>Project Overview</span>
            <h1 style={{ margin: '10px 0', fontSize: '28px' }}>{project.projectName}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px', opacity: 0.9 }}>
              <div>📍 สถานที่: {project.locationDetail}</div>
              <div>🏢 ประเภท: {project.projectType}</div>
              <div>👤 PM: {project.pmName || user.name}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>🛠️ รายการงานย่อยที่มอบหมายแล้ว ({filteredTasks.length})</h3>
            <div style={{ position: 'relative', width: '350px' }}>
              <input 
                type="text" 
                placeholder="🔍 ค้นหาชื่องานย่อย หรือหมวดหมู่..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 20px', 
                  borderRadius: '30px', 
                  border: '2px solid #edf2f7', 
                  outline: 'none',
                  fontSize: '14px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
              />
            </div>
          </div>

          {/* ✅ 3. ส่วนบ็อกซ์ล่าง: แก้ไขให้ map วนลูปงานย่อยออกมาเป็นบ็อกซ์ๆ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {filteredTasks.length > 0 ? filteredTasks.map((task, index) => (
              <div key={index} style={{ background: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                {/* ส่วนหัวของงานย่อย */}
                <div style={{ background: '#f8fafc', padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '18px' }}>{index + 1}. {task.taskName}</strong>
                    <span style={{ marginLeft: '15px', color: '#64748b' }}>หมวดหมู่: {task.taskType}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{task.milpCondition}</span>
                    <span style={{ background: '#f0fdf4', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>ช่าง {task.assigned_workers?.length || 0} คน</span>
                  </div>
                </div>

                {/* รายละเอียดด้านใน (เพิ่มข้อมูล อายุ/ประสบการณ์ ตามที่มึงขอ) */}
                <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '40px' }}>
                  <div>
                    <h4 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px' }}>รายละเอียดงาน:</h4>
                    <p style={{ fontSize: '14px', color: '#475569' }}>{task.taskDetail || "ไม่ระบุ"}</p>
                  </div>
                  <div>
                    <h4 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '15px' }}>รายชื่อช่างปฏิบัติงาน:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                      {task.assigned_workers?.map((w, i) => (
                        <div key={i} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>{w.name}</span>
                            {/* ✅ เพิ่มข้อมูล อายุ และ ประสบการณ์ ตรงนี้ */}
                            <span style={{ fontSize: '11px', color: '#64748b' }}>อายุ: {w.age} ปี | ประสบการณ์: {w.experience_years} ปี</span>
                          </div>
                          <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Lv. {w.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', background: '#f8fafc', borderRadius: '15px' }}>
                ยังไม่มีข้อมูลงานย่อยในโครงการนี้ หรือไม่พบผลการค้นหา
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;