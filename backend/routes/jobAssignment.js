const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// แก้ไขจุดที่ 1: ดึงเฉพาะ 'protect' มาใช้ตามโครงเดิมของคุณ
const { protect } = require('../middleware/authMiddleware'); 

/**
 * 1. ฟังก์ชันคำนวณน้ำหนักความยาก (wj, hj) (คงไว้ตามเดิมของคุณ)
 */
function calculateJobWeights(description = "") {
    let wj = 1.0; 
    let hj = 1.0; 
    const desc = (description || "").toLowerCase();
    
    if (desc.includes("ซับซ้อน")) wj += 0.5;
    if (desc.includes("ด่วน")) hj += 0.3;
    if (desc.includes("ความปลอดภัย")) wj += 0.4;
    if (desc.includes("งานละเอียด")) wj += 0.3;
    if (desc.includes("ประสบการณ์สูง")) hj += 0.5;

    return { wj, hj };
}

/**
 * 2. Logic การมอบหมายงาน (Solver) - (คงไว้ตามเดิมทั้ง 3 PATH)
 */
async function solveAssignments() {
    const [workers] = await pool.query(`
        SELECT u.id, u.full_name as name, u.skill_type, u.level, u.experience_years, u.teamwork_score,
               u.exam_score as quiz_score 
        FROM dbuser u 
        WHERE u.role = 'worker'
    `);

    const [jobs] = await pool.query(`
        SELECT id, job_name, job_type, description, required_level 
        FROM jobs 
        WHERE status = 'open'
    `);

    const finalAssignments = [];
    const assignedWorkerIds = new Set();
    const assignedJobIds = new Set();

    const noQuizWorkers = workers.filter(w => w.quiz_score === null || w.quiz_score === undefined);
    const pendingEvalWorkers = workers.filter(w => w.quiz_score !== null && (!w.level || w.level === 0));
    const qualifiedWorkers = workers.filter(w => w.level && w.level > 0);

    // --- PATH 1: สำหรับช่างที่ยังไม่สอบ ---
    for (const worker of noQuizWorkers) {
        const easyJob = jobs.find(j => 
            !assignedJobIds.has(j.id) && 
            (j.required_level <= 1 || (j.description || "").includes("งานทั่วไป"))
        );
        if (easyJob) {
            finalAssignments.push({
                worker_id: worker.id, worker_name: worker.name,
                job_id: easyJob.id, job_name: easyJob.job_name,
                method: "Basic Assignment (No Quiz)",
                note: "ช่างยังไม่ได้สอบ: มอบหมายงานที่ไม่ใช้ความชำนาญ"
            });
            assignedWorkerIds.add(worker.id);
            assignedJobIds.add(easyJob.id);
        }
    }

    // --- PATH 2: สำหรับช่างที่สอบแล้วแต่รอประเมินหน้างาน ---
    for (const worker of pendingEvalWorkers) {
        const matchJob = jobs.find(j => 
            !assignedJobIds.has(j.id) && 
            j.job_type === worker.skill_type
        );
        if (matchJob) {
            finalAssignments.push({
                worker_id: worker.id, worker_name: worker.name,
                job_id: matchJob.id, job_name: matchJob.job_name,
                method: "Evaluation Path (Pending Level)",
                note: "รอประเมินหน้างาน: มอบงานให้ Foreman ดูฝีมือ"
            });
            assignedWorkerIds.add(worker.id);
            assignedJobIds.add(matchJob.id);
        }
    }

    // --- PATH 3: สำหรับช่างที่มีระดับทักษะชัดเจน (MILP Optimal) ---
    const remainingJobs = jobs.filter(j => !assignedJobIds.has(j.id));
    remainingJobs.sort((a, b) => (b.required_level || 0) - (a.required_level || 0));

    for (const job of remainingJobs) {
        const { wj, hj } = calculateJobWeights(job.description);
        
        const candidates = qualifiedWorkers.filter(w => 
            !assignedWorkerIds.has(w.id) &&
            w.skill_type === job.job_type && 
            w.level >= (job.required_level || 1)
        );

        if (candidates.length === 0) continue;

        let bestScore = -1;
        let bestWorker = null;

        candidates.forEach(w => {
            const score = (w.level * wj) + (w.experience_years * hj) + (w.teamwork_score * 0.5);
            if (score > bestScore) {
                bestScore = score;
                bestWorker = w;
            }
        });

        if (bestWorker) {
            finalAssignments.push({
                worker_id: bestWorker.id, worker_name: bestWorker.name,
                job_id: job.id, job_name: job.job_name,
                method: "MIP Optimal Path",
                score: parseFloat(bestScore.toFixed(2)),
                note: "มอบหมายอัตโนมัติด้วยระบบ MILP (ความเหมาะสมสูงสุด)"
            });
            assignedWorkerIds.add(bestWorker.id);
            assignedJobIds.add(job.id);
        }
    }

    return finalAssignments;
}

/**
 * 3. ✅ ฟังก์ชันเพิ่มเติม: PM มอบหมายงานย่อยเอง (Manual Assignment)
 */
router.post('/assign-manual', protect, async (req, res) => {
    try {
        const { jobId, workerId } = req.body;

        // เช็คข้อมูลเบื้องต้น
        const [worker] = await pool.query('SELECT skill_type FROM dbuser WHERE id = ?', [workerId]);
        const [job] = await pool.query('SELECT job_type FROM jobs WHERE id = ?', [jobId]);

        if (!worker[0] || !job[0]) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลช่างหรือหน้างาน' });
        }

        // ตรวจสอบความถูกต้องของสาขาช่างก่อนมอบหมาย
        if (worker[0].skill_type !== job[0].job_type) {
            return res.status(400).json({ 
                success: false, 
                message: `สาขาช่าง (${worker[0].skill_type}) ไม่ตรงกับประเภทงาน (${job[0].job_type})` 
            });
        }

        await pool.query('UPDATE jobs SET status = "assigned", worker_id = ? WHERE id = ?', [workerId, jobId]);

        res.status(200).json({ success: true, message: 'PM มอบหมายงานให้ช่างเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * 4. ROUTER - จุดเชื่อม API สำหรับระบบอัตโนมัติ (คงไว้ตามเดิม)
 */
router.post('/run', protect, async (req, res) => {
    try {
        const assignments = await solveAssignments();
        res.status(200).json({
            success: true,
            message: "จัดสรรงานสำเร็จ",
            data: assignments
        });
    } catch (error) {
        console.error("Assignment Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;