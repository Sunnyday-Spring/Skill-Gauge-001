// backend/controllers/assessmentController.js

// --- 1. ส่วน Logic คำนวณ (เอามาจาก Prototype ของคุณ) ---

const getProficiencyLevel = (percentage) => {
    const p = parseFloat(percentage);
    if (isNaN(p)) return "ไม่ระบุ";
    if (p >= 80) return "Expert (ผู้เชี่ยวชาญ)";
    if (p >= 70) return "Proficient (ชำนาญการ)";
    if (p >= 50) return "Competent (ปฏิบัติงานได้)";
    return "Needs Improvement (ฝึกหัด)";
};

const calculateScoreLogic = (examRaw, examMax, onsiteRaw, onsiteMax, onsiteDetails = {}) => {
    // ป้องกันการหารด้วย 0
    const safeExamMax = examMax > 0 ? examMax : 1;
    const safeOnsiteMax = onsiteMax > 0 ? onsiteMax : 1;

    // คำนวณ %
    const examPercent = (examRaw / safeExamMax) * 100;
    const onsitePercent = (onsiteRaw / safeOnsiteMax) * 100;

    // ถ่วงน้ำหนัก (สอบ 70% / หน้างาน 30%)
    const examWeighted = examPercent * 0.70;
    const onsiteWeighted = onsitePercent * 0.30;
    const totalScore = examWeighted + onsiteWeighted;

    return {
        exam: {
            raw: examRaw,
            max: safeExamMax,
            percent: parseFloat(examPercent.toFixed(2)),
            weighted: parseFloat(examWeighted.toFixed(2))
        },
        onsite: {
            raw: onsiteRaw,
            max: safeOnsiteMax,
            percent: parseFloat(onsitePercent.toFixed(2)),
            weighted: parseFloat(onsiteWeighted.toFixed(2)),
            level: getProficiencyLevel(onsitePercent),
            details: onsiteDetails // ส่งรายละเอียดกลับไปด้วย
        },
        total: {
            score: parseFloat(totalScore.toFixed(2)),
            level: getProficiencyLevel(totalScore)
        }
    };
};

// --- 2. ส่วน API Endpoint (รับ Request -> ตอบ Response) ---

exports.calculateAssessment = async (req, res) => {
    try {
        // รับค่าจาก Frontend (Body JSON)
        const { examRaw, examMax, onsiteRaw, onsiteMax, onsiteDetails } = req.body;

        // ตรวจสอบข้อมูลเบื้องต้น
        if (examRaw === undefined || onsiteRaw === undefined) {
            return res.status(400).json({ error: 'กรุณาส่งคะแนน examRaw และ onsiteRaw มาให้ครบ' });
        }

        // เรียกใช้ Logic คำนวณ
        const result = calculateScoreLogic(
            Number(examRaw), 
            Number(examMax || 0), 
            Number(onsiteRaw), 
            Number(onsiteMax || 0),
            onsiteDetails || {}
        );

        // ส่งผลลัพธ์กลับเป็น JSON
        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error('Calculation Error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการคำนวณ' });
    }
};