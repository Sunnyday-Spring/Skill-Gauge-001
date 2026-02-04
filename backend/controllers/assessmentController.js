const User = require('../models/User');
const Assessment = require('../models/Assessment');

// --- 1. Logic คำนวณ (คืนค่า Numeric 0-3 เพื่อใช้ใน MILP และการเลื่อนระดับ) ---
const getProficiencyLevel = (percentage) => {
    const p = parseFloat(percentage);
    if (isNaN(p)) return { numeric: 0, label: "ไม่ระบุ" };
    
    if (p >= 80) return { numeric: 3, label: "L3: Expert (ผู้เชี่ยวชาญ)" };
    if (p >= 70) return { numeric: 2, label: "L2: Proficient (ชำนาญการ)" };
    if (p >= 50) return { numeric: 1, label: "L1: Competent (ปฏิบัติงานได้)" };
    return { numeric: 0, label: "L0: Needs Improvement (ฝึกหัด)" };
};

const calculateScoreLogic = (examRaw, examMax, onsiteRaw, onsiteMax) => {
    const safeExamRaw = Number(examRaw) || 0;
    const safeOnsiteRaw = Number(onsiteRaw) || 0;
    const safeExamMax = (Number(examMax) > 0) ? Number(examMax) : 60;
    const safeOnsiteMax = (Number(onsiteMax) > 0) ? Number(onsiteMax) : 72;

    if (safeExamRaw < 0 || safeOnsiteRaw < 0) throw new Error("คะแนนไม่สามารถติดลบได้");
    
    // คำนวณเปอร์เซ็นต์พื้นฐาน
    const examPercent = (safeExamRaw / safeExamMax) * 100;
    const onsitePercent = (safeOnsiteRaw / safeOnsiteMax) * 100;

    // คำนวณคะแนนตาม Weight (70:30) เพื่อเก็บลงตารางใหม่
    const theoryWeighted = (examPercent * 0.70);    // เต็ม 70
    const practicalWeighted = (onsitePercent * 0.30); // เต็ม 30
    const totalScore = theoryWeighted + practicalWeighted;

    const proficiency = getProficiencyLevel(totalScore);

    return {
        theoryWeighted: theoryWeighted.toFixed(2),
        practicalWeighted: practicalWeighted.toFixed(2),
        totalScore: totalScore.toFixed(2),
        levelNumeric: proficiency.numeric,
        levelLabel: proficiency.label
    };
};

exports.submitAssessment = async (req, res) => {
    try {
        const { workerId, onsiteScore, onsiteFullScore } = req.body;

        // 1. ดึงคะแนนทฤษฎีที่บันทึกไว้ก่อนหน้าจากตาราง skill_assessment_results
        // หรือดึงจาก dbuser (ตามที่ quizController บันทึกไว้)
        const worker = await User.findById(workerId); 
        if (!worker || worker.exam_score === null) {
            return res.status(403).json({ success: false, message: 'ช่างต้องทำข้อสอบทฤษฎีก่อน' });
        }

        // 2. คำนวณ Logic 70:30
        const examMax = worker.exam_full_score || 60;
        const practicalMax = onsiteFullScore || 72;

        const theoryWeighted = (worker.exam_score / examMax) * 70;
        const practicalWeighted = (onsiteScore / practicalMax) * 30;
        const totalScore = theoryWeighted + practicalWeighted;

        // 3. ตัดเกรด L0 - L3
        const result = getProficiencyLevel(totalScore);

        // 4. ✅ บันทึกลงตาราง skill_assessment_results
        await Assessment.updateAssessmentResult(
            workerId,
            theoryWeighted.toFixed(2),    // บันทึกคะแนนทฤษฎีที่ถ่วงน้ำหนักแล้ว
            practicalWeighted.toFixed(2), // บันทึกคะแนนปฏิบัติที่ถ่วงน้ำหนักแล้ว
            totalScore.toFixed(2),        // คะแนนรวม 100%
            result.label                  // "L3: Expert", "L2: Proficient", ฯลฯ
        );

        res.status(200).json({
            success: true,
            message: `ประเมินระดับช่าง ${worker.full_name} สำเร็จ`,
            data: {
                level: result.numeric,
                label: result.label,
                totalScore: totalScore.toFixed(2)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};