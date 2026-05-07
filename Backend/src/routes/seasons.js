const express        = require('express');
const router         = express.Router();
const ergastService  = require('../services/ergastService');

router.get('/seasons', async (req, res, next) => {
  try {
    const seasons = await ergastService.getSeasons();
    res.json({ success: true, data: seasons });
  } catch (err) {
    next(err); // pass error to global error handler
  }
});

module.exports = router;