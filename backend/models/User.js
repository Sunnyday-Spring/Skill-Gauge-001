const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// --- 1. ส่วนการค้นหาข้อมูล ---

exports.findById = async (id) => {
  const sql = 'SELECT * FROM dbuser WHERE id = ? LIMIT 1';
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};

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

// --- 2. ส่วนการจัดการผู้ใช้งาน (Auth & Create) ---

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
      email, password, level
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
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

// --- 3. ส่วนการจัดการระดับ (Level Management) ---

/**
 * อัปเดตระดับทักษะของช่าง (ใช้เรียกหลังประเมินผ่าน)
 */
exports.updateLevel = async (id, level) => {
  const sql = 'UPDATE dbuser SET level = ? WHERE id = ?';
  await pool.query(sql, [level, id]);
};

/**
 * หมายเหตุ: คะแนนสอบทฤษฎีและปฏิบัติทั้งหมดถูกย้ายไปจัดการใน 
 * models/Assessment.js และตาราง skill_assessment_results แล้ว
 */