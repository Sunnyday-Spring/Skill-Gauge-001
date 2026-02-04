const pool = require('../config/db');

// --- ฟังก์ชันเดิมที่มีอยู่แล้ว ---
exports.updateAssessmentResult = async (userId, theory, practical, total, level) => {
  const sql = `
    INSERT INTO skill_assessment_results 
    (user_id, theory_score, practical_score, assessment_total, skill_level)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      theory_score = VALUES(theory_score),
      practical_score = VALUES(practical_score),
      assessment_total = VALUES(assessment_total),
      skill_level = VALUES(skill_level)
  `;
  return await pool.query(sql, [userId, theory, practical, total, level]);
};

// --- 🟢 ส่วนที่ต้องเพิ่มใหม่ (เพื่อให้ดึงคะแนนมาคำนวณได้) ---
exports.findResultByUserId = async (userId) => {
  const sql = 'SELECT * FROM skill_assessment_results WHERE user_id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [userId]);
  return rows[0];
};