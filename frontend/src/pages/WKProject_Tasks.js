import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockUser } from '../mock/mockData';
import './Dashboard.css';

const WKProjectTasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const incomingProject = location.state?.project;
  const user = location.state?.user || { ...mockUser, role: 'Project Manager' };
  
  const [currentStep, setCurrentStep] = useState(incomingProject ? 2 : 1);
  const [existingTasks, setExistingTasks] = useState([]);

  const [projectForm, setProjectForm] = useState(incomingProject || {
    projectName: '', projectType: 'บ้านพักอาศัย', locationDetail: '', mapLink: '', startDate: '', endDate: ''
  });

  const [taskForm, setTaskForm] = useState({
    taskName: '', taskType: 'งานโครงสร้าง', milpCondition: 'ทั่วไป', requiredWorkers: '1', startDate: '', endDate: '', taskDetail: '',         
  });

  useEffect(() => {
    const currentJobs = JSON.parse(localStorage.getItem('mock_jobs') || '[]');
    const projectInStorage = currentJobs.find(p => p.projectName === projectForm.projectName);
    if (projectInStorage && projectInStorage.tasks) {
      setExistingTasks(projectInStorage.tasks);
    }
  }, [projectForm.projectName]);

  const handleProjectChange = (e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  const handleTaskChange = (e) => setTaskForm({ ...taskForm, [e.target.name]: e.target.value });

  const goToStep2 = (e) => {
    e.preventDefault();
    if (!projectForm.projectName) { alert("กรุณาระบุชื่อโครงการหลัก"); return; }
    setCurrentStep(2);
  };

  const handleSubmitAll = (e) => {
    e.preventDefault();
    navigate('/assign-worker', { state: { job: { ...projectForm, ...taskForm }, user } });
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
          <button type="button" className="menu-item" onClick={() => navigate('/pm')}>Dashboard</button>
          <button type="button" className="menu-item active" onClick={() => navigate('/project-tasks')}>Tasks</button>
          <button type="button" className="menu-item" onClick={() => navigate('/projects')}>Projects</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ width: '100%', marginLeft: 0 }}>
        <div style={{ padding: '20px' }}>
          {currentStep === 1 && (
            <div style={{ background: 'white', padding: '40px', borderRadius: '15px', border: '1px solid #e2e6ec' }}>
              <h2 style={{ color: '#3498db', marginBottom: '30px' }}>ขั้นตอนที่ 1: สร้างโครงการหลัก</h2>
              <form onSubmit={goToStep2}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '20px' }}>
                  <div><label style={labelStyle}>ชื่อโครงการ</label><input style={inputStyle} name="projectName" value={projectForm.projectName} onChange={handleProjectChange} required /></div>
                  <div><label style={labelStyle}>ประเภทโครงการ</label><select style={inputStyle} name="projectType" value={projectForm.projectType} onChange={handleProjectChange}><option value="บ้านพักอาศัย">บ้านพักอาศัย</option><option value="โรงงาน/คลังสินค้า">โรงงาน/คลังสินค้า</option></select></div>
                </div>
                <button type="submit" style={btnNextStyle}>ขั้นตอนถัดไป ➝</button>
              </form>
            </div>
          )}

          {currentStep === 2 && (
            <>
              <div style={{ background: '#2c3e50', color: 'white', padding: '25px', borderRadius: '15px', marginBottom: '25px' }}>
                  <h2 style={{ margin: '5px 0' }}>{projectForm.projectName}</h2>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>📍 {projectForm.locationDetail} | 🏢 {projectForm.projectType}</div>
              </div>

              <div style={{ background: 'white', padding: '40px', borderRadius: '15px', border: '1px solid #e2e6ec', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#e67e22', marginBottom: '30px' }}>ขั้นตอนที่ 2: กำหนดงานย่อย</h2>
                <form onSubmit={handleSubmitAll}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                    <div><label style={labelStyle}>ชื่อภารกิจย่อย</label><input style={inputStyle} name="taskName" onChange={handleTaskChange} required /></div>
                    <div><label style={labelStyle}>ประเภทงาน</label>
                      <select style={inputStyle} name="taskType" value={taskForm.taskType} onChange={handleTaskChange}>
                        <option value="งานโครงสร้าง">งานโครงสร้าง</option><option value="งานไฟฟ้า">งานไฟฟ้า</option><option value="งานประปา">งานประปา</option>
                        <option value="งานหลังคา">งานหลังคา</option><option value="งานสี">งานสี</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
                    {/* ✅ เพิ่มตัวเลือกเงื่อนไข MILP แบบใช้งานจริง */}
                    <div>
                      <label style={labelStyle}>เงื่อนไขงาน (MILP Requirement)</label>
                      <select style={inputStyle} name="milpCondition" onChange={handleTaskChange}>
                        <option value="ทั่วไป">ทั่วไป (Normal)</option>
                        <option value="เร่งด่วน">เร่งด่วน (Urgent)</option>
                        <option value="ฝีมือ">ฝีมือ (High Skill)</option>
                        <option value="ล่วงเวลา">ล่วงเวลา (Overtime)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>จำนวนช่างที่ต้องการ (คน)</label>
                      <input type="number" style={inputStyle} name="requiredWorkers" value={taskForm.requiredWorkers} onChange={handleTaskChange} min="1" required />
                    </div>
                  </div>

                  <div style={{ marginBottom: '25px' }}><label style={labelStyle}>รายละเอียดและคำสั่งงาน</label><textarea style={{ ...inputStyle, minHeight: '100px' }} name="taskDetail" onChange={handleTaskChange} required /></div>
                  <button type="submit" style={btnSubmitStyle}>ไปเลือกทีมช่างสำหรับงานนี้ ➝</button>
                </form>
              </div>

              {/* ✅ ส่วนบ็อกซ์รายการที่มอบหมายแล้ว */}
              {existingTasks.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>📋 รายการงานที่มอบหมายแล้วในโครงการนี้</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {existingTasks.map((t, idx) => (
                      <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{fontSize:'16px'}}>{idx + 1}. {t.taskName}</strong>
                            <span style={{ marginLeft: '10px', fontSize: '13px', color: '#7f8c8d' }}>
                              ({t.taskType} | <span style={{color:'#e67e22', fontWeight:'bold'}}>เงื่อนไข: {t.milpCondition}</span>)
                            </span>
                          </div>
                          <span style={{ background: '#e8f5e9', color: '#27ae60', padding: '5px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                            ช่างที่เลือก: {t.assigned_workers?.length} / {t.requiredWorkers} คน
                          </span>
                        </div>
                        
                        <div style={{ padding: '20px' }}>
                           <p style={{fontSize:'13px', color:'#64748b', marginBottom:'15px'}}>📝 รายละเอียด: {t.taskDetail}</p>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                             {t.assigned_workers?.map((w, i) => (
                               <div key={i} style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <div>
                                   <div style={{fontWeight:'bold', fontSize:'14px'}}>{w.name}</div>
                                   <div style={{fontSize:'11px', color:'#94a3b8'}}>อายุ {w.age} ปี | ประสบการณ์ {w.experience_years} ปี</div>
                                 </div>
                                 <span style={{color:'#3498db', fontWeight:'bold', fontSize:'12px'}}>Lv. {w.level}</span>
                               </div>
                             ))}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#34495e', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dcdfe6', outline: 'none', boxSizing: 'border-box' };
const btnNextStyle = { width: '100%', padding: '15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' };
const btnSubmitStyle = { width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' };

export default WKProjectTasks;