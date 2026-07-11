const axios = require('axios');
const cheerio = require('cheerio');

// Базовый URL турниров в Firebase
const DB_BASE_URL = "https://volley-stats-14e43-default-rtdb.firebaseio.com/tournament";

// Список ваших лиг
const LEAGUES = [
  {
    id: "dritte_liga_west",
    url: "https://www.dvv-ligen.de/cms/home/dritte_liga_maenner/dritte_liga_west/tabelle_spiele.xhtml?LeaguePresenter.view=resultTable&LeaguePresenter.matchSeriesId=95199957"
  },
  {
    id: "oberliga_1",
    url: "https://nwvv.sams-server.de/cms/home/spielbetrieb/m_ligen/ol.xhtml?LeaguePresenter.view=resultTable&LeaguePresenter.matchSeriesId=115982957#samsCmsComponent_85424975"
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

  } catch (error) {
    console.error(`Ошибка при работе парсера для лиги ${league.id}:`, error.message);
  }
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
