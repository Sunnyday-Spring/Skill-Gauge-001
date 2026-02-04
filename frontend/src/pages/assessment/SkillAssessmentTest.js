import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

const SkillAssessmentTest = () => {
  const navigate = useNavigate();
  
  // State หลัก
  const [step, setStep] = useState('intro'); 
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const questionsPerPage = 15; 

  // ดึงข้อมูล User จาก Session
  const user = useMemo(() => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : { roleName: 'ช่างปฏิบัติการ' };
  }, []);

  // ✅ 1. ดึงข้อสอบตามประเภทช่าง (Role) ตั้งแต่โหลดหน้าแรก
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const API = API_BASE_URL || 'http://localhost:5000';
        const res = await axios.get(`${API}/api/quiz/questions?role=${user.roleName}`);
        
        if (res.data && res.data.length > 0) {
          setQuestions(res.data);
        } else {
          setError("ไม่พบข้อมูลข้อสอบสำหรับประเภทช่างของคุณ");
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("ไม่สามารถดึงข้อมูลข้อสอบได้ กรุณาลองใหม่ภายหลัง");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [user.roleName]);

  // ✅ 2. คำนวณน้ำหนักคะแนนแบบ Dynamic ตามจำนวนข้อจริงในแต่ละหมวด
  const dynamicCriteria = useMemo(() => {
    if (questions.length === 0) return [];
    
    const stats = {};
    questions.forEach(q => {
      const cat = q.category || 'ทั่วไป';
      if (!stats[cat]) stats[cat] = 0;
      stats[cat]++;
    });

    return Object.keys(stats).map(name => ({
      topic: name,
      count: stats[name],
      weight: Math.round((stats[name] / questions.length) * 100) + '%'
    }));
  }, [questions]);

  const handleAnswer = (qId, choiceIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: choiceIndex }));
  };

  // ✅ แก้ไข Logic การกระโดดข้ามข้อ (ใส่รอยเล็บลำดับการคำนวณหน้า)
  const jumpToQuestion = (qId) => {
    const questionIndex = questions.findIndex(q => q.id === qId);
    const targetPage = Math.ceil((questionIndex + 1) / questionsPerPage);

    if (targetPage <= currentPage) {
        setCurrentPage(targetPage);
        scrollToQuestion(qId);
        return;
    }

    // เช็คหน้าปัจจุบันว่าทำครบหรือยังก่อนจะไปหน้าใหม่
    const indexOfLastQ = currentPage * questionsPerPage;
    const indexOfFirstQ = indexOfLastQ - questionsPerPage;
    const currentQIds = questions.slice(indexOfFirstQ, indexOfLastQ).map(q => q.id);
    const unanswered = currentQIds.filter(id => answers[id] === undefined);

    if (unanswered.length > 0) {
        alert(`ไม่สามารถข้ามได้!\nกรุณาทำข้อสอบในหน้านี้ให้ครบทุกข้อก่อน (${unanswered.length} ข้อที่เหลือ)`);
        return;
    }

    setCurrentPage(targetPage);
    scrollToQuestion(qId);
  };

  const scrollToQuestion = (qId) => {
    setTimeout(() => {
        const element = document.getElementById(`q-${qId}`);
        if(element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  const handleNextPage = () => {
    const indexOfLastQ = currentPage * questionsPerPage;
    const indexOfFirstQ = indexOfLastQ - questionsPerPage;
    const currentQIds = questions.slice(indexOfFirstQ, indexOfLastQ).map(q => q.id);
    const unanswered = currentQIds.filter(id => answers[id] === undefined);

    if (unanswered.length > 0) {
        alert(`กรุณาทำข้อสอบในหน้านี้ให้ครบก่อน (${unanswered.length} ข้อที่เหลือ)`);
        return;
    }
    setCurrentPage(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
        alert(`คุณยังทำข้อสอบไม่ครบ ${unansweredCount} ข้อ`);
        return;
    }
    if (!window.confirm("ยืนยันการส่งคำตอบ?")) return;

    try {
        const API = API_BASE_URL || 'http://localhost:5000';
        await axios.post(`${API}/api/quiz/submit-exam`, {
            workerId: user.id,
            answers: answers,
            questions: questions // ส่งไปเพื่อให้ backend คำนวณน้ำหนักตามจริง
        });
        setStep('review');
    } catch (err) {
        console.error("Submit error:", err);
        alert("เกิดข้อผิดพลาดในการส่งคำตอบ");
    }
  };

  // --- ส่วนแสดงผล Loading / Error ---
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>กำลังเตรียมชุดข้อสอบเฉพาะทาง...</div>;
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h3 style={{color: 'red'}}>ข้อผิดพลาด</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/worker')} style={{ padding: '10px 20px', cursor: 'pointer' }}>กลับหน้าหลัก</button>
    </div>
  );

  // --- ส่วนที่ 1: หน้า Intro (แสดงน้ำหนักคะแนน Dynamic) ---
  if (step === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6f9', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: 'white', maxWidth: '700px', width: '100%', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderTop: '5px solid #3498db' }}>
          <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '30px' }}>แบบประเมินทักษะ: {user.roleName}</h2>
          
          <div style={{ marginBottom: '25px', padding: '20px', background: '#f0f7ff', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1565c0', fontSize: '18px' }}>ข้อตกลงการทดสอบ</h3>
            <ul style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
              <li>จำนวนข้อสอบรวม: <strong>{questions.length} ข้อ</strong></li>
              <li>เวลาในการทำ: <strong>60 นาที</strong></li>
              <li>เกณฑ์ผ่าน: <strong>70%</strong></li>
            </ul>
          </div>

          <h3 style={{ fontSize: '18px', color: '#34495e', marginBottom: '15px' }}>โครงสร้างน้ำหนักคะแนน (Dynamic)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>หมวดหมู่</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>จำนวนข้อ</th>
                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>น้ำหนัก</th>
              </tr>
            </thead>
            <tbody>
              {dynamicCriteria.map((c, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{c.topic}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{c.count}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{c.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/worker')} style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>ยกเลิก</button>
            <button onClick={() => setStep('test')} style={{ flex: 2, padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>เริ่มทำข้อสอบ</button>
          </div>
        </div>
      </div>
    );
  }

  // --- ส่วนที่ 3: หน้า Review ---
  if (step === 'review') {
    return (
       <div style={{ minHeight: '100vh', background: '#f4f6f9', padding: '50px 20px', textAlign: 'center' }}>
          <div style={{ background: 'white', maxWidth: '600px', margin: '0 auto', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
             <h2 style={{ color: '#27ae60' }}>ส่งคำตอบเรียบร้อยแล้ว</h2>
             <p>ระบบได้บันทึกผลการสอบของคุณแล้ว</p>
             <button onClick={() => navigate('/worker')} style={{ marginTop: '20px', padding: '12px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>กลับหน้าหลัก</button>
          </div>
       </div>
    );
  }

  // --- ส่วนที่ 2: หน้าทำข้อสอบ ---
  const indexOfLastQ = currentPage * questionsPerPage;
  const indexOfFirstQ = indexOfLastQ - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQ, indexOfLastQ);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
       <header style={{ background: '#fff', height: '60px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
            <h3 style={{ margin: 0 }}>แบบทดสอบวัดทักษะ</h3>
            <span style={{ fontSize: '14px', background: '#e3f2fd', color: '#1565c0', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                หน้า {currentPage} / {totalPages}
            </span>
       </header>

       <div style={{ maxWidth: '1100px', margin: '20px auto', width: '100%', padding: '0 20px', display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                {currentQuestions.map((q, q_idx) => (
                    <div key={q.id} id={`q-${q.id}`} style={{ background: 'white', padding: '25px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ background: '#eee', color: '#555', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>หมวด: {q.category || 'ทั่วไป'}</span>
                        </div>
                        <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>{indexOfFirstQ + q_idx + 1}. {q.text}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {q.choices.map((choice, cIdx) => (
                                <label key={cIdx} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', border: answers[q.id] === cIdx ? '1px solid #3498db' : '1px solid #eee', borderRadius: '6px', cursor: 'pointer', background: answers[q.id] === cIdx ? '#f0f9ff' : 'white' }}>
                                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === cIdx} onChange={() => handleAnswer(q.id, cIdx)} style={{ marginRight: '12px' }} />
                                    <span>{choice}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', marginBottom: '60px' }}>
                    <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }} style={{ padding: '12px 25px', cursor: 'pointer' }}>ย้อนกลับ</button>
                    {currentPage < totalPages ? (
                         <button onClick={handleNextPage} style={{ padding: '12px 30px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ถัดไป &gt;</button>
                    ) : (
                         <button onClick={handleSubmit} style={{ padding: '12px 30px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>ส่งคำตอบ</button>
                    )}
                </div>
            </div>

            {/* Sidebar ทางลัดข้อสอบ */}
            <div style={{ width: '280px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>ทางลัดข้อสอบ</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCurrentPage = Math.ceil((idx + 1) / questionsPerPage) === currentPage;
                        return (
                            <button 
                                key={q.id} 
                                onClick={() => jumpToQuestion(q.id)} 
                                style={{ 
                                    width: '100%', aspectRatio: '1/1', border: isCurrentPage ? '2px solid #3498db' : (isAnswered ? '1px solid #2ecc71' : '1px solid #ddd'), 
                                    background: isAnswered ? '#eafaf1' : 'white', cursor: 'pointer', fontSize: '12px'
                                }}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>
            </div>
       </div>
    </div>
  );
};

export default SkillAssessmentTest;