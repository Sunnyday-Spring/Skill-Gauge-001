import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pm/WKDashboard.css'; 

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: 'ผู้ใช้งาน', id: '', role: 'worker', skillLevel: 1 });
  const [assignedTask, setAssignedTask] = useState(null); 
  const [loadingTask, setLoadingTask] = useState(false);

  useEffect(() => {
    const storedUserStr = sessionStorage.getItem('user');
    if (storedUserStr) {
      setUser(JSON.parse(storedUserStr));
    }
    fetchAssignedTask();
  }, []);

  const fetchAssignedTask = async () => {
    setLoadingTask(true);
    try {
      setTimeout(() => {
        setAssignedTask({
            id: 'T-1024',
            project: 'โครงการหมู่บ้านจัดสรร The Zenith',
            location: 'โซน B - งานเทคานชั้น 2',
            foreman: 'หัวหน้าวิชัย',
            date: '08/01/2026',
            status: 'accepted' 
        });
        setLoadingTask(false);
      }, 500);
    } catch (err) { setLoadingTask(false); }
  };

  const handleGoToSubmit = () => {
    navigate('/worker/task-detail', { state: { task: assignedTask } });
  };

  const handleLogout = () => {
    if (window.confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  // ฟังก์ชันช่วยแสดงชื่อระดับ
  const getLevelName = (lv) => {
    if (lv === 1) return "ระดับ 1: ช่างฝึกหัด / พื้นฐาน";
    if (lv === 2) return "ระดับ 2: ช่างฝีมือ";
    if (lv === 3) return "ระดับ 3: ช่างเทคนิคอาวุโา";
    return "ยังไม่ได้ระบุระดับ";
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
          <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
                Worker Portal
          </div>
          <button className="menu-item active" onClick={() => navigate('/worker')}>หน้าหลัก</button>
          <button className="menu-item" onClick={() => navigate('/worker-settings')}>ตั้งค่า</button>
          <button className="menu-item" onClick={() => navigate('/worker/history')}>ประวัติ</button>
          <button className="menu-item" onClick={handleLogout} style={{ marginTop: '20px', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}>
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h1 style={{ margin: 0, fontSize: '24px' }}>สวัสดี, {user.name}</h1>
             <span className="role-pill" style={{ background: '#22c55e', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>Worker</span>
          </div>
        </div>

        <div className="dashboard-content" style={{ padding: '30px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '5px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>ระดับทักษะปัจจุบัน</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>
                    {getLevelName(user.skillLevel || 1)}
                </div>
            </div>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>งานที่ได้รับมอบหมาย</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginTop: '5px' }}>
                    {assignedTask ? '1 งาน' : '0 งาน'}
                </div>
            </div>
          </div>

          <h3 style={{ color: '#334155', marginBottom: '15px' }}>ภารกิจวันนี้ (มอบหมายโดย PM)</h3>

          <div style={{ marginBottom: '40px' }}>
            {loadingTask ? (
                <div>กำลังโหลด...</div>
            ) : !assignedTask ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                    ไม่มีงานใหม่
                </div>
            ) : (
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #bbf7d0', borderLeft: '5px solid #22c55e', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '20px' }}>📍</span>
                                <h3 style={{ margin: 0, color: '#1e293b' }}>{assignedTask.project}</h3>
                            </div>
                            <p style={{ margin: 0, color: '#475569' }}>
                                <strong>จุดปฏิบัติงาน:</strong> {assignedTask.location} <br/>
                                <strong>ผู้คุมงาน:</strong> {assignedTask.foreman} | <strong>กำหนดส่ง:</strong> {assignedTask.date}
                            </p>
                         </div>
                         <div>
                            <button 
                                onClick={handleGoToSubmit}
                                style={{ padding: '12px 24px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ดูรายละเอียด / ส่งงาน &rarr;
                            </button>
                         </div>
                    </div>
                </div>
            )}
          </div>

          <h3 style={{ color: '#334155', marginBottom: '15px' }}>ระบบทดสอบและประเมิน</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             {/* ✅ แก้ไขป้ายบอกระดับในเมนูทำข้อสอบ */}
             <div onClick={() => navigate('/worker/test')} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', borderTop: '4px solid #f59e0b' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>📝 แบบทดสอบวัดทักษะ (ระดับ 1)</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                    แบบทดสอบความรู้ทางทฤษฎีพื้นฐาน สำหรับช่างระดับ 1
                </p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>* ต้องสอบให้ผ่านก่อนรับการประเมินหน้างาน</div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;