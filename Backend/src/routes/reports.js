const express        = require('express');
const router         = express.Router();
const pool           = require('../config/db');
const ergastService  = require('../services/ergastService');
const groqService    = require('../services/groqService');
const pdfService     = require('../services/pdfService');

router.post('/generate-report', async (req, res, next) => {
  try {
    const { season, round, regenerate = false } = req.body;

    if (!season || !round) {
      return res.status(400).json({
        success: false,
        message: 'season and round are required in the request body.',
      });
    }

    const seasonNum = parseInt(season);
    const roundNum  = parseInt(round);

    if (isNaN(seasonNum) || isNaN(roundNum)) {
      return res.status(400).json({
        success: false,
        message: 'season and round must be valid numbers.',
      });
    }

    // 1. Check if report already exists
    if (!regenerate) {
      const [existing] = await pool.execute(
        'SELECT * FROM reports WHERE season = ? AND round = ?',
        [seasonNum, roundNum]
      );

      if (existing.length > 0) {
        console.log(`[Reports] Returning cached report for ${seasonNum}/${roundNum}`);
        return res.json({
          success: true,
          data:    existing[0],
          cached:  true,
        });
      }
    }

    // 2. Fetch race data from Ergast/cache
    const raceData = await ergastService.getRaceData(seasonNum, roundNum);

    // 3. Generate report using Groq AI
    const { content, modelUsed } = await groqService.generateReport(raceData);

    // 4. Save to MySQL (INSERT or UPDATE if regenerating)
    await pool.execute(
      `INSERT INTO reports (season, round, race_name, content, model_used)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         content    = VALUES(content),
         model_used = VALUES(model_used),
         updated_at = CURRENT_TIMESTAMP`,
      [seasonNum, roundNum, raceData.raceName, content, modelUsed]
    );

    // 5. Fetch the saved report to return it with id and timestamps
    const [saved] = await pool.execute(
      'SELECT * FROM reports WHERE season = ? AND round = ?',
      [seasonNum, roundNum]
    );

    res.json({
      success: true,
      data:    saved[0],
      cached:  false,
    });

  } catch (err) {
    next(err);
  }
});

router.get('/reports', async (req, res, next) => {
  try {
    const [reports] = await pool.execute(
      `SELECT id, season, round, race_name, model_used, created_at, updated_at
       FROM reports
       ORDER BY created_at DESC
       LIMIT 10`
    );

    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
});

router.get('/reports/:season/:round', async (req, res, next) => {
  try {
    const { season, round } = req.params;

    const [reports] = await pool.execute(
      'SELECT * FROM reports WHERE season = ? AND round = ?',
      [parseInt(season), parseInt(round)]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No report found for season ${season}, round ${round}. Generate one first.`,
      });
    }

    res.json({ success: true, data: reports[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/reports/:season/:round/pdf', async (req, res, next) => {
  try {
    const { season, round } = req.params;

    const [reports] = await pool.execute(
      'SELECT * FROM reports WHERE season = ? AND round = ?',
      [parseInt(season), parseInt(round)]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No report found for season ${season}, round ${round}. Generate one first.`,
      });
    }

    // Generate and stream PDF to browser
    pdfService.generatePDF(reports[0], res);

  } catch (err) {
    next(err);
  }
});

module.exports = router;