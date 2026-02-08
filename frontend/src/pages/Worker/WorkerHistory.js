import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pm/WKDashboard.css';

const WorkerHistory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('submission'); // 'submission' หรือ 'assessment'

  // ✅ Mock Data สำหรับประวัติการส่งงาน
  const submissionHistory = [
    { id: 'T-1020', project: 'The Zenith', date: '01/02/2026', status: 'Approved', note: 'งานเทคานเรียบร้อย' },
    { id: 'T-1015', project: 'Skyline Condo', date: '25/01/2026', status: 'Approved', note: 'เดินท่อประปาโซน A' }
  ];

  // ✅ Mock Data สำหรับประวัติการประเมิน (Rubric Score)
  const assessmentHistory = [
    { 
        id: 1, 
        date: '02/02/2026', 
        assessor: 'Foreman วิชัย', 
        task: 'งานเทคาน', 
        score: 85, 
        level: 1, 
        comment: 'ทำงานได้ตามมาตรฐาน มีความปลอดภัยสูง' 
    },
    { 
        id: 2, 
        date: '15/01/2026', 
        assessor: 'Foreman สมชาย', 
        task: 'งานเตรียมพื้นที่', 
        score: 70, 
        level: 1, 
        comment: 'ความรวดเร็วดี แต่ควรปรับปรุงเรื่องการเก็บกวาดเครื่องมือ' 
    }
  ];

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <nav className="menu">
          <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>Worker Portal</div>
          <button className="menu-item" onClick={() => navigate('/worker')}>&larr; กลับหน้าหลัก</button>
        </nav>
      </aside>

      <main className="dash-main" style={{ padding: '20px' }}>
        <div className="panel" style={{ background: 'white', borderRadius: '15px', padding: '25px' }}>
          <h2 style={{ marginBottom: '20px' }}>📜 ประวัติการทำงานและผลประเมิน</h2>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <button 
                onClick={() => setActiveTab('submission')}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'submission' ? '#3b82f6' : '#f1f5f9', color: activeTab === 'submission' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 'bold' }}
            >
                1. ประวัติการส่งงาน
            </button>
            <button 
                onClick={() => setActiveTab('assessment')}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'assessment' ? '#22c55e' : '#f1f5f9', color: activeTab === 'assessment' ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 'bold' }}
            >
                2. ประวัติการประเมินทักษะ
            </button>
          </div>

          {/* Content ส่วนที่ 1: ประวัติการส่งงาน */}
          {activeTab === 'submission' && (
            <div className="table">
              <div className="thead" style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr' }}>
                <div>วันที่ส่ง</div><div>โครงการ</div><div>สถานะ</div><div>หมายเหตุ</div>
              </div>
              <div className="tbody">
                {submissionHistory.map(item => (
                  <div className="tr" key={item.id} style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr' }}>
                    <div className="td">{item.date}</div>
                    <div className="td"><strong>{item.project}</strong></div>
                    <div className="td"><span className="pill small" style={{ background: '#dcfce7', color: '#166534' }}>{item.status}</span></div>
                    <div className="td" style={{ fontSize: '12px' }}>{item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content ส่วนที่ 2: ประวัติการประเมิน */}
          {activeTab === 'assessment' && (
            <div style={{ display: 'grid', gap: '15px' }}>
              {assessmentHistory.map(evalItem => (
                <div key={evalItem.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '18px', color: '#1e293b' }}>คะแนน: {evalItem.score}/100</strong>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>วันที่: {evalItem.date}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px' }}>
                        ภารกิจ: {evalItem.task} | ผู้ประเมิน: {evalItem.assessor}
                    </div>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '14px', fontStyle: 'italic' }}>
                        " {evalItem.comment} "
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 'bold', color: '#22c55e' }}>
                        ผลการตัดสิน: ผ่านการประเมิน (ระดับ {evalItem.level})
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerHistory;