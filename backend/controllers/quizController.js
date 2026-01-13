const Quiz = require('../models/Quiz');
const User = require('../models/User'); 

// ดึงข้อสอบ
exports.getExamPaper = async (req, res) => {
    try {
        const [level1, level2, level3] = await Promise.all([
            Quiz.getRandomQuestionsByLevel(1, 24), 
            Quiz.getRandomQuestionsByLevel(2, 24), 
            Quiz.getRandomQuestionsByLevel(3, 12)  
        ]);

        const allQuestions = [...level1, ...level2, ...level3];
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

        res.json({
            total: shuffledQuestions.length,
            questions: shuffledQuestions
        });

    } catch (err) {
        console.error('Get Exam Error:', err);
        res.status(500).json({ error: 'Server error while fetching questions' });
    }
};

// ส่งคำตอบและประเมินผล
exports.submitExam = async (req, res) => {
    // รับ workerId มาด้วย เพื่อระบุว่าจะบันทึกคะแนนให้ใคร
    const { answers, workerId } = req.body; 
  
    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ error: 'No answers provided' });
    }

    try {
        const questionIds = Object.keys(answers);
        
        // ดึงเฉลยจาก Database
        const correctAnswersDB = await Quiz.getCorrectAnswers(questionIds);

        // แปลงเฉลยเป็น Map { 101: 'A', 102: 'C' }
        const answerMap = {};
        correctAnswersDB.forEach(row => {
            answerMap[row.id] = row.answer;
        });

        let score = 0;
        const total = 60; 

        // ตรวจคำตอบ
        for (const [qid, userAns] of Object.entries(answers)) {
            if (answerMap[qid] && answerMap[qid].toUpperCase() === String(userAns).toUpperCase()) {
                score++;
            }
        }

        const percent = (score / total) * 100;

        // ✅ แก้ไขตรงนี้: ใช้ฟังก์ชัน updateExamScore ของ MySQL (User.js)
        if (workerId) {
            await User.updateExamScore(workerId, score, total);
        }

        res.json({
            success: true,
            score: score,
            total: total,
            percentage: parseFloat(percent.toFixed(2)), 
            description: `คุณได้คะแนน ${score} เต็ม ${total} (${percent.toFixed(2)}%)`
        });

    } catch (err) {
        console.error('Submit Exam Error:', err);
        res.status(500).json({ error: 'Server error while grading' });
    }
};