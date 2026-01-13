// backend/routes/assessment.js
const express = require('express');
const router = express.Router();
const { submitAssessment } = require('../controllers/assessmentController');

// POST http://localhost:4000/api/assessment/calculate
router.post('/submit', submitAssessment);

module.exports = router;