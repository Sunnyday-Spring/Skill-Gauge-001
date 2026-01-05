import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// แก้ไข path CSS ให้ถูกต้อง (ชี้ไปที่โฟลเดอร์ admin) 
import './ForemanAssessment.css'; 

// --- ข้อมูลแบบประเมิน 18 ข้อ (อิงตามไฟล์ PDF ปรับปรุง 2) ---
const ONSITE_CRITERIA = [
  {
    id: "readiness",
    title: "A. ความเข้าใจงาน & ความพร้อม (Understanding & Readiness)",
    questions: [
      "1. เข้าใจแบบ งานสั่ง หรือคำอธิบายงานได้ถูกต้อง (Understands drawings, orders, and instructions)",
      "2. การวัดและการคำนวณ (Correct measurements)",
      "3. การใช้เครื่องมือถูกต้องเหมาะสม (Calculations, and tool usage)"
    ]
  },
  {
    id: "methodology",
    title: "B. วิธีการทำงาน (Work Methodology)",
    questions: [
      "4. การปฏิบัติงานตามขั้นตอนและวิธีการที่ถูกต้อง (Follows correct work procedures)",
      "5. ปฏิบัติตามขั้นตอนความปลอดภัยในการทำงาน (Follows safety procedures)"
    ]
  },
  {
    id: "quality",
    title: "C. คุณภาพและความถูกต้องของงาน (Quality & Accuracy)",
    questions: [
      "6. ตำแหน่ง ระดับ แนว และมุมของงานถูกต้องตามที่กำหนด (Correct position, level, alignment, and angles)",
      "7. งานทำตามแบบและข้อกำหนดที่ได้รับ (Compliance with drawings and specifications)",
      "8. ความแข็งแรงและความคงทนของงาน (Strength and durability)",
      "9. ความเรียบร้อยและความละเอียดของงาน (Neatness and attention to detail)"
    ]
  },
  {
    id: "efficiency",
    title: "D. ประสิทธิภาพในการทำงาน (Work Efficiency)",
    questions: [
      "10. ทำงานได้ทันตามเวลาที่กำหนดและทำงานต่อเนื่อง (Timeliness and continuous workflow)",
      "11. บริหารเวลาและลำดับงานได้เหมาะสม (Time management and task sequencing)",
      "12. ทำงานร่วมกับผู้อื่นได้ดี ไม่เป็นอุปสรรคต่อทีม (Teamwork and cooperation)"
    ]
  },
  {
    id: "safety",
    title: "E. ความปลอดภัยเชิงพฤติกรรม (Behavioral Safety)",
    questions: [
      "13. หลีกเลี่ยงพฤติกรรมเสี่ยงและแจ้งเมื่อพบความเสี่ยง (Avoids risky behavior and reports hazards)",
      "14. ใช้อุปกรณ์ป้องกันส่วนบุคคลครบถ้วนและถูกต้อง (Proper usage of PPE)"
    ]
  },
  {
    id: "responsibility",
    title: "F. ความรับผิดชอบและทัศนคติ (Responsibility & Attitude)",
    questions: [
      "15. ตรงต่อเวลาและพร้อมทำงาน (Punctuality and readiness)",
      "16. รับผิดชอบต่องานที่ได้รับมอบหมายจนแล้วเสร็จ (Responsibility until completion)",
      "17. แก้ไขปัญหาที่เกิดขึ้นได้ ไม่หลีกเลี่ยงความรับผิดชอบ (Problem solving and accountability)",
      "18. ปฏิบัติตามคำสั่งและข้อตกลงของผู้ควบคุมงาน (Compliance with supervisor's orders)"
    ]
  }
];

const ForemanAssessment = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState({});
  const [workerName, setWorkerName] = useState("");
  const [skillType, setSkillType] = useState("structural"); // Default

  // Mock User
  const user = { role: 'foreman', name: 'หัวหน้างาน สมชาย' };

  const handleScoreChange = (category, index, value) => {
    setScores(prev => ({
      ...prev,
      [`${category}_${index}`]: parseInt(value)
    }));
  };

  const handleSubmit = async () => {
    // 1. Validation
    let totalQuestions = 0;
    ONSITE_CRITERIA.forEach(c => totalQuestions += c.questions.length);
    
    if (Object.keys(scores).length < totalQuestions) {
      alert(`กรุณาประเมินให้ครบทุกข้อ (${Object.keys(scores).length}/${totalQuestions})`);
      return;
    }
    if (!workerName.trim()) {
        alert("กรุณาระบุชื่อช่างที่ถูกประเมิน");
        return;
    }

    // 2. คำนวณคะแนน
    let onsiteRaw = 0;
    const onsiteDetails = {};

    ONSITE_CRITERIA.forEach(cat => {
      let catScore = 0;
      let catMax = cat.questions.length * 4;
      cat.questions.forEach((_, idx) => {
        catScore += scores[`${cat.id}_${idx}`] || 0;
      });
      onsiteDetails[cat.id] = {
        score: catScore,
        maxScore: catMax,
        percentage: ((catScore / catMax) * 100).toFixed(2)
      };
      onsiteRaw += catScore;
    });

    const onsiteMax = totalQuestions * 4; // 72 คะแนน

    const payload = {
      workerName: workerName,
      skillType: skillType,
      onsiteRaw,
      onsiteMax,
      onsiteDetails,
      evaluatedBy: user.name
    };

    console.log("Submit Payload:", payload);
    alert(`บันทึกผลการประเมินสำเร็จ!\n\nช่าง: ${workerName}\nคะแนนที่ได้: ${onsiteRaw} / ${onsiteMax}`);
    navigate('/foreman'); 
  };

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="sidebar-logo">SkillGauge</div>
        <nav className="menu">
          <button className="menu-item" onClick={() => navigate('/foreman')}>Dashboard</button>
          <button className="menu-item active">ประเมินหน้างาน</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="role-pill bg-warning text-dark">Foreman</div>
          <div className="top-actions">
            <span className="profile">
              <span className="avatar-circle">F</span>
              <span className="username">{user.name}</span>
            </span>
          </div>
        </div>

        <div className="assessment-container">
          <header className="page-header">
            <h1>📋 แบบประเมินผลการปฏิบัติงาน (Onsite Assessment)</h1>
            <p className="text-muted">ให้คะแนนตามความเป็นจริง (1 = ปรับปรุง, 4 = ดีมาก)</p>
          </header>

          {/* --- ส่วนที่ 1: ข้อมูลช่าง (เน้นให้ชัดเจน) --- */}
          <div className="worker-info-card" style={{ borderLeft: '5px solid #007bff', background: '#eef7ff' }}>
            <h3 style={{ color: '#0056b3', marginBottom: '15px' }}>👤 ส่วนที่ 1: ข้อมูลผู้ถูกประเมิน</h3>
            <div className="form-group-row">
                <div className="form-group">
                    <label style={{fontWeight: 'bold'}}>ชื่อ-นามสกุล ช่าง:</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="ระบุชื่อช่าง..." 
                        value={workerName}
                        onChange={(e) => setWorkerName(e.target.value)}
                        style={{ border: '2px solid #b3d7ff' }}
                    />
                </div>
                <div className="form-group">
                    <label style={{fontWeight: 'bold'}}>ตำแหน่ง/สาขางาน:</label>
                    <select 
                        className="form-control" 
                        value={skillType} 
                        onChange={(e) => setSkillType(e.target.value)}
                        style={{ border: '2px solid #b3d7ff' }}
                    >
                        <option value="structural">ช่างโครงสร้าง (Structural)</option>
                        <option value="electrical">ช่างไฟฟ้า (Electrical)</option>
                        <option value="plumbing">ช่างประปา (Plumbing)</option>
                        <option value="tiling">ช่างกระเบื้อง (Tiling)</option>
                        <option value="general">กรรมกร/ช่างทั่วไป (General)</option>
                    </select>
                </div>
            </div>
          </div>

          {/* --- ส่วนที่ 2: แบบสอบถาม --- */}
          <div className="criteria-list">
            <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>📝 ส่วนที่ 2: เกณฑ์การให้คะแนน</h3>
            {ONSITE_CRITERIA.map((cat) => (
              <div key={cat.id} className="criteria-card">
                <h3 className="criteria-title">{cat.title}</h3>
                <div className="criteria-questions">
                  {cat.questions.map((q, idx) => (
                    <div key={idx} className="question-row">
                      <div className="q-text">{q}</div>
                      <div className="q-options">
                        {[1, 2, 3, 4].map(score => (
                          <label key={score} className={`score-btn ${scores[`${cat.id}_${idx}`] === score ? 'selected' : ''}`}>
                            <input
                              type="radio"
                              name={`${cat.id}_${idx}`}
                              value={score}
                              onChange={(e) => handleScoreChange(cat.id, idx, e.target.value)}
                              style={{display:'none'}}
                            />
                            {score}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="action-footer">
            <button className="btn-cancel" onClick={() => navigate('/foreman')}>ยกเลิก</button>
            <button className="btn-submit" onClick={handleSubmit}>✅ ยืนยันผลการประเมิน</button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ForemanAssessment;