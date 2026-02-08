import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pm/WKDashboard.css'; 

const WorkerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: 'ผู้ใช้งาน', id: '', role: 'worker', skillLevel: 1 });
  const [assignedTask, setAssignedTask] = useState(null); 
  const [loadingTask, setLoadingTask] = useState(false);
  
  // ✅ ตัวแปรเช็คสถานะว่าทำข้อสอบเสร็จหรือยัง
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  useEffect(() => {
    const storedUserStr = sessionStorage.getItem('user');
    if (storedUserStr) {
      const userData = JSON.parse(storedUserStr);
      setUser(userData);
      
      // ✅ เช็คจากข้อมูล user ถ้ามีคะแนนสอบแล้ว ให้ล็อคข้อสอบทันที
      // (มึงสามารถเปลี่ยนเงื่อนไขตรงนี้ตามชื่อฟิลด์จริงใน DB ของมึงได้ เช่น userData.is_tested)
      if (userData.exam_score !== null && userData.exam_score !== undefined) {
        setIsExamCompleted(true);
      }
    }
    fetchAssignedTask();
  }, []);

  const fetchAssignedTask = async () => {
    setLoadingTask(true);
    try {
      // จำลองดึงงานที่ได้รับมอบหมาย
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

  const handleLogout = () => {
    if (window.confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      sessionStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <nav className="menu">
          <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
                Worker Portal
          </div>
          <button className="menu-item active" onClick={() => navigate('/worker')}>หน้าหลัก</button>
          <button className="menu-item" onClick={handleLogout} style={{ marginTop: '20px', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}>
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        <div className="dash-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h1 style={{ margin: 0, fontSize: '24px' }}>สวัสดี, {user.name}</h1>
             <span className="role-pill" style={{ background: '#22c55e', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>Worker</span>
          </div>
        </div>

        <div className="dashboard-content" style={{ padding: '30px' }}>
          
          {/* Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '5px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>ระดับทักษะปัจจุบัน</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>
                    ระดับ {user.skillLevel || 1}
                </div>
            </div>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ color: '#64748b', fontSize: '14px' }}>งานที่ได้รับมอบหมาย</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginTop: '5px' }}>
                    {assignedTask ? '1' : '0'} งาน
                </div>
            </div>
          </div>

          <h3 style={{ color: '#334155', marginBottom: '15px' }}>ภารกิจวันนี้</h3>

          <div style={{ marginBottom: '40px' }}>
            {!assignedTask ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                    ไม่มีงานใหม่
                </div>
            ) : (
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #bbf7d0', borderLeft: '5px solid #22c55e', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>{assignedTask.project}</h3>
                            <p style={{ margin: '5px 0', color: '#475569' }}>📍 {assignedTask.location}</p>
                         </div>
                         <button 
                            onClick={() => navigate('/worker/task-detail', { state: { task: assignedTask } })}
                            style={{ padding: '12px 24px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                         >
                            ดูรายละเอียด / ส่งงาน
                         </button>
                    </div>
                </div>
            )}
          </div>

          <h3 style={{ color: '#334155', marginBottom: '15px' }}>ระบบทดสอบ</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             {/* ✅ ส่วนล็อคข้อสอบ: ถ้าสอบเสร็จแล้ว (isExamCompleted เป็น true) จะกดไม่ได้และสีจะจางลง */}
             <div 
                onClick={() => !isExamCompleted && navigate('/worker/test')} 
                style={{ 
                    background: isExamCompleted ? '#f8fafc' : 'white', 
                    padding: '25px', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    cursor: isExamCompleted ? 'default' : 'pointer', 
                    transition: 'all 0.2s',
                    opacity: isExamCompleted ? 0.6 : 1, // จางลงเมื่อสอบเสร็จ
                    borderTop: isExamCompleted ? '4px solid #cbd5e1' : '4px solid #f59e0b'
                }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: isExamCompleted ? '#94a3b8' : '#1e293b' }}>
                        📝 แบบทดสอบระดับ {user.skillLevel || 1}
                    </h4>
                    {isExamCompleted && (
                        <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '14px' }}>✅ สอบเสร็จแล้ว</span>
                    )}
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                    {isExamCompleted 
                      ? "ท่านดำเนินการสอบทฤษฎีเรียบร้อยแล้ว กรุณารอรับการประเมินจาก Foreman ต่อไป" 
                      : "ทำแบบทดสอบเพื่อวัดระดับความรู้ทางทฤษฎีตามระดับทักษะของท่าน"}
                </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;