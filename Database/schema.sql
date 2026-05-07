CREATE DATABASE IF NOT EXISTS f1_race_report;
USE f1_race_report;

CREATE TABLE IF NOT EXISTS race_cache (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  season       YEAR         NOT NULL,
  round        TINYINT      NOT NULL,
  race_data    JSON         NOT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_race (season, round)
);

CREATE TABLE IF NOT EXISTS reports (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  season       YEAR         NOT NULL,
  round        TINYINT      NOT NULL,
  race_name    VARCHAR(255) NOT NULL,
  content      TEXT         NOT NULL,
  model_used   VARCHAR(100) NOT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_report (season, round)
);

CREATE INDEX idx_race_cache_season ON race_cache(season);
CREATE INDEX idx_reports_season ON reports(season);
CREATE INDEX idx_reports_created ON reports(created_at);