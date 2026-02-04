import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../../pages/pm/WKDashboard.css';
import './WKSkillAssessmentTest.css';
import { mockUser } from '../../mock/mockData';

const SkillAssessmentTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navUser = location.state?.user;
  const user = navUser || { ...mockUser, role: 'worker' };

  // ✅ 1. ตั้ง State รอรับข้อมูลหัวข้อประเมิน
  const [examStructure, setExamStructure] = useState({
    roleTitle: user.roleName || 'ช่างปฏิบัติการ',
    categories: [], // จะเก็บ ['งานเหล็ก', 'งานคอนกรีต'] หรือ ['เดินสายไฟ', 'ติดตั้งตู้']
    loading: true
  });

  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        // ✅ 2. ดึงข้อมูลว่าช่าง Role นี้ มีหัวข้อประเมินอะไรบ้างจาก Admin
        const response = await axios.get(`/api/quiz/structure-info?role=${user.roleName}`);
        
        // สมมติ API ส่งกลับมาเป็น { roleTitle: 'ช่างไฟฟ้า', categories: ['งานเดินสาย', 'ระบบควบคุม'] }
        if (response.data) {
          setExamStructure({
            roleTitle: response.data.roleTitle,
            categories: response.data.categories,
            loading: false
          });
        }
      } catch (error) {
        console.error("ดึงข้อมูลหัวข้อไม่ได้:", error);
        setExamStructure(prev => ({ ...prev, loading: false }));
      }
    };

    fetchExamInfo();
  }, [user.roleName]);

  const startTest = () => {
    navigate('/skill-assessment/quiz', { state: { user } });
  };

  return (
    <div className="dash-layout">
      {/* Sidebar เหมือนเดิม */}
      <aside className="dash-sidebar">
        <nav className="menu">
          <button type="button" className="menu-item" onClick={() => navigate('/dashboard', { state: { user } })}>Tasks</button>
          <button type="button" className="menu-item active">Skill Assessment Test</button>
        </nav>
      </aside>

      <main className="dash-main">
        <div className="assessment-page">
          {/* ✅ 3. หัวข้อเปลี่ยนตามประเภทช่างจริง */}
          <h1>แบบประเมิน{examStructure.roleTitle}</h1>

          <section className="ass-section">
            <h2>ภาพรวมการประเมิน</h2>
            <p className="ass-desc">แบบทดสอบทักษะนี้จะประเมินความสามารถของคุณในด้านต่อไปนี้:</p>
            
            <div className="ass-categories">
              {examStructure.loading ? (
                <span>กำลังดึงข้อมูลหัวข้อ...</span>
              ) : examStructure.categories.length > 0 ? (
                // ✅ 4. วนลูปโชว์หัวข้อ (Pill) ตามข้อมูลที่ได้จาก Admin จริงๆ
                examStructure.categories.map((cat, index) => (
                  <span key={index} className="ass-pill">
                    {cat}
                  </span>
                ))
              ) : (
                // กรณีฉุกเฉินดึงข้อมูลไม่ได้
                <span style={{color: '#999'}}>ไม่มีข้อมูลหมวดหมู่</span>
              )}
            </div>
          </section>

          <section className="ass-section">
            <h2>รายละเอียดการทดสอบ</h2>
            <p className="ass-desc">
              - ระบบจะคำนวณน้ำหนักคะแนน (%) ตามสัดส่วนของจำนวนข้อสอบในแต่ละหมวดหมู่<br/>
              - ผลการประเมินจะถูกนำไปรวมกับคะแนนหน้างานเพื่อสรุป "ระดับช่าง" (Skill Level)
            </p>
          </section>

          <div className="ass-actions">
            <button className="btn-primary" onClick={startTest}>เริ่มทำแบบทดสอบ</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillAssessmentTest;