import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pm/WKDashboard.css';

const ForemanHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // ✅ เพิ่มข้อมูลคะแนนข้อสอบและคะแนนหน้างานลงใน Mock Data
    setTimeout(() => {
      const mockHistory = [
        {
          id: 1,
          workerName: "นายขยัน ยิ่งยืน",
          skill: "ช่างก่ออิฐ",
          taskName: "งานก่ออิฐมวลเบา",
          location: "โครงการ The Zenith (โซน C - ชั้น 2)",
          startDate: "01/02/2026",
          endDate: "08/02/2026",
          theoryScore: 52, // คะแนนเต็ม 60
          practicalScore: 68, // คะแนนเต็ม 72
          comment: "ทำงานได้มาตรฐานดีมาก ตรวจสอบแนวระนาบแล้วผ่านเกณฑ์"
        },
        {
          id: 2,
          workerName: "นายวิชัย สายไฟ",
          skill: "ช่างไฟฟ้า",
          taskName: "เดินสายไฟบ้านพัก",
          location: "โครงการ The Zenith (โซน A - หลังที่ 15)",
          startDate: "03/02/2026",
          endDate: "05/02/2026",
          theoryScore: 40,
          practicalScore: 50,
          comment: "ติดตั้งอุปกรณ์ครบถ้วน แต่ควรระวังเรื่องการเก็บปลายสาย"
        }
      ];
      setHistory(mockHistory);
      setLoading(false);
    }, 500);
  }, []);

  // ✅ ฟังก์ชันคำนวณระดับ (Level) จากคะแนนรวม
  const calculateResult = (theory, practical) => {
    const totalMax = 60 + 72; // รวมคะแนนเต็ม 132
    const currentTotal = theory + practical;
    const percent = (currentTotal / totalMax) * 100;

    if (percent >= 85) return { level: 3, label: "ระดับ 3: ช่างเทคนิคอาวุโส", color: "#8b5cf6" };
    if (percent >= 70) return { level: 2, label: "ระดับ 2: ช่างฝีมือ", color: "#3b82f6" };
    return { level: 1, label: "ระดับ 1: ช่างฝึกหัด / พื้นฐาน", color: "#f59e0b" };
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-title" style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>Foreman Portal</div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/foreman')}>หน้าหลัก</button>
          <button className="menu-item active">ประวัติการประเมิน</button>
          <button className="menu-item logout-btn" style={{ marginTop: 'auto', color: '#ef4444' }} onClick={() => navigate('/login')}>ออกจากระบบ</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ padding: '30px' }}>
        <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>📜 ประวัติการประเมิน</h1>
          <button onClick={() => navigate('/foreman')} className="pill" style={{ background: 'white', border: '1px solid #cbd5e1', cursor: 'pointer' }}>&larr; กลับหน้าหลัก</button>
        </header>

        <div style={{ display: 'grid', gap: '15px' }}>
          {history.map((item) => (
            <div key={item.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{item.workerName}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>งาน: {item.taskName}</p>
              </div>
              <button onClick={() => { setSelectedTask(item); setShowModal(true); }} style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                ดูรายละเอียด
              </button>
            </div>
          ))}
        </div>

        {/* ✅ Modal Pop-up สรุปผลคะแนนและระดับ */}
        {showModal && selectedTask && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <h2 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>สรุปผลการประเมินทักษะ</h2>
              
              <div style={{ display: 'grid', gap: '12px', fontSize: '15px' }}>
                <p><strong>ชื่อช่าง:</strong> {selectedTask.workerName}</p>
                <p><strong>ชื่องาน:</strong> {selectedTask.taskName}</p>
                <p><strong>สถานที่:</strong> {selectedTask.location}</p>
                <p><strong>ระยะเวลา:</strong> {selectedTask.startDate} - {selectedTask.endDate}</p>

                <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '10px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 15px', borderRadius: '8px' }}>
                    <span>คะแนนข้อสอบ (ทฤษฎี):</span>
                    <strong>{selectedTask.theoryScore} 60</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 15px', borderRadius: '8px' }}>
                    <span>คะแนนหน้างาน (ปฏิบัติ):</span>
                    <strong>{selectedTask.practicalScore} 72</strong>
                </div>

                {/* ✅ ส่วนสรุประดับทักษะ */}
                <div style={{ 
                    marginTop: '15px', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    textAlign: 'center', 
                    background: calculateResult(selectedTask.theoryScore, selectedTask.practicalScore).color,
                    color: 'white'
                }}>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>สรุปผลระดับทักษะ</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                        {calculateResult(selectedTask.theoryScore, selectedTask.practicalScore).label}
                    </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic', color: '#64748b' }}>
                    💬 **ความเห็น:** "{selectedTask.comment}"
                </div>
              </div>

              <button onClick={() => setShowModal(false)} style={{ width: '100%', marginTop: '25px', padding: '12px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ForemanHistory;