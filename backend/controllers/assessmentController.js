const User = require('../models/User');

// --- 1. Logic คำนวณ (คงไว้ตามโครงเดิมของคุณ) ---
const getProficiencyLevel = (percentage) => {
    const p = parseFloat(percentage);
    if (isNaN(p)) return { numeric: 0, label: "ไม่ระบุ" };
    
    // ปรับให้คืนค่าทั้ง ตัวเลข (0-3) และ ข้อความ ตามที่คุณต้องการ
    if (p >= 80) return { numeric: 3, label: "L3: Expert (ผู้เชี่ยวชาญ)" };
    if (p >= 70) return { numeric: 2, label: "L2: Proficient (ชำนาญการ)" };
    if (p >= 50) return { numeric: 1, label: "L1: Competent (ปฏิบัติงานได้)" };
    return { numeric: 0, label: "L0: Needs Improvement (ฝึกหัด)" };
};

const calculateScoreLogic = (examRaw, examMax, onsiteRaw, onsiteMax) => {
    const safeExamRaw = Number(examRaw) || 0;
    const safeOnsiteRaw = Number(onsiteRaw) || 0;
    const safeExamMax = (examMax && Number(examMax) > 0) ? Number(examMax) : 60;
    const safeOnsiteMax = (onsiteMax && Number(onsiteMax) > 0) ? Number(onsiteMax) : 72; // ปรับตาม 18 หัวข้อ x 4 คะแนน

    if (safeExamRaw < 0 || safeOnsiteRaw < 0) throw new Error("คะแนนไม่สามารถติดลบได้");
    if (safeExamRaw > safeExamMax) throw new Error(`คะแนนสอบ (${safeExamRaw}) สูงกว่าคะแนนเต็ม (${safeExamMax})`);
    if (safeOnsiteRaw > safeOnsiteMax) throw new Error(`คะแนนหน้างาน (${safeOnsiteRaw}) สูงกว่าคะแนนเต็ม (${safeOnsiteMax})`);

    const examPercent = (safeExamRaw / safeExamMax) * 100;
    const onsitePercent = (safeOnsiteRaw / safeOnsiteMax) * 100;

    const examWeighted = examPercent * 0.70;
    const onsiteWeighted = onsitePercent * 0.30;
    const totalScore = examWeighted + onsiteWeighted;

    const proficiency = getProficiencyLevel(totalScore);

    return {
        examPercent,
        onsitePercent,
        totalScore,
        levelNumeric: proficiency.numeric,
        levelLabel: proficiency.label
    };
};

// --- 2. ฟังก์ชันหลักสำหรับรับค่าและบันทึก (Controller) ---
exports.submitAssessment = async (req, res) => {
    try {
        const { workerId, onsiteScore, onsiteFullScore } = req.body;

        if (!workerId || onsiteScore === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'ข้อมูลไม่ครบถ้วน: กรุณาระบุ Worker ID และคะแนนหน้างาน' 
            });
        }

        // 1. ค้นหาช่างใน Database
        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลช่างในระบบ' });
        }

        // 🛑 2. เพิ่มเงื่อนไขใหม่: ต้องมีคะแนนสอบก่อนถึงจะประเมินได้
        if (worker.exam_score === null || worker.exam_score === undefined) {
            return res.status(403).json({ 
                success: false, 
                message: 'ไม่สามารถประเมินได้: ช่างต้องทำข้อสอบประจำสาขาให้เสร็จสิ้นก่อน' 
            });
        }

        // 3. ดึงคะแนนสอบจากข้อมูลช่าง
        const examRaw = worker.exam_score || 0;
        const examMax = worker.exam_full_score || 60; 

        // 4. เรียกใช้ Logic คำนวณ (ใช้ตัวแปรเดิมที่คุณเขียน)
        let result;
        try {
            result = calculateScoreLogic(
                examRaw, 
                examMax, 
                Number(onsiteScore), 
                Number(onsiteFullScore || 72) // 18 หัวข้อ หัวข้อละ 4 คะแนน
            );
        } catch (logicError) {
            return res.status(400).json({ 
                success: false, 
                message: logicError.message 
            });
        }

        // 5. ✅ บันทึกลง MySQL: ส่งค่า level เป็นตัวเลข (0-3) เพื่อใช้ใน MILP
        await User.updateAssessmentResult(
            workerId,
            onsiteScore,
            result.totalScore.toFixed(2),
            result.levelNumeric, // ส่งเลข 0, 1, 2, 3
            result.levelLabel     // ส่งข้อความ L1, L2...
        );

        // 6. ส่งผลสำเร็จกลับไป
        res.status(200).json({
            success: true,
            message: 'ประมวลผลและบันทึกเรียบร้อย',
            data: {
                name: worker.full_name || worker.name,
                examScore: examRaw,
                onsiteScore: onsiteScore,
                totalScore: result.totalScore.toFixed(2),
                level: result.levelNumeric,
                label: result.levelLabel
            }
        });

    } catch (error) {
        console.error("System Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดภายในระบบ: ' + error.message 
        });
    }
};