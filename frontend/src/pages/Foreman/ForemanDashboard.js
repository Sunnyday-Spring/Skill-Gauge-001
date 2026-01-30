import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // ถ้ายังไม่ใช้ axios ให้ปิดไว้ก่อน

// ✅ แก้ path ให้เรียกไปที่โฟลเดอร์ general ที่อยู่ข้างๆ กัน
import '../general/Dashboard.css'; 

// ✅ เรียก mockData ถอย 2 ชั้น (กลับไป src -> เข้า mock)
import { mockUser } from '../../mock/mockData'; 

const ForemanDashboard = () => {
  const navigate = useNavigate();

  // ข้อมูลผู้ใช้งาน
  const user = { name: 'หัวหน้าวิชัย', role: 'Foreman' };

  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันดึงข้อมูล (API)
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      console.log("Fetching workers...");
      // จำลองข้อมูลเพื่อทดสอบ
      setPendingWorkers([
        { id: 1, name: 'นายสมชาย ใจดี', roleName: 'ช่างก่ออิฐ', date: '2023-10-25' },
        { id: 2, name: 'นายมีชัย รักดี', roleName: 'ช่างปูน', date: '2023-10-26' }
      ]); 
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAssessClick = (worker) => {
    navigate('/foreman/assessment', { state: { worker } });
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
            {/* ใส่ปุ่มเมนูให้ดูดีขึ้น */}
            <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
                Foreman Panel
            </div>
            
            <button className="menu-item active" onClick={() => navigate('/foreman')}>
                Dashboard
            </button>
            
            <button className="menu-item" onClick={() => navigate('/foreman-reports')}>
                รายงานสรุปงาน
            </button>

            {/* ปุ่ม My Projects */}
            <button className="menu-item" onClick={() => navigate('/project-detail')}>
                My Projects
            </button>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div className="header-info">
            <h1>สวัสดี, {user.name}</h1>
            <p>บทบาท: {user.role}</p>
          </div>
        </header>

        <section className="dash-content">
          <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>รายการช่างที่รอการประเมิน</h2>
            <button onClick={fetchWorkers} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                อัปเดตข้อมูล
            </button>
          </div>

          {loading ? (
            <div className="loading">กำลังโหลดข้อมูล...</div>
          ) : pendingWorkers.length === 0 ? (
            <div className="empty-state">
              <p>ไม่มีรายการช่างที่รอการประเมินในขณะนี้</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {pendingWorkers.map((worker) => (
                <div key={worker.id} className="card-action" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#2c3e50' }}>{worker.name}</h3>
                      <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                        {worker.roleName}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
                      {worker.date}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAssessClick(worker)}
                    style={{ 
                        width: '100%', padding: '10px', background: '#0f172a', color: 'white', 
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' 
                    }}
                  >
                    ประเมินผลงาน
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ForemanDashboard;