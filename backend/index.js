require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');

app.use(express.json());
app.use(cors());

const pool = require('./config/db');

// --- Routes เดิมที่มีอยู่ ---
app.use('/api', require('./routes/auth'));
app.use('/api/manageusers', require('./routes/manageusers'));
app.use('/api/job-assignments', require('./routes/jobAssignment'));

// --- ส่วนของ Rubric Score System (ข้อสอบ + ประเมิน) ---
// 1. เส้นทางสำหรับทำข้อสอบ (ดึงโจทย์, ส่งคำตอบ)
app.use('/api/quiz', require('./routes/quiz')); 

// 2. เส้นทางสำหรับประเมินหน้างาน (Foreman ส่งคะแนน) -> **อันนี้คือที่เพิ่มใหม่ครับ**
app.use('/api/assessment', require('./routes/assessment'));


function uuidHex() {
  return crypto.randomBytes(16).toString('hex');
}

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

app.get('/', (req, res) => res.send('API is running'));