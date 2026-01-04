// backend/routes/assessment.js
const express = require('express');
const router = express.Router();
const { calculateAssessment } = require('../controllers/assessmentController');

// POST http://localhost:4000/api/assessment/calculate
router.post('/calculate', calculateAssessment);

module.exports = router;