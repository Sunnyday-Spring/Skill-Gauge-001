const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

/**
 * 1. ฟังก์ชันคำนวณน้ำหนักความยากของงาน (wj, hj)
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
 * 2. Logic การมอบหมายงานหลัก (Solver)
 */
async function solveAssignments() {
    // ✅ ดึงข้อมูลช่าง โดย JOIN กับตาราง skill_assessment_results เพื่อเอาคะแนนประเมินล่าสุด
    const [workers] = await pool.query(`
        SELECT 
            u.id, 
            u.full_name as name, 
            u.skill_type, 
            u.level, 
            u.experience_years, 
            u.teamwork_score,
            u.exam_score as quiz_score,
            sar.performance_score -- คะแนนจากตารางประเมินทักษะ
        FROM dbuser u
        LEFT JOIN (
            -- ดึงผลประเมินล่าสุดของช่างแต่ละคน
            SELECT worker_id, performance_score
            FROM skill_assessment_results
            WHERE (worker_id, assessment_date) IN (
                SELECT worker_id, MAX(assessment_date)
                FROM skill_assessment_results
                GROUP BY worker_id
            )
        ) sar ON u.id = sar.worker_id
        WHERE u.role = 'worker'
    `);

    // ดึงงานที่ยังว่างอยู่
    const [jobs] = await pool.query(`
        SELECT id, job_name, job_type, description, required_level 
        FROM jobs 
        WHERE status = 'open'
    `);

    const finalAssignments = [];
    const assignedWorkerIds = new Set();
    const assignedJobIds = new Set();

    // แยกกลุ่มช่างตามสถานะ
    const noQuizWorkers = workers.filter(w => w.quiz_score === null || w.quiz_score === undefined);
    const pendingEvalWorkers = workers.filter(w => w.quiz_score !== null && (!w.performance_score || w.level === 0));
    const qualifiedWorkers = workers.filter(w => w.level && w.level > 0 && w.performance_score !== null);

    // --- PATH 1: ช่างที่ยังไม่สอบ (มอบงานง่าย) ---
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
                note: "มอบหมายงานทั่วไปเนื่องจากยังไม่มีผลสอบ"
            });
            assignedWorkerIds.add(worker.id);
            assignedJobIds.add(easyJob.id);
        }
    }

    // --- PATH 2: สอบแล้วแต่รอประเมินหน้างาน (มอบงานเพื่อเก็บคะแนน) ---
    for (const worker of pendingEvalWorkers) {
        const matchJob = jobs.find(j => 
            !assignedJobIds.has(j.id) && 
            j.job_type === worker.skill_type
        );
        if (matchJob) {
            finalAssignments.push({
                worker_id: worker.id, worker_name: worker.name,
                job_id: matchJob.id, job_name: matchJob.job_name,
                method: "Evaluation Path (Field Test)",
                note: "มอบหมายงานเพื่อให้ Foreman ประเมินทักษะหน้างาน"
            });
            assignedWorkerIds.add(worker.id);
            assignedJobIds.add(matchJob.id);
        }
    }

    // --- PATH 3: ช่างที่มีระดับทักษะและผลประเมินแล้ว (MILP Optimal) ---
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
            // ✅ สูตรคำนวณใหม่: รวมคะแนน performance_score จาก DB เข้าไปด้วย
            const score = (w.level * wj) + (w.performance_score * 0.4) + (w.experience_years * hj) + (w.teamwork_score * 0.3);
            if (score > bestScore) {
                bestScore = score;
                bestWorker = w;
            }
        });

        if (bestWorker) {
            finalAssignments.push({
                worker_id: bestWorker.id, worker_name: bestWorker.name,
                job_id: job.id, job_name: job.job_name,
                method: "MIP Optimal (Performance Based)",
                score: parseFloat(bestScore.toFixed(2)),
                note: "จัดสรรงานอัตโนมัติโดยใช้ผลประเมินทักษะหน้างานล่าสุด"
            });
            assignedWorkerIds.add(bestWorker.id);
            assignedJobIds.add(job.id);
        }
    }

    return finalAssignments;
}

/**
 * 3. API Route สำหรับรันระบบจัดสรรงาน
 */
router.post('/run', protect, async (req, res) => {
    try {
        const assignments = await solveAssignments();
        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;