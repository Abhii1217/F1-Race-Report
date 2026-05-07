const NodeCache = require('node-cache');

const TTL_SECONDS = (parseInt(process.env.CACHE_TTL_MINUTES) || 360) * 60;

const cache = new NodeCache({
  stdTTL:      TTL_SECONDS,  // default expiry for all keys
  checkperiod: 600,          // check for expired keys every 10 minutes
  useClones:   false,        // don't clone objects (faster, saves memory)
});

function get(key) {
  return cache.get(key);
}

function set(key, value, ttl) {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

// Remove a specific key from cache
function del(key) {
  cache.del(key);
}

// Clear everything from cache
function flush() {
  cache.flushAll();
}

// Get cache statistics (useful for debugging)
function stats() {
  return cache.getStats();
}

module.exports = { get, set, del, flush, stats };