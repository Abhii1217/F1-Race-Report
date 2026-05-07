const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL   || 'llama-3.3-70b-versatile';
const MAX_TOKENS   = parseInt(process.env.GROQ_MAX_TOKENS)  || 2048;
const TEMPERATURE  = parseFloat(process.env.GROQ_TEMPERATURE) || 0.75;

function buildPrompt(raceData) {
  const { raceName, season, circuit, country, date, results, standings } = raceData;

  // Top 10 finishers
  const top10 = results.slice(0, 10).map(r =>
    `P${r.position}. ${r.driverName} (${r.team}) — ${r.time || r.status} — Points: ${r.points}`
  ).join('\n');

  // Retirements (drivers who didn't finish)
  const retirements = results
    .filter(r => r.status !== 'Finished' && !r.status.includes('Lap'))
    .map(r => `${r.driverName} (${r.team}) — ${r.status}`)
    .join('\n') || 'None';

  // Fastest lap
  const fastestLapDriver = results.find(r => r.fastestLap?.rank === 1);
  const fastestLapInfo   = fastestLapDriver
    ? `${fastestLapDriver.driverName} — ${fastestLapDriver.fastestLap.time} (Lap ${fastestLapDriver.fastestLap.lap})`
    : 'N/A';

  // Championship top 5 after this race
  const champTop5 = standings.slice(0, 5).map(s =>
    `P${s.position}. ${s.driverName} (${s.team}) — ${s.points} pts`
  ).join('\n');

  return `You are an expert Formula 1 race analyst and journalist. Write a comprehensive, engaging race report for the following Grand Prix.

RACE INFORMATION:
- Race: ${raceName} ${season}
- Circuit: ${circuit}, ${country}
- Date: ${date}

RACE RESULTS (Top 10):
${top10}

FASTEST LAP:
${fastestLapInfo}

RETIREMENTS:
${retirements}

CHAMPIONSHIP STANDINGS (After this race):
${champTop5}

Write a detailed race report in Markdown format. Include:

1. **Race Summary** — A compelling opening paragraph describing the race narrative
2. **Key Moments** — 3-5 pivotal moments that defined the race (overtakes, pit stops, incidents)
3. **Driver of the Day** — Highlight the standout performer with reasoning
4. **Team Performance** — Brief analysis of each top team's performance
5. **Championship Implications** — How this result affects the title fight
6. **Conclusion** — A punchy closing paragraph

Writing style: Professional but engaging. Use F1 terminology. Be specific about lap numbers and time gaps where relevant. Make it feel like a real motorsport journalism piece.

Format the output in clean Markdown with headers, bullet points where appropriate, and bold text for emphasis.`;
}

async function generateReport(raceData) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    const error = new Error('Groq API key is not configured. Please add GROQ_API_KEY to your .env file.');
    error.statusCode = 503;
    throw error;
  }

  const prompt = buildPrompt(raceData);

  console.log(`[Groq] Generating report for ${raceData.raceName} ${raceData.season}...`);

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model:       GROQ_MODEL,
        max_tokens:  MAX_TOKENS,
        temperature: TEMPERATURE,
        messages: [
          {
            role:    'system',
            content: 'You are an expert Formula 1 race analyst and journalist. Always respond in well-structured Markdown format.',
          },
          {
            role:    'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type':  'application/json',
        },
        timeout: 30000, // 30 seconds timeout for AI generation
      }
    );

    const report = response.data.choices[0].message.content;
    const model  = response.data.model;

    console.log(`[Groq] Report generated successfully using ${model}`);
    return { content: report, modelUsed: model };

  } catch (err) {
    if (err.response) {
      console.error('[Groq] API error:', err.response.data);

      if (err.response.status === 401) {
        const error = new Error('Invalid Groq API key. Please check your .env file.');
        error.statusCode = 401;
        throw error;
      }

      if (err.response.status === 429) {
        const error = new Error('Groq API rate limit reached. Please wait a moment and try again.');
        error.statusCode = 429;
        throw error;
      }

      const error = new Error(`Groq API error: ${err.response.data?.error?.message || 'Unknown error'}`);
      error.statusCode = 500;
      throw error;
    }

    if (err.code === 'ECONNABORTED') {
      const error = new Error('Groq API timed out. The report generation took too long.');
      error.statusCode = 504;
      throw error;
    }

    throw err;
  }
}

module.exports = { generateReport };