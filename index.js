
Index · JS
const axios = require('axios');
const cheerio = require('cheerio');

// Базовый URL турниров в Firebase
const DB_BASE_URL = "https://volley-stats-14e43-default-rtdb.firebaseio.com/tournament";

// Расписание лиги dritte_liga_west: сколько игр запланировано на каждую конкретную
// календарную дату и сколько игр по лиге накопится к этой дате нарастающим итогом.
// Составлено из официального Spielplan (CSV) на сезон 2026/27.
const SCHEDULE_DRITTE_LIGA_WEST = [
  { date: "2026-09-19", games: 6, cumulativeGames: 6 },
  { date: "2026-09-26", games: 6, cumulativeGames: 12 },
  { date: "2026-10-03", games: 3, cumulativeGames: 15 },
  { date: "2026-10-04", games: 3, cumulativeGames: 18 },
  { date: "2026-10-10", games: 6, cumulativeGames: 24 },
  { date: "2026-10-17", games: 6, cumulativeGames: 30 },
  { date: "2026-10-24", games: 4, cumulativeGames: 34 },
  { date: "2026-10-25", games: 1, cumulativeGames: 35 },
  { date: "2026-10-31", games: 4, cumulativeGames: 39 },
  { date: "2026-11-01", games: 1, cumulativeGames: 40 },
  { date: "2026-11-07", games: 5, cumulativeGames: 45 },
  { date: "2026-11-08", games: 1, cumulativeGames: 46 },
  { date: "2026-11-14", games: 5, cumulativeGames: 51 },
  { date: "2026-11-15", games: 1, cumulativeGames: 52 },
  { date: "2026-11-21", games: 6, cumulativeGames: 58 },
  { date: "2026-11-28", games: 4, cumulativeGames: 62 },
  { date: "2026-11-29", games: 2, cumulativeGames: 64 },
  { date: "2026-12-05", games: 5, cumulativeGames: 69 },
  { date: "2026-12-06", games: 1, cumulativeGames: 70 },
  { date: "2026-12-12", games: 6, cumulativeGames: 76 },
  { date: "2026-12-19", games: 3, cumulativeGames: 79 },
  { date: "2027-01-09", games: 5, cumulativeGames: 84 },
  { date: "2027-01-16", games: 4, cumulativeGames: 88 },
  { date: "2027-01-17", games: 2, cumulativeGames: 90 },
  { date: "2027-01-23", games: 5, cumulativeGames: 95 },
  { date: "2027-01-24", games: 1, cumulativeGames: 96 },
  { date: "2027-01-30", games: 3, cumulativeGames: 99 },
  { date: "2027-01-31", games: 3, cumulativeGames: 102 },
  { date: "2027-02-06", games: 4, cumulativeGames: 106 },
  { date: "2027-02-07", games: 1, cumulativeGames: 107 },
  { date: "2027-02-13", games: 5, cumulativeGames: 112 },
  { date: "2027-02-14", games: 1, cumulativeGames: 113 },
  { date: "2027-02-20", games: 6, cumulativeGames: 119 },
  { date: "2027-02-21", games: 1, cumulativeGames: 120 },
  { date: "2027-03-06", games: 4, cumulativeGames: 124 },
  { date: "2027-03-07", games: 2, cumulativeGames: 126 },
  { date: "2027-03-21", games: 6, cumulativeGames: 132 },
];

// Расписание лиги oberliga_1: сколько игр запланировано на каждую конкретную
// календарную дату и сколько игр по лиге накопится к этой дате нарастающим итогом.
// Составлено из официального Spielplan (CSV) на сезон 2026/27.
const SCHEDULE_OBERLIGA_1 = [
  { date: "2026-09-12", games: 4, cumulativeGames: 4 },
  { date: "2026-09-26", games: 2, cumulativeGames: 6 },
  { date: "2026-09-27", games: 4, cumulativeGames: 10 },
  { date: "2026-10-03", games: 6, cumulativeGames: 16 },
  { date: "2026-10-31", games: 4, cumulativeGames: 20 },
  { date: "2026-11-01", games: 2, cumulativeGames: 22 },
  { date: "2026-11-07", games: 2, cumulativeGames: 24 },
  { date: "2026-11-14", games: 2, cumulativeGames: 26 },
  { date: "2026-11-15", games: 2, cumulativeGames: 28 },
  { date: "2026-11-21", games: 2, cumulativeGames: 30 },
  { date: "2026-11-28", games: 4, cumulativeGames: 34 },
  { date: "2026-11-29", games: 2, cumulativeGames: 36 },
  { date: "2026-12-05", games: 4, cumulativeGames: 40 },
  { date: "2026-12-06", games: 2, cumulativeGames: 42 },
  { date: "2026-12-13", games: 4, cumulativeGames: 46 },
  { date: "2026-12-19", games: 2, cumulativeGames: 48 },
  { date: "2027-01-16", games: 2, cumulativeGames: 50 },
  { date: "2027-01-17", games: 4, cumulativeGames: 54 },
  { date: "2027-01-23", games: 6, cumulativeGames: 60 },
  { date: "2027-02-06", games: 4, cumulativeGames: 64 },
  { date: "2027-02-07", games: 2, cumulativeGames: 66 },
  { date: "2027-02-13", games: 2, cumulativeGames: 68 },
  { date: "2027-02-20", games: 2, cumulativeGames: 70 },
  { date: "2027-02-27", games: 2, cumulativeGames: 72 },
  { date: "2027-02-28", games: 2, cumulativeGames: 74 },
  { date: "2027-03-06", games: 4, cumulativeGames: 78 },
  { date: "2027-04-03", games: 2, cumulativeGames: 80 },
  { date: "2027-04-10", games: 2, cumulativeGames: 82 },
  { date: "2027-04-11", games: 2, cumulativeGames: 84 },
  { date: "2027-04-24", games: 6, cumulativeGames: 90 },
];

// Список ваших лиг
const LEAGUES = [
  {
    id: "dritte_liga_west",
    url: "https://www.dvv-ligen.de/cms/home/dritte_liga_maenner/dritte_liga_west/tabelle_spiele.xhtml?LeaguePresenter.view=resultTable&LeaguePresenter.matchSeriesId=95199957",
    schedule: SCHEDULE_DRITTE_LIGA_WEST
  },
  {
    id: "oberliga_1",
    url: "https://nwvv.sams-server.de/cms/home/spielbetrieb/m_ligen/ol.xhtml?LeaguePresenter.view=resultTable&LeaguePresenter.matchSeriesId=115982957#samsCmsComponent_85424975",
    schedule: SCHEDULE_OBERLIGA_1
  }
];

async function parseSingleLeague(league) {
  try {
    console.log(`Запуск точного парсинга для лиги: ${league.id}...`);
    const { data } = await axios.get(league.url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const $ = cheerio.load(data);
    const standings = [];

    $('table tbody tr').each((index, element) => {
      const teamLink = $(element).find('td a');
      if (!teamLink.length) return; 

      let teamName = teamLink.find('span').first().text().trim();
      
      if (!teamName) {
        const rawText = teamLink.text().trim();
        const halfLength = rawText.length / 2;
        const firstHalf = rawText.substring(0, halfLength);
        const secondHalf = rawText.substring(halfLength);
        teamName = (firstHalf === secondHalf) ? firstHalf : rawText;
      }

      teamName = teamName.replace(/[▲▼]/g, '').replace(/\s+/g, ' ').trim();
      if (teamName.toLowerCase().includes('aufstiegsplatz') || teamName.toLowerCase().includes('abstieg')) return;

      const allNumbers = [];
      let sets = "0:0";

      $(element).find('td').each((i, td) => {
        const text = $(td).text().trim();
        
        if (text.includes(':') && /\d+:\d+/.test(text)) {
          sets = text.match(/\d+:\d+/)[0];
        }
        
        const numMatch = text.match(/^\d+$/);
        if (numMatch) {
          allNumbers.push(parseInt(numMatch[0], 10));
        }
      });

      if (allNumbers.length >= 4) {
        const place = allNumbers[0];
        const matches = allNumbers[1];
        const wins = allNumbers[2]; 
        const points = allNumbers[allNumbers.length - 1];

        standings.push({ 
          place, 
          teamName, 
          matches, 
          wins, 
          sets,
          points 
        });
      }
    });

    if (standings.length === 0) {
      console.log(`Ошибка: Не удалось извлечь данные для лиги ${league.id}.`);
      return;
    }

    standings.sort((a, b) => a.place - b.place);

    const now = new Date();
    const formattedDate = now.toLocaleString('ru-RU', { timeZone: 'Europe/Berlin' });

    const targetUrl = `${DB_BASE_URL}/${league.id}.json`;
    await axios.put(targetUrl, {
      lastUpdated: formattedDate,
      standings: standings
    });

    console.log(`Успешно! Лига ${league.id} обновлена в Firebase (${formattedDate}). Команд: ${standings.length}`);

    // --- СНИМКИ ИСТОРИИ ПО ДАТАМ ИГР (для bump-графика движения по местам) ---
    await saveHistorySnapshotsIfNew(league, standings, formattedDate);

  } catch (error) {
    console.error(`Ошибка при работе парсера для лиги ${league.id}:`, error.message);
  }
}

// Суммарное число сыгранных матчей по всей лиге (сумма "matches" всех команд / 2,
// т.к. каждый матч засчитан обеим командам)
function getTotalGamesPlayed(standings) {
  const sum = standings.reduce((acc, t) => acc + (t.matches || 0), 0);
  return Math.round(sum / 2);
}

async function saveHistorySnapshotsIfNew(league, standings, formattedDate) {
  const totalGamesPlayed = getTotalGamesPlayed(standings);
  const metaUrl = `${DB_BASE_URL}/${league.id}_history/_meta.json`;

  let metaData = null;
  try {
    const metaRes = await axios.get(metaUrl);
    if (metaRes.data) metaData = metaRes.data;
  } catch (e) {
    // снимков ещё не было — начинаем с нуля
  }

  const lastTotalGamesPlayed = (metaData && typeof metaData.lastTotalGamesPlayed === 'number')
    ? metaData.lastTotalGamesPlayed : 0;
  const baselineSaved = !!(metaData && metaData.baselineSaved);

  const snapshotBase = {
    standings: standings.map(t => ({
      place: t.place,
      teamName: t.teamName,
      matches: t.matches,
      wins: t.wins,
      sets: t.sets,
      points: t.points
    }))
  };

  // --- ПРЕДСЕЗОННЫЙ БАЗОВЫЙ СНИМОК (точка отсчёта для графика, до первой игры) ---
  if (!baselineSaved && league.schedule && league.schedule.length) {
    const firstDate = league.schedule[0].date;
    const beforeFirstDate = shiftIsoDate(firstDate, -1);
    const baselineUrl = `${DB_BASE_URL}/${league.id}_history/${beforeFirstDate}.json`;
    try {
      await axios.put(baselineUrl, { ...snapshotBase, date: beforeFirstDate, savedAt: formattedDate, baseline: true });
      console.log(`Лига ${league.id}: сохранён предсезонный базовый снимок за ${beforeFirstDate}.`);
    } catch (e) {
      console.error(`Ошибка сохранения предсезонного снимка для ${league.id}:`, e.message);
    }
  }

  if (totalGamesPlayed <= lastTotalGamesPlayed) {
    console.log(`Лига ${league.id}: новых сыгранных игр нет (${totalGamesPlayed}), снимок не нужен.`);
    // Всё равно фиксируем, что базовый снимок сохранён, если это был первый запуск
    if (!baselineSaved) {
      try { await axios.put(metaUrl, { lastTotalGamesPlayed, baselineSaved: true }); } catch (e) {}
    }
    return;
  }

  if (league.schedule && league.schedule.length) {
    // Точная привязка к календарным датам игр по расписанию сезона.
    // Идём по всем датам расписания, которые "закрылись" между прошлым
    // и текущим прогоном, и сохраняем снимок под каждой из них отдельно —
    // так суббота и воскресенье одного тура попадают в историю как две разные точки.
    const newlyCompletedDates = league.schedule.filter(
      d => d.cumulativeGames > lastTotalGamesPlayed && d.cumulativeGames <= totalGamesPlayed
    );

    for (const entry of newlyCompletedDates) {
      const historyUrl = `${DB_BASE_URL}/${league.id}_history/${entry.date}.json`;
      try {
        await axios.put(historyUrl, { ...snapshotBase, date: entry.date, savedAt: formattedDate });
        console.log(`Лига ${league.id}: сохранён снимок истории за ${entry.date}.`);
      } catch (e) {
        console.error(`Ошибка сохранения снимка ${entry.date} для ${league.id}:`, e.message);
        return; // не двигаем счётчик дальше, если запись не удалась
      }
    }
  } else {
    // Расписание для этой лиги не зашито — сохраняем упрощённо, датой запуска скрипта.
    const todayIso = new Date().toISOString().slice(0, 10);
    const historyUrl = `${DB_BASE_URL}/${league.id}_history/${todayIso}.json`;
    try {
      await axios.put(historyUrl, { ...snapshotBase, date: todayIso, savedAt: formattedDate });
      console.log(`Лига ${league.id}: сохранён снимок истории за ${todayIso} (без точного расписания).`);
    } catch (e) {
      console.error(`Ошибка сохранения снимка ${todayIso} для ${league.id}:`, e.message);
      return;
    }
  }

  // Обновляем счётчик, только если все снимки успешно записались
  try {
    await axios.put(metaUrl, { lastTotalGamesPlayed: totalGamesPlayed, baselineSaved: true });
  } catch (e) {
    console.error(`Ошибка обновления _meta для ${league.id}:`, e.message);
  }
}

// Сдвигает дату в формате YYYY-MM-DD на указанное число дней (может быть отрицательным)
function shiftIsoDate(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function parseAllLeagues() {
  console.log("=== Старт общего цикла парсинга лиг ===");
  for (const league of LEAGUES) {
    await parseSingleLeague(league);
  }
  console.log("=== Все лиги успешно обработаны ===");
}

// Запускаем процесс один раз при старте
parseAllLeagues();










