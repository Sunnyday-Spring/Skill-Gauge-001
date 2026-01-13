const express = require('express');
const router = express.Router();
// เรียกใช้ Controller ที่เราทำไว้
const { getExamPaper, submitExam } = require('../controllers/quizController');

// 1. ดึงชุดข้อสอบ (GET)
// Frontend เรียกใช้ที่: /api/quiz/questions
// (ตรงกับไฟล์ SkillAssessmentTest.js)
router.get('/questions', getExamPaper);

// 2. ส่งคำตอบเพื่อตรวจและบันทึกคะแนน (POST)
// Frontend เรียกใช้ที่: /api/quiz/submit-exam
// (ตรงกับไฟล์ SkillAssessmentTest.js)
router.post('/submit-exam', submitExam);

module.exports = router;