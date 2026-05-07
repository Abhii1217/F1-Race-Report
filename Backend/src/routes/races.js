const express       = require('express');
const router        = express.Router();
const ergastService = require('../services/ergastService');

router.get('/races', async (req, res, next) => {
  try {
    const { season } = req.query;

    if (!season) {
      return res.status(400).json({
        success: false,
        message: 'season query parameter is required. Example: /api/races?season=2024'
      });
    }

    const races = await ergastService.getRaces(season);
    res.json({ success: true, data: races });
  } catch (err) {
    next(err);
  }
});

module.exports = router;