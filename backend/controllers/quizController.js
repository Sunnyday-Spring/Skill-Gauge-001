const Quiz = require('../models/Quiz');
const User = require('../models/User'); 

// 1. ดึงข้อสอบ (GET)
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

// 2. ส่งคำตอบและประเมินผล (POST)
exports.submitExam = async (req, res) => {
    try {
        const { answers, workerId, score, fullScore } = req.body; 

        if (!workerId) {
            return res.status(400).json({ error: 'กรุณาระบุ workerId' });
        }

        // --- 🟢 โหมดทดสอบ (Manual Score): ถ้าส่ง score มาตรงๆ ให้บันทึกเลย ---
        if (score !== undefined) {
            const finalTotal = fullScore || 60;
            await User.updateExamScore(workerId, score, finalTotal);
            return res.json({
                success: true,
                message: 'บันทึกคะแนนสอบเรียบร้อยแล้ว (Manual Mode)',
                score: score,
                total: finalTotal
            });
        }

        // --- 🔴 โหมดปกติ: ตรวจคำตอบอัตโนมัติจากก้อน answers ---
        if (!answers || Object.keys(answers).length === 0) {
            return res.status(400).json({ error: 'No answers provided (กรุณาระบุคะแนน score หรือชุดคำตอบ answers)' });
        }

        const questionIds = Object.keys(answers);
        const correctAnswersDB = await Quiz.getCorrectAnswers(questionIds);
        const answerMap = {};
        correctAnswersDB.forEach(row => { answerMap[row.id] = row.answer; });

        let autoScore = 0;
        const totalMax = 60; 

        for (const [qid, userAns] of Object.entries(answers)) {
            if (answerMap[qid] && answerMap[qid].toUpperCase() === String(userAns).toUpperCase()) {
                autoScore++;
            }
        }

        await User.updateExamScore(workerId, autoScore, totalMax);

        res.json({
            success: true,
            score: autoScore,
            total: totalMax,
            percentage: parseFloat(((autoScore / totalMax) * 100).toFixed(2))
        });

    } catch (err) {
        console.error('Submit Exam Error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
};