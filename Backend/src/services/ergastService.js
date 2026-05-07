const axios = require("axios");
const pool  = require("../config/db");
const cache = require("../config/cache");

const BASE_URL = process.env.ERGAST_BASE_URL || "https://api.jolpi.ca/ergast/f1";
const TIMEOUT  = parseInt(process.env.ERGAST_TIMEOUT_MS) || 10000;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    Accept: "application/json",
    "User-Agent": "F1RaceReport/1.0",
  },
});

async function fetchFromAPI(endpoint) {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (err) {
    if (err.response) {
      const error = new Error(
        `Jolpica API error: ${err.response.status} ${err.response.statusText}`
      );
      error.statusCode = err.response.status;
      throw error;
    } else if (err.code === "ECONNABORTED") {
      const error = new Error("Jolpica API request timed out. Please try again.");
      error.statusCode = 504;
      throw error;
    } else {
      const error = new Error("Cannot reach Jolpica API. Check your internet connection.");
      error.statusCode = 503;
      throw error;
    }
  }
}

async function getSeasons() {
  const cacheKey = "seasons";

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log("[Cache HIT] seasons");
    return cached;
  }

  console.log("[API] Fetching seasons from Jolpica...");
  const data    = await fetchFromAPI("/seasons?limit=100");
  const seasons = data.MRData.SeasonTable.Seasons
    .map((s) => parseInt(s.season))
    .sort((a, b) => b - a);

  cache.set(cacheKey, seasons);
  return seasons;
}

async function getRaces(season) {
  const cacheKey = `races_${season}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] races_${season}`);
    return cached;
  }

  console.log(`[API] Fetching races for season ${season}...`);
  const data  = await fetchFromAPI(`/${season}/races?limit=30`);
  const races = data.MRData.RaceTable.Races.map((race) => ({
    round:       parseInt(race.round),
    raceName:    race.raceName,
    circuitName: race.Circuit.circuitName,
    country:     race.Circuit.Location.country,
    date:        race.date,
  }));

  cache.set(cacheKey, races);
  return races;
}

async function getRaceData(season, round) {
  const cacheKey        = `racedata_${season}_${round}`;
  const currentYear     = new Date().getFullYear();
  const isCurrentSeason = parseInt(season) >= currentYear;

  const memCached = cache.get(cacheKey);
  if (memCached) {
    console.log(`[Cache HIT - Memory] race ${season}/${round}`);
    return memCached;
  }

  let mysqlRows;
  if (isCurrentSeason) {
    const [rows] = await pool.execute(
      `SELECT race_data FROM race_cache
       WHERE season = ? AND round = ?
       AND updated_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [season, round]
    );
    mysqlRows = rows;
  } else {
    const [rows] = await pool.execute(
      "SELECT race_data FROM race_cache WHERE season = ? AND round = ?",
      [season, round]
    );
    mysqlRows = rows;
  }

  if (mysqlRows.length > 0) {
    console.log(`[Cache HIT - MySQL] race ${season}/${round}`);
    const raceData = mysqlRows[0].race_data;
    cache.set(cacheKey, raceData);
    return raceData;
  }

  console.log(`[API] Fetching race data for ${season}/${round}...`);

  const [resultsData, lapsData, standingsData] = await Promise.all([
    fetchFromAPI(`/${season}/${round}/results?limit=30`),
    fetchFromAPI(`/${season}/${round}/laps?limit=2000`),
    fetchFromAPI(`/${season}/driverStandings?limit=30`),
  ]);

  const raceInfo = resultsData.MRData.RaceTable.Races[0];
  if (!raceInfo) {
    const error = new Error(
      `No race data found for season ${season}, round ${round}`
    );
    error.statusCode = 404;
    throw error;
  }

  const results = raceInfo.Results.map((r) => {
    const positionText    = r.positionText || String(r.position) || "–";
    const numericPosition = parseInt(r.position);
    const displayPosition = numericPosition > 0 ? numericPosition : null;

    return {
      position:     displayPosition,
      positionText: positionText,
      driverCode:   r.Driver.code,
      driverName:   `${r.Driver.givenName} ${r.Driver.familyName}`,
      team:         r.Constructor.name,
      gridPosition: parseInt(r.grid) || 0,
      status:       r.status,
      points:       parseFloat(r.points) || 0,
      fastestLap:   r.FastestLap
        ? {
            rank: parseInt(r.FastestLap.rank),
            lap:  parseInt(r.FastestLap.lap),
            time: r.FastestLap.Time?.time || null,
          }
        : null,
      time: r.Time?.time || null,
    };
  });

  const laps        = lapsData.MRData.RaceTable.Races[0]?.Laps || [];
  const lapPositions = {};

  laps.forEach((lap) => {
    const lapNum = parseInt(lap.number);
    lap.Timings.forEach((timing) => {
      if (!lapPositions[timing.driverId]) {
        lapPositions[timing.driverId] = [];
      }
      lapPositions[timing.driverId].push({
        lap:      lapNum,
        position: parseInt(timing.position),
      });
    });
  });

  const standingsRace = standingsData.MRData.StandingsTable.StandingsLists[0];
  const standings     = standingsRace
    ? standingsRace.DriverStandings.map((s) => ({
        position:  parseInt(s.position),
        driverCode: s.Driver.code,
        driverName: `${s.Driver.givenName} ${s.Driver.familyName}`,
        team:       s.Constructors[0]?.name || "Unknown",
        points:     parseFloat(s.points),
        wins:       parseInt(s.wins),
      }))
    : [];

  const raceData = {
    season:      parseInt(season),
    round:       parseInt(round),
    raceName:    raceInfo.raceName,
    circuit:     raceInfo.Circuit.circuitName,
    country:     raceInfo.Circuit.Location.country,
    date:        raceInfo.date,
    results,
    lapPositions,
    standings,
  };

  const raceDate      = new Date(raceInfo.date);
  const now           = new Date();
  const daysSinceRace = Math.floor((now - raceDate) / (1000 * 60 * 60 * 24));

  let memoryTTL; // seconds for node-cache
  let mysqlNote; // for logging

  if (!isCurrentSeason) {
    memoryTTL = undefined;
    mysqlNote = "permanent (past season)";
  } else if (daysSinceRace <= 3) {
    memoryTTL = 60 * 60;      // 1 hour
    mysqlNote = "short (race within 3 days — stewards may still be active)";
  } else if (daysSinceRace <= 7) {
    memoryTTL = 60 * 60 * 6;  // 6 hours
    mysqlNote = "medium (race within 7 days)";
  } else {
    memoryTTL = 60 * 60 * 24; // 24 hours
    mysqlNote = "long (current season, race older than 7 days)";
  }

  console.log(`[Cache] TTL strategy for ${season}/${round}: ${mysqlNote}`);

  await pool.execute(
    `INSERT INTO race_cache (season, round, race_data)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       race_data  = VALUES(race_data),
       updated_at = CURRENT_TIMESTAMP`,
    [season, round, JSON.stringify(raceData)]
  );

  if (memoryTTL) {
    cache.set(cacheKey, raceData, memoryTTL);
  } else {
    cache.set(cacheKey, raceData);
  }

  console.log(`[API] Race data for ${season}/${round} fetched and cached`);
  return raceData;
}

module.exports = { getSeasons, getRaces, getRaceData };