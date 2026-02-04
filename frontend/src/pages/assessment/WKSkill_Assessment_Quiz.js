import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // มึงต้องมี axios หรือใช้ fetch ก็ได้
import '../pm/WKDashboard.css';
import './WKSkillAssessmentQuiz.css';
import { mockUser } from '../../mock/mockData';

const SkillAssessmentQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user || mockUser;

  // ✅ 1. เปลี่ยนจาก sampleQuestions เป็น State ว่างๆ เพื่อรอรับข้อมูลจาก Admin
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  // ✅ 2. ใช้ useEffect ดึงข้อสอบตามประเภทช่าง (Role) เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        // สมมติ API มึงส่ง Role ไปเพื่อดึงชุดข้อสอบที่ Admin จัดไว้ให้ช่างประเภทนั้น
        const response = await axios.get(`/api/quiz/get-by-role?role=${user.roleName}`);
        
        if (response.data && response.data.length > 0) {
          setQuestions(response.data);
        }
      } catch (error) {
        console.error("ดึงข้อสอบไม่ได้มึง:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [user.roleName]);

  const q = questions[idx];
  const total = questions.length;
  const percent = total > 0 ? Math.round((idx / total) * 100) : 0;

  const toggleChoice = (choiceIndex) => {
    setAnswers((a) => ({ ...a, [q.id]: choiceIndex }));
  };

  const handleFinalSubmit = () => {
    // 🎯 3. Logic คำนวณน้ำหนัก % ตามจำนวนข้อจริงที่ดึงมาจาก Admin (Dynamic Weight)
    const categoryStats = {};

    questions.forEach((question) => {
      const cat = question.category || 'General';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { correct: 0, total: 0 };
      }
      categoryStats[cat].total += 1;
      if (answers[question.id] === question.answer) {
        categoryStats[cat].correct += 1;
      }
    });

    const categorySummary = Object.keys(categoryStats).map((catName) => {
      const stat = categoryStats[catName];
      return {
        categoryName: catName,
        correct: stat.correct,
        totalInCat: stat.total,
        // % น้ำหนักจะวิ่งตามจำนวนข้อที่ Admin ใส่มาในหมวดนั้นๆ ทันที
        weight: (stat.total / total) * 100,
        scorePercent: (stat.correct / stat.total) * 100
      };
    });

    navigate('/task-summary', { 
      state: { user, categorySummary, totalCorrect: questions.filter(qq => answers[qq.id] === qq.answer).length, totalQuestions: total } 
    });
  };

  const next = () => {
    if (answers[q.id] === undefined) { alert('เลือกคำตอบก่อนครับ'); return; }
    if (idx < total - 1) return setIdx(idx + 1);
    handleFinalSubmit();
  };

  // ✅ 4. แสดง Loading ระหว่างรอข้อสอบจาก Admin
  if (loading) return <div className="loading">กำลังดึงชุดข้อสอบจากระบบ...</div>;
  if (questions.length === 0) return <div className="error">ไม่พบชุดข้อสอบสำหรับช่างประเภทนี้</div>;

  return (
    <div className="dash-layout">
      {/* ส่วนแสดงผล UI เหมือนเดิม */}
      <main className="dash-main">
        <div className="quiz-page">
          <div className="progress"><div className="bar" style={{ width: `${percent}%` }} /></div>
          <div className="quiz-header">
            <h1>ข้อที่ {idx + 1} จาก {total}</h1>
            <span className="cat-badge">หมวด: {q.category}</span>
          </div>
          <p className="question">{q.text}</p>
          <div className="choices">
            {q.choices.map((c, i) => (
              <label key={i} className={`choice ${answers[q.id] === i ? 'selected' : ''}`} onClick={() => toggleChoice(i)}>
                <input type="radio" checked={answers[q.id] === i} readOnly />
                <span className="text">{c}</span>
              </label>
            ))}
          </div>
          <div className="nav-actions">
            <button className="btn-secondary" onClick={() => setIdx(idx - 1)} disabled={idx === 0}>ก่อนหน้า</button>
            <button className="btn-primary" onClick={next}>{idx === total - 1 ? 'ส่งคำตอบ' : 'ต่อไป'}</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillAssessmentQuiz;