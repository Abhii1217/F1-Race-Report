const express       = require('express');
const router        = express.Router();
const ergastService = require('../services/ergastService');

router.get('/race-data', async (req, res, next) => {
  try {
    const { season, round } = req.query;

    if (!season || !round) {
      return res.status(400).json({
        success: false,
        message: 'season and round query parameters are required. Example: /api/race-data?season=2024&round=1'
      });
    }

    const raceData = await ergastService.getRaceData(season, round);
    res.json({ success: true, data: raceData });
  } catch (err) {
    next(err);
  }
});

module.exports = router;