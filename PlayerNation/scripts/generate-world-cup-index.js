/**
 * Generates assets/data/world-cup-index.json from the Wyscout dataset index.
 * Run: node scripts/generate-world-cup-index.js
 */

const fs = require('fs');
const path = require('path');

const WORLD_CUP_MATCHES = [
  { id: 2057954, label: 'Russia - Saudi Arabia, 5 - 0', date: '2018-06-14' },
  { id: 2057955, label: 'Egypt - Uruguay, 0 - 1', date: '2018-06-15' },
  { id: 2057956, label: 'Russia - Egypt, 3 - 1', date: '2018-06-19' },
  { id: 2057957, label: 'Uruguay - Saudi Arabia, 1 - 0', date: '2018-06-20' },
  { id: 2057958, label: 'Uruguay - Russia, 3 - 0', date: '2018-06-25' },
  { id: 2057959, label: 'Saudi Arabia - Egypt, 2 - 1', date: '2018-06-25' },
  { id: 2057960, label: 'Portugal - Spain, 3 - 3', date: '2018-06-15' },
  { id: 2057961, label: 'Morocco - Iran, 0 - 1', date: '2018-06-15' },
  { id: 2057962, label: 'Portugal - Morocco, 1 - 0', date: '2018-06-20' },
  { id: 2057963, label: 'Iran - Spain, 0 - 1', date: '2018-06-20' },
  { id: 2057964, label: 'Iran - Portugal, 1 - 1', date: '2018-06-25' },
  { id: 2057965, label: 'Spain - Morocco, 2 - 2', date: '2018-06-25' },
  { id: 2057966, label: 'France - Australia, 2 - 1', date: '2018-06-16' },
  { id: 2057967, label: 'Peru - Denmark, 0 - 1', date: '2018-06-16' },
  { id: 2057968, label: 'France - Peru, 1 - 0', date: '2018-06-21' },
  { id: 2057969, label: 'Denmark - Australia, 1 - 1', date: '2018-06-21' },
  { id: 2057970, label: 'Denmark - France, 0 - 0', date: '2018-06-26' },
  { id: 2057971, label: 'Australia - Peru, 0 - 2', date: '2018-06-26' },
  { id: 2057972, label: 'Argentina - Iceland, 1 - 1', date: '2018-06-16' },
  { id: 2057973, label: 'Croatia - Nigeria, 2 - 0', date: '2018-06-16' },
  { id: 2057974, label: 'Argentina - Croatia, 0 - 3', date: '2018-06-21' },
  { id: 2057975, label: 'Nigeria - Iceland, 2 - 0', date: '2018-06-22' },
  { id: 2057976, label: 'Nigeria - Argentina, 1 - 2', date: '2018-06-26' },
  { id: 2057977, label: 'Iceland - Croatia, 1 - 2', date: '2018-06-26' },
  { id: 2057978, label: 'Brazil - Switzerland, 1 - 1', date: '2018-06-17' },
  { id: 2057979, label: 'Costa Rica - Serbia, 0 - 1', date: '2018-06-17' },
  { id: 2057980, label: 'Brazil - Costa Rica, 2 - 0', date: '2018-06-22' },
  { id: 2057981, label: 'Serbia - Switzerland, 1 - 2', date: '2018-06-22' },
  { id: 2057982, label: 'Serbia - Brazil, 0 - 2', date: '2018-06-27' },
  { id: 2057983, label: 'Switzerland - Costa Rica, 2 - 2', date: '2018-06-27' },
  { id: 2057984, label: 'Germany - Mexico, 0 - 1', date: '2018-06-17' },
  { id: 2057985, label: 'Sweden - Korea Republic, 1 - 0', date: '2018-06-18' },
  { id: 2057986, label: 'Germany - Sweden, 2 - 1', date: '2018-06-23' },
  { id: 2057987, label: 'Korea Republic - Mexico, 1 - 2', date: '2018-06-23' },
  { id: 2057988, label: 'Korea Republic - Germany, 2 - 0', date: '2018-06-27' },
  { id: 2057989, label: 'Mexico - Sweden, 0 - 3', date: '2018-06-27' },
  { id: 2057990, label: 'Belgium - Panama, 3 - 0', date: '2018-06-18' },
  { id: 2057991, label: 'Tunisia - England, 1 - 2', date: '2018-06-18' },
  { id: 2057992, label: 'Belgium - Tunisia, 5 - 2', date: '2018-06-23' },
  { id: 2057993, label: 'England - Panama, 6 - 1', date: '2018-06-24' },
  { id: 2057994, label: 'England - Belgium, 0 - 1', date: '2018-06-28' },
  { id: 2057995, label: 'Panama - Tunisia, 1 - 2', date: '2018-06-28' },
  { id: 2057996, label: 'Poland - Senegal, 1 - 2', date: '2018-06-19' },
  { id: 2057997, label: 'Colombia - Japan, 1 - 2', date: '2018-06-19' },
  { id: 2057998, label: 'Poland - Colombia, 0 - 3', date: '2018-06-24' },
  { id: 2057999, label: 'Japan - Senegal, 2 - 2', date: '2018-06-24' },
  { id: 2058000, label: 'Japan - Poland, 0 - 1', date: '2018-06-28' },
  { id: 2058001, label: 'Senegal - Colombia, 0 - 1', date: '2018-06-28' },
  { id: 2058002, label: 'Uruguay - Portugal, 2 - 1', date: '2018-06-30' },
  { id: 2058003, label: 'France - Argentina, 4 - 3', date: '2018-06-30' },
  { id: 2058004, label: 'Spain - Russia, 1 - 1 (P)', date: '2018-07-01' },
  { id: 2058005, label: 'Croatia - Denmark, 1 - 1 (P)', date: '2018-07-01' },
  { id: 2058006, label: 'Brazil - Mexico, 2 - 0', date: '2018-07-02' },
  { id: 2058007, label: 'Belgium - Japan, 3 - 2', date: '2018-07-02' },
  { id: 2058008, label: 'Sweden - Switzerland, 1 - 0', date: '2018-07-03' },
  { id: 2058009, label: 'Colombia - England, 1 - 1 (P)', date: '2018-07-03' },
  { id: 2058010, label: 'Uruguay - France, 0 - 2', date: '2018-07-06' },
  { id: 2058011, label: 'Brazil - Belgium, 1 - 2', date: '2018-07-06' },
  { id: 2058012, label: 'Russia - Croatia, 2 - 2 (P)', date: '2018-07-07' },
  { id: 2058013, label: 'Sweden - England, 0 - 2', date: '2018-07-07' },
  { id: 2058014, label: 'France - Belgium, 1 - 0', date: '2018-07-10' },
  { id: 2058015, label: 'Croatia - England, 2 - 1 (E)', date: '2018-07-11' },
  { id: 2058016, label: 'Belgium - England, 2 - 0', date: '2018-07-14' },
  { id: 2058017, label: 'France - Croatia, 4 - 2', date: '2018-07-15' },
];

function parseLabel(label) {
  const scoreMatch = label.match(/^(.+?) - (.+?), (\d+) - (\d+)/);
  if (!scoreMatch) {
    return { homeTeam: 'Unknown', awayTeam: 'Unknown', homeScore: 0, awayScore: 0, stage: 'Group' };
  }
  let awayTeam = scoreMatch[2];
  let stage = 'Group';
  if (awayTeam.includes('(P)')) {
    stage = 'Knockout (Penalties)';
    awayTeam = awayTeam.replace(' (P)', '');
  } else if (awayTeam.includes('(E)')) {
    stage = 'Knockout (Extra Time)';
    awayTeam = awayTeam.replace(' (E)', '');
  } else if (label.includes('2018-06-30') || label.includes('2018-07-')) {
    const date = label.split(', ').pop();
    if (date && (date.startsWith('2018-06-30') || date.startsWith('2018-07-'))) {
      stage = 'Knockout';
    }
  }
  return {
    homeTeam: scoreMatch[1].trim(),
    awayTeam: awayTeam.trim(),
    homeScore: parseInt(scoreMatch[3], 10),
    awayScore: parseInt(scoreMatch[4], 10),
    stage,
  };
}

const matches = WORLD_CUP_MATCHES.map((m) => {
  const parsed = parseLabel(m.label);
  return {
    id: m.id,
    label: m.label,
    date: m.date,
    ...parsed,
  };
});

const outDir = path.join(__dirname, '..', 'assets', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'world-cup-index.json'),
  JSON.stringify({ competition: 'FIFA World Cup 2018', matches }, null, 2)
);
console.log(`Wrote ${matches.length} matches to assets/data/world-cup-index.json`);
