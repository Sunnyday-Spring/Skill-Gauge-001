const User = require('../models/User');

// --- 1. Logic คำนวณ (คืนค่า Numeric 0-3 เพื่อใช้ใน MILP และการเลื่อนระดับ) ---
const getProficiencyLevel = (percentage) => {
    const p = parseFloat(percentage);
    if (isNaN(p)) return { numeric: 0, label: "ไม่ระบุ" };
    
    // ตัดเกรดตามเกณฑ์ Rubric 0-3
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

    // ตรวจสอบความถูกต้องของคะแนน (กันยิงค่าแปลกๆ มา)
    if (safeExamRaw < 0 || safeOnsiteRaw < 0) throw new Error("คะแนนไม่สามารถติดลบได้");
    
    // คำนวณเปอร์เซ็นต์
    const examPercent = (safeExamRaw / safeExamMax) * 100;
    const onsitePercent = (safeOnsiteRaw / safeOnsiteMax) * 100;

    // ถ่วงน้ำหนัก 70:30 ตามที่คุณต้องการ
    const totalScore = (examPercent * 0.70) + (onsitePercent * 0.30);
    const proficiency = getProficiencyLevel(totalScore);

    return {
        examPercent: examPercent.toFixed(2),
        onsitePercent: onsitePercent.toFixed(2),
        totalScore: totalScore,
        levelNumeric: proficiency.numeric,
        levelLabel: proficiency.label
    };
};

// --- 2. ฟังก์ชันหลักสำหรับรับค่าและบันทึก ---
exports.submitAssessment = async (req, res) => {
    try {
        const { workerId, onsiteScore, onsiteFullScore } = req.body;

        // Validation พื้นฐาน
        if (!workerId || onsiteScore === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'ข้อมูลไม่ครบถ้วน: กรุณาระบุ workerId และ onsiteScore' 
            });
        }

        // 1. ค้นหาช่าง
        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลช่างในระบบ' });
        }

        // 🛑 2. เงื่อนไขบังคับ: ต้องมีคะแนนสอบก่อน (เพื่อใช้คำนวณ 70%)
        // เช็คทั้งค่า null และ undefined เพื่อความปลอดภัยเวลาเทส
        if (worker.exam_score === null || worker.exam_score === undefined) {
            return res.status(403).json({ 
                success: false, 
                message: `ไม่สามารถประเมินได้: ช่างสาขา ${worker.technician_type || 'ทั่วไป'} ต้องทำข้อสอบทฤษฎีก่อน` 
            });
        }

        // 3. ดึงคะแนนสอบจาก DB (ที่บันทึกไว้จาก Quiz Controller)
        const examRaw = worker.exam_score;
        const examMax = worker.exam_full_score || 60; 

        // 4. คำนวณผลลัพธ์
        let result;
        try {
            result = calculateScoreLogic(
                examRaw, 
                examMax, 
                onsiteScore, 
                onsiteFullScore || 72 
            );
        } catch (logicError) {
            return res.status(400).json({ success: false, message: logicError.message });
        }

        // 5. ✅ บันทึกลง MySQL: เขียนทับค่าเดิมเสมอเพื่อรองรับการ "เลื่อนระดับ"
        await User.updateAssessmentResult(
            workerId,
            onsiteScore,
            result.totalScore.toFixed(2),
            result.levelNumeric, // ส่ง 0, 1, 2, 3 เข้าฟิลด์ level
            result.levelLabel     // ส่งข้อความ L1, L2... เข้าฟิลด์ skill_level
        );

        // 6. ส่งผลลัพธ์กลับไปให้ Foreman ดู
        res.status(200).json({
            success: true,
            message: `บันทึกระดับของช่างสาขา ${worker.technician_type || 'ทั่วไป'} เรียบร้อย`,
            data: {
                name: worker.full_name,
                totalScore: result.totalScore.toFixed(2),
                level: result.levelNumeric,
                label: result.levelLabel,
                calculation: {
                    theory: `${result.examPercent}% (weight 70%)`,
                    onsite: `${result.onsitePercent}% (weight 30%)`
                }
            }
        });

    } catch (error) {
        console.error("System Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};