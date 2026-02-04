const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// --- ส่วนการค้นหาข้อมูล (Read) ---

exports.findByEmail = async (email) => {
  const sql = 'SELECT * FROM dbuser WHERE email = ? LIMIT 1';
  const [rows] = await pool.query(sql, [email]);
  return rows[0];
};

exports.findByCitizenId = async (citizenId) => {
  const sql = 'SELECT id FROM dbuser WHERE citizen_id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [citizenId]);
  return rows[0];
};

exports.findById = async (id) => {
  const sql = 'SELECT * FROM dbuser WHERE id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

// --- ส่วนการสร้างและตรวจสอบรหัสผ่าน (Auth) ---

exports.create = async (userData) => {
  const {
    citizen_id, full_name, birth_date, age,
    address_id_card, sub_district, district, province, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, technician_type, experience_years,
    email, password
  } = userData;

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

  const [result] = await pool.query(sql, [
    citizen_id, full_name, birth_date, age,
    address_id_card, sub_district, district, province, zip_code,
    address_current, card_issue_date, card_expiry_date,
    role, technician_type || 'ไม่มี', experience_years || 0,
    email, hash
  ]);

  return result.insertId;
};

exports.comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash || '');
};

// --- ส่วนการสอบทฤษฎี (Quiz Score) ---

exports.updateExamScore = async (id, score, fullScore) => {
  const sql = `
    UPDATE dbuser 
    SET exam_score = ?, 
        exam_full_score = ?, 
        exam_date = NOW() 
    WHERE id = ?
  `;
  // ใส่ Number() เพื่อกันเหนียวว่าค่าที่ส่งมาจะเป็นตัวเลขแน่ๆ
  await pool.query(sql, [Number(score), Number(fullScore || 60), id]);
};

/** * หมายเหตุ: ฟังก์ชัน updateAssessmentResult ถูกย้ายไปที่ models/Assessment.js แล้ว 
 * เพื่อแยกหน้าที่การทำงานให้เป็นสัดส่วน (Separation of Concerns)
 */