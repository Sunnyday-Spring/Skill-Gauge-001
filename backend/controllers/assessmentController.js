const User = require('../models/User');
const Assessment = require('../models/Assessment');
const pool = require('../config/db'); // ใช้สำหรับ Update Level โดยตรง

// --- 1. Logic ตรวจสอบการผ่านเกณฑ์ 70% เพื่อไต่ระดับ ---
const checkLevelPassStatus = (totalScore, targetLevel) => {
    const score = parseFloat(totalScore);
    const level = parseInt(targetLevel);
    const passingCriteria = 70; // เกณฑ์ผ่านคงที่ที่ 70% ทุกระดับ

    if (score >= passingCriteria) {
        return { 
            isPass: true, 
            numeric: level, 
            label: `L${level}: ผ่านเกณฑ์ (Expertise Level ${level})` 
        };
    } else {
        // ถ้าไม่ผ่าน ให้คงระดับเดิมไว้ (numeric: level - 1) 
        // แต่ถ้าเป็นระดับ 1 แล้วไม่ผ่าน ก็จะอยู่ที่ระดับ 0
        return { 
            isPass: false, 
            numeric: Math.max(0, level - 1), 
            label: `L${level}: ไม่ผ่านเกณฑ์ (ได้ ${score.toFixed(2)}% ต้องได้อย่างน้อย ${passingCriteria}%)` 
        };
    }
};

// --- 2. ฟังก์ชันหลักในการบันทึกผลการประเมิน ---
exports.submitAssessment = async (req, res) => {
    try {
        // targetLevel คือระดับที่เขามาสอบเพื่อเลื่อนขั้น (เช่น กำลังสอบเพื่อเป็น L2)
        const { workerId, onsiteScore, onsiteFullScore, targetLevel = 1 } = req.body;

        if (!workerId || onsiteScore === undefined) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุ workerId และคะแนนหน้างาน' });
        }

        // 1. ดึงข้อมูลช่าง และดึงคะแนนทฤษฎี (70%) จากตาราง skill_assessment_results
        const [worker, theoryData] = await Promise.all([
            User.findById(workerId),
            Assessment.getTheoryScore(workerId)
        ]);

        if (!worker) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลช่างในระบบ' });
        }

        if (!theoryData || theoryData.theory_score === null) {
            return res.status(403).json({ 
                success: false, 
                message: `ช่าง ${worker.full_name} ยังไม่มีข้อมูลคะแนนสอบทฤษฎีในระบบประเมิน` 
            });
        }

        // 2. คำนวณคะแนนปฏิบัติ (30%)
        const safeOnsiteRaw = Number(onsiteScore) || 0;
        const safeOnsiteMax = (Number(onsiteFullScore) > 0) ? Number(onsiteFullScore) : 72;
        const practicalWeighted = (safeOnsiteRaw / safeOnsiteMax) * 30;

        // ดึงคะแนนทฤษฎีที่ถ่วงน้ำหนัก 70% มาแล้วจากฐานข้อมูล
        const theoryWeighted = parseFloat(theoryData.theory_score);
        const totalScore = theoryWeighted + practicalWeighted;

        // 3. ตรวจสอบสถานะการผ่าน (ไต่ระดับ)
        const resultStatus = checkLevelPassStatus(totalScore, targetLevel);

        // 4. บันทึกผลลัพธ์ลงตาราง skill_assessment_results
        // บันทึกทั้งคะแนนทฤษฎีเดิม คะแนนปฏิบัติใหม่ และระดับที่คำนวณได้
        await Assessment.updateAssessmentResult(
            workerId,
            theoryWeighted,
            parseFloat(practicalWeighted.toFixed(2)),
            parseFloat(totalScore.toFixed(2)),
            resultStatus.label
        );

        // 5. หากสอบผ่าน (isPass: true) ให้ทำการ Update ระดับล่าสุดลงในตาราง dbuser
        // เพื่อให้ระบบมอบหมายงาน (Job Assignment) ดึงไปใช้งานได้ทันที
        if (resultStatus.isPass) {
            const updateLevelSql = 'UPDATE dbuser SET level = ? WHERE id = ?';
            await pool.query(updateLevelSql, [resultStatus.numeric, workerId]);
        }

        res.status(200).json({
            success: true,
            message: resultStatus.isPass 
                ? `ยินดีด้วย! ${worker.full_name} ผ่านการประเมินระดับ ${targetLevel}`
                : `ผลการประเมิน ${worker.full_name} ไม่ผ่านเกณฑ์ระดับ ${targetLevel}`,
            data: {
                workerId: workerId,
                name: worker.full_name,
                isPass: resultStatus.isPass,
                totalScore: parseFloat(totalScore.toFixed(2)),
                finalLevel: resultStatus.numeric,
                label: resultStatus.label,
                breakdown: {
                    theory70: theoryWeighted,
                    practical30: parseFloat(practicalWeighted.toFixed(2))
                }
            }
        });

    } catch (error) {
        console.error("Submit Assessment Error:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error: ' + error.message });
    }
};