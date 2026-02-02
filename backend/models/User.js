const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ค้นหา User ด้วย Email (ใช้ตอน Login)
exports.findByEmail = async (email) => {
  const sql = 'SELECT * FROM dbuser WHERE email = ? LIMIT 1';
  const [rows] = await pool.query(sql, [email]);
  return rows[0];
};

// ค้นหา User ด้วย Citizen ID (เช็คซ้ำ)
exports.findByCitizenId = async (citizenId) => {
  const sql = 'SELECT id FROM dbuser WHERE citizen_id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [citizenId]);
  return rows[0];
};

// ค้นหา User ด้วย ID (จำเป็นสำหรับ Controller)
exports.findById = async (id) => {
  const sql = 'SELECT * FROM dbuser WHERE id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

// สร้าง User ใหม่ (รับค่าก้อนใหญ่จากหน้าลงทะเบียน)
exports.create = async (userData) => {
  const {
    citizen_id, full_name, birth_date, age,
    address_id_card, sub_district, district, province, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, technician_type, experience_years,
    email, password
  } = userData;

  // Hash Password
  const hash = bcrypt.hashSync(password, 12);

  const sql = `
    INSERT INTO dbuser (
      citizen_id, full_name, birth_date, age,
      address_id_card, sub_district, district, province, zip_code,
      address_current, card_issue_date, card_expiry_date,
      role, technician_type, experience_years,
      email, password
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // ใส่ค่า Default ให้ technician_type กับ experience_years ถ้าไม่ได้ส่งมา
  const finalTechType = technician_type || 'ไม่มี';
  const finalExpYears = experience_years || 0;

  const [result] = await pool.query(sql, [
    citizen_id, full_name, birth_date, age,
    address_id_card, sub_district, district, province, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, finalTechType, finalExpYears,
    email, hash
  ]);

  return result.insertId;
};

// เปรียบเทียบรหัสผ่าน
exports.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash || '');
};

// 2. บันทึกคะแนนสอบ (เรียกใช้โดย quizController)
exports.updateExamScore = async (id, score, fullScore) => {
  const sql = `
    UPDATE dbuser 
    SET exam_score = ?, exam_full_score = ?, exam_date = NOW() 
    WHERE id = ?
  `;
  await pool.query(sql, [score, fullScore, id]);
};

// 3. ✅ ปรับปรุง: บันทึกผลประเมินและระดับทักษะ (รองรับเลข 0, 1, 2, 3)
// เพิ่มพารามิเตอร์ levelNumeric เพื่อใช้ในระบบจัดสรรงาน MILP
exports.updateAssessmentResult = async (id, onsiteScore, totalScore, levelNumeric, skillLevelLabel) => {
  const sql = `
    UPDATE dbuser 
    SET onsite_score = ?, 
        total_score = ?, 
        level = ?,           -- บันทึกเป็นตัวเลข (0, 1, 2, 3) เพื่อใช้คำนวณ MILP
        skill_level = ?,     -- บันทึกเป็นข้อความ (Expert, Proficient, etc.) ไว้โชว์หน้าเว็บ
        status = 'Assessed', 
        assessment_date = NOW()
    WHERE id = ?
  `;
  
  await pool.query(sql, [onsiteScore, totalScore, levelNumeric, skillLevelLabel, id]);
};