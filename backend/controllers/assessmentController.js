const User = require('../models/User');

// --- 1. Logic คำนวณ (เหมือนเดิม) ---
const getProficiencyLevel = (percentage) => {
    const p = parseFloat(percentage);
    if (isNaN(p)) return "ไม่ระบุ";
    if (p >= 80) return "Expert (ผู้เชี่ยวชาญ)";
    if (p >= 70) return "Proficient (ชำนาญการ)";
    if (p >= 50) return "Competent (ปฏิบัติงานได้)";
    return "Needs Improvement (ฝึกหัด)";
};

const calculateScoreLogic = (examRaw, examMax, onsiteRaw, onsiteMax) => {
    const safeExamRaw = Number(examRaw) || 0;
    const safeOnsiteRaw = Number(onsiteRaw) || 0;
    const safeExamMax = (examMax && Number(examMax) > 0) ? Number(examMax) : 60;
    const safeOnsiteMax = (onsiteMax && Number(onsiteMax) > 0) ? Number(onsiteMax) : 100;

    if (safeExamRaw < 0 || safeOnsiteRaw < 0) throw new Error("คะแนนไม่สามารถติดลบได้");
    if (safeExamRaw > safeExamMax) throw new Error(`คะแนนสอบ (${safeExamRaw}) สูงกว่าคะแนนเต็ม (${safeExamMax})`);
    if (safeOnsiteRaw > safeOnsiteMax) throw new Error(`คะแนนหน้างาน (${safeOnsiteRaw}) สูงกว่าคะแนนเต็ม (${safeOnsiteMax})`);

    const examPercent = (safeExamRaw / safeExamMax) * 100;
    const onsitePercent = (safeOnsiteRaw / safeOnsiteMax) * 100;

    const examWeighted = examPercent * 0.70;
    const onsiteWeighted = onsitePercent * 0.30;
    const totalScore = examWeighted + onsiteWeighted;

    return {
        examPercent,
        onsitePercent,
        totalScore,
        level: getProficiencyLevel(totalScore)
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

        // 2. ดึงคะแนนสอบจากข้อมูลช่าง (MySQL คืนค่าเป็น exam_score)
        const examRaw = worker.exam_score || 0;
        const examMax = worker.exam_full_score || 60; 

        // 3. เรียกใช้ Logic คำนวณ
        let result;
        try {
            result = calculateScoreLogic(
                examRaw, 
                examMax, 
                Number(onsiteScore), 
                Number(onsiteFullScore || 72)
            );
        } catch (logicError) {
            return res.status(400).json({ 
                success: false, 
                message: logicError.message 
            });
        }

        // 4. ✅ แก้ไขตรงนี้: ใช้ฟังก์ชัน MySQL ในการบันทึก
        await User.updateAssessmentResult(
            workerId,
            onsiteScore,
            result.totalScore,
            result.level,
            {} // details (ถ้ามี)
        );

        // 5. ส่งผลสำเร็จกลับไป
        res.status(200).json({
            success: true,
            message: 'ประมวลผลและบันทึกเรียบร้อย',
            data: {
                name: worker.full_name || worker.name,
                examScore: examRaw,
                onsiteScore: onsiteScore,
                totalScore: result.totalScore.toFixed(2),
                level: result.level
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