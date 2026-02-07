const pool = require('../config/db');

// 1. ดึงคะแนนทฤษฎีที่ Weight มาแล้ว (70%) จากตารางผลประเมิน
exports.getTheoryScore = async (userId) => {
    try {
        const sql = 'SELECT theory_score FROM skill_assessment_results WHERE user_id = ? LIMIT 1';
        const [rows] = await pool.query(sql, [userId]);
        return rows[0]; 
    } catch (error) {
        throw new Error('Database Error in getTheoryScore: ' + error.message);
    }
};

// 2. อัปเดตผลการประเมินรวม (ทฤษฎี + ปฏิบัติ) และระดับ
exports.updateAssessmentResult = async (userId, theory, practical, total, levelLabel) => {
    try {
        const sql = `
            UPDATE skill_assessment_results 
            SET theory_score = ?, 
                practical_score = ?, 
                assessment_total = ?, 
                skill_level = ?, 
                updated_at = NOW()
            WHERE user_id = ?
        `;
        return await pool.query(sql, [theory, practical, total, levelLabel, userId]);
    } catch (error) {
        throw new Error('Database Error in updateAssessmentResult: ' + error.message);
    }
};

// 3. ฟังก์ชันสำหรับบันทึกคะแนนทฤษฎีครั้งแรก (หลังสอบเสร็จ)
exports.initTheoryScore = async (userId, weightedTheoryScore) => {
    const sql = `
        INSERT INTO skill_assessment_results (user_id, theory_score, skill_level)
        VALUES (?, ?, 'รอประเมินหน้างาน')
        ON DUPLICATE KEY UPDATE 
            theory_score = VALUES(theory_score),
            updated_at = NOW()
    `;
    return await pool.query(sql, [userId, weightedTheoryScore]);
};