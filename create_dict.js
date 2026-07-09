const axios = require('axios');

const FIREBASE_URL = "https://volley-stats-14e43-default-rtdb.firebaseio.com";

// Функция для очистки имени команды от запрещенных в Firebase символов (. $ # [ ] /)
function cleanFirebaseKey(name) {
  return name.replace(/[\.\$\#\[\]\/]/g, '_').trim();
}

async function generateTeamsDictionary() {
  try {
    console.log("=== Старт генерации справочника команд ===");

    // 1. Получаем текущие данные из парсера
    const response = await axios.get(`${FIREBASE_URL}/tournament.json`);
    const tournamentData = response.data;

    if (!tournamentData) {
      console.log("Ошибка: Папка tournament пуста. Сначала запустите парсер!");
      return;
    }

    // 2. Пытаемся взять уже существующий справочник
    let existingDict = {};
    try {
      const dictResponse = await axios.get(`${FIREBASE_URL}/teams_dictionary.json`);
      if (dictResponse.data) {
        existingDict = dictResponse.data;
      }
    } catch (e) {
      console.log("Справочник еще не создан, создаем новый.");
    }

    let newTeamsCount = 0;

    // 3. Обходим все лиги в папке tournament
    for (const leagueId in tournamentData) {
      const league = tournamentData[leagueId];
      if (!league.standings) continue;

      league.standings.forEach(team => {
        const rawName = team.teamName;
        // Делаем безопасный ключ для Firebase (заменяем точки и слэши на подчёркивание)
        const safeKey = cleanFirebaseKey(rawName);

        // Если такой команды еще нет в справочнике — создаем заготовку
        if (!existingDict[safeKey]) {
          existingDict[safeKey] = {
            fullName: rawName,      // Здесь оригинальное имя останется нетронутым
            shortName: rawName, 
            logo: `logos/${leagueId}/${safeKey.toLowerCase().replace(/[^a-z0-9_]/g, '')}.png`
          };
          newTeamsCount++;
          console.log(`Добавлена заготовка для: ${rawName} (Ключ: ${safeKey})`);
        }
      });
    }

    // 4. Отправляем обновленный справочник обратно в Firebase
    await axios.put(`${FIREBASE_URL}/teams_dictionary.json`, existingDict);

    console.log(`=== Успешно! Справочник обновлен. Добавлено новых команд: ${newTeamsCount} ===`);

  } catch (error) {
    console.error("Ошибка при генерации справочника:", error.message);
  }
}

generateTeamsDictionary();