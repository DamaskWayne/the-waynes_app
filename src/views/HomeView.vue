<template>
  <div class="game-container">
    <div class="rating-container">
      <p @click="showRanking = !showRanking" class="ratingMore">Список рейтинга &gt;</p>
    </div>

    <!-- Список топ-10 пользователей -->
    <div v-if="showRanking" class="ranking-list">
      <h2>Топ 10 Пользователей</h2>
      <ul>
        <li v-for="(user, index) in topUsers" :key="user.id">
          <div class="user-item">
            <span class="user-position">{{ index + 1 }}</span>
            <span class="user-nickname">{{ user.nickname }}</span>
            <span class="user-score">{{ user.score }} WCoin</span>
          </div>
        </li>
      </ul>
      <button @click="showRanking = false" class="close-ranking">Закрыть</button>
    </div>

    <div class="circleRatingRadius">
      <div v-for="(user, index) in topUsers.slice(0, 3)" :key="user.id" :class="['circleRating', getClassByIndex(index)]">
        <template v-if="index === 0">
          <img src="@/assets/icons8-трофей.gif" alt="Трофей" class="circle-trophy" />
        </template>
      <img v-if="user.avatar" :src="user.avatar" alt="Avatar" class="circle-avatar" />
      <div v-else class="circle-placeholder"></div>
      <p class="circle-nickname">{{ user.nickname }}</p>
      <p class="circle-position">{{ index + 1 }}</p>
      </div>
    </div>
    <ScoreProgress />
    <div class="header">
      <div class="score-container">
        <h2 class="score">{{ store.score }} WCoin</h2>
        <i class="fa fa-plus plus-icon" @click="showModal = true"></i>
      </div>
    </div>

    <div class="circle">
      <img ref="img" id="circle" :src="imgSrc" />
    </div>

    <button v-if="!showCongratsModal && !showModal" class="star-button" @click="showStarModal = true">
      <i class="fa fa-star"></i>
    </button>
    <div v-if="showStarModal" class="modal-overlay" @click.self="closeStarModal">
  <div class="modal-content animated-modal">
    <h3>Обмен WCoin на подписки</h3>
    <p>
      Уже после Нового Года можно будет обменивать WCoin на платные подписки:
    </p>
    <ul>
      <li>Telegram Premium</li>
      <li>Яндекс Плюс</li>
      <li>VPN</li>
      <li>И другие</li>
    </ul>
    <p>
      <em>*Примечание:</em> VPN можно использовать только для информативных целей и
      шифрования данных от злоумышленников.
    </p>
    <button class="close-button" @click="closeStarModal">Закрыть</button>
  </div>
</div>

    <button class="birthday-button" @click="showCongratsModal = true">
      <img src="@/assets/birthday.png" alt="Birthday" />
    </button>

    <div v-if="showModal" id="openModal" class="modal" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Информация</h3>
            <a href="#close" class="close" @click="closeModal">×</a>
          </div>
          <div class="modal-body">
            <p>
              Сейчас купить WCoin не получится через Telegram Stars, но скоро будет возможность.
              Если желаете приобрести WCoin, напишите в тг @dmitry_damask.
              Также есть бонусная система покупок. Узнавайте подробнее у разработчика.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCongratsModal" class="modal-overlay" @click.self="closeCongratsModal">
      <div class="modal-content animated-modal">
        <h3>Поздравь своих родных и близких с Новым Годом 🎄</h3>
        <p>
          С помощью нашего AI. Нажимай на кнопку «Генерация поздравления», скопируй сообщение и отправляй его!
        </p>
        <p>🎄</p>
        <p> Используй свою реф.ссылку, чтобы получить бонус за приглашение:</p>
        <p>https://t.me/the_waynes_bot?start={{MY_ID}}</p>

        <!-- Кнопка генерации -->
        <button 
          class="generate-button" 
          @click="generateMessage" 
          :disabled="loading"
        >
          {{ loading ? 'Генерация...' : 'Генерация поздравления' }}
        </button>

        <!-- Показ поздравления -->
        <div v-if="generatedMessage" class="message-box">
          <p>{{ generatedMessage }}</p>
          <button @click="copyMessage" class="copy-button">Скопировать</button>
        </div>

        <button class="close-button" @click="closeCongratsModal">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import ScoreProgress from '@/components/ScoreProgress.vue';
import { useScoreStore } from '@/stores/score';
import frog from '@/assets/WAYNES.png';
import lizard from '@/assets/WAYNES.png';
import supabase from '@/services/supabase';
import { useTelegram } from '@/services/telegram';

const { user } = useTelegram(); // Получаем пользователя
const topUsers = ref([]);
const showRanking = ref(false); // Переменная для отображения списка
const MY_ID = user?.id ?? 4252;
const store = useScoreStore();

// Поздравления для НГ
const showCongratsModal = ref(false);
const loading = ref(false);
const generatedMessage = ref('');

// Окно подписок
const showStarModal = ref(false);
const closeStarModal = () => {
  showStarModal.value = false;
};

// Закрытие модального окна
const closeCongratsModal = () => {
  showCongratsModal.value = false;
  generatedMessage.value = '';
};

// Поздравления в массиве
const messages = [
  "С Новым Годом! Пусть каждый день приносит радость и счастье!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Пусть этот год будет полон успехов и достижений!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Желаю вам крепкого здоровья и душевного тепла!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Счастья, любви и исполнения всех желаний в Новом Году!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Пусть каждый момент будет наполнен радостью и теплом!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Новых побед, верных друзей и незабываемых впечатлений!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Желаю благополучия, мира в доме и отличного настроения!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Пусть мечты сбываются, а жизнь приносит радость!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Здоровья, счастья и исполнения всех заветных желаний!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Новых горизонтов, больших успехов и светлых эмоций!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Пусть каждый день будет лучше предыдущего!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Желаю в Новом Году только приятных сюрпризов и чудес!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Достижений, вдохновения и новых возможностей!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Пусть сердце будет наполнено любовью и гармонией!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄",
  "Тепла, уюта, радости и исполнения мечт в Новом Году!\nПразднуй этот Новый 2025 Год вместе с WAYNES! 🎄"
];

// Генерация поздравления с загрузкой
const generateMessage = () => {
  loading.value = true;

  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    generatedMessage.value = messages[randomIndex];
    loading.value = false;
  }, 3000); // Задержка 3 секунды
};

// Копирование текста
const copyMessage = () => {
  navigator.clipboard.writeText(generatedMessage.value);
  alert("Текст скопирован!");
};

const imgSrc = computed(() => (store.score > 25 ? lizard : frog));
const getClassByIndex = (index) => {
  if (index === 0) return 'first-place';
  if (index === 1) return 'second-place';
  if (index === 2) return 'third-place';
  return '';
};

const loadTopUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nickname, score')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching top users:', error);
      return;
    }

    // Если ника нет, выводим "Без ника"
    topUsers.value = data.map(user => ({
      ...user,
      nickname: user.nickname || 'Без ника'
    }));
  } catch (err) {
    console.error('Error fetching top users:', err);
  }
};

// Инициализация компонента
onMounted(async () => {
  loadTopUsers();

  // Проверяем, была ли анимация уже выполнена
  if (!localStorage.getItem('page_visited')) {
    // Если не была, запускаем анимацию
    setTimeout(() => {
      document.body.classList.add('body_visible');
    }, 700); // Задержка для плавного появления

    // Устанавливаем флаг в localStorage
    localStorage.setItem('page_visited', 'true');
  } else {
    // Если была, сразу показываем содержимое
    document.body.classList.add('body_visible');
  }
});

// Модальное окно
const showModal = ref(false);

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
/*ДЛя нг кнопок*/
/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease;
}

.animated-modal {
  animation: scaleUp 0.5s ease-in-out;
}

@keyframes scaleUp {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Окно подписок */
.star-button {
  position: fixed;
  right: 120px; /* Прижата к правому краю */
  top: 65%; /* По центру вертикально */
  transform: translateY(-50%); /* Центрирование */
  width: 60px; /* Размер кнопки */
  height: 60px;
  background-color: #260630;
  border: none;
  border-radius: 15px; /* Скруглённые края */
  box-shadow: 0 4px 6px rgba(62, 4, 68, 0.804);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-button i {
  color: rgb(19, 249, 226);
  font-size: 24px;
}

/* Стили для модального окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease;
}

/* Анимация появления */
.animated-modal {
  animation: scaleUp 0.5s ease-in-out;
}

@keyframes scaleUp {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Стили кнопок */
.generate-button,
.copy-button,
.close-button {
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.generate-button {
  background-color: #4caf50;
  color: white;
}

.generate-button:hover {
  background-color: #45a049;
}

.copy-button {
  background-color: #2196f3;
  color: white;
}

.copy-button:hover {
  background-color: #1e88e5;
}

.close-button {
  background-color: #f44336;
  color: white;
}

.close-button:hover {
  background-color: #e53935;
}

/* Поле для сообщения */
.message-box {
  background: #f1f1f1;
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 15px;
  border-radius: 5px;
}

.birthday-button {
  position: fixed;
  right: 195px; /* Прижата к правому краю */
  top: 65%; /* По центру вертикально */
  transform: translateY(-50%); /* Центрирование */
  width: 60px; /* Размер кнопки */
  height: 60px;
  background-color: #260630; /* Розовый фон */
  border: none;
  border-radius: 15px; /* Полукруглые края */
  box-shadow: 0 4px 6px rgba(62, 4, 68, 0.804); /* Легкая тень */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
}

.birthday-button img {
  width: 90%; /* Размер изображения */
  height: 90%;
  border-radius: 20px;
  object-fit: contain; /* Сохранение пропорций */
}

/* Стили для анимации наведения */
.birthday-button:hover {
  background-color: #ff1493; /* Темно-розовый при наведении */
  transform: translateY(-50%) scale(1.1); /* Увеличение кнопки */
  transition: all 0.3s ease;
}

/* Стили для контейнера кругов */
.circleRatingRadius {
  position: absolute; /* Абсолютное позиционирование */
  top: 0; /* Расположить в самом верху */
  left: 50%; /* Центрирование по горизонтали */
  transform: translateX(-50%); /* Центрирование по горизонтали */
  display: flex;
  justify-content: center;
  gap: 15px; /* Расстояние между кругами */
  margin-top: 10px; /* Дополнительный отступ сверху, если нужно */
  z-index: 10; /* Поверх остальных элементов */
}

.first-place {
  order: 1;
  transform: translateY(-15px); /* Поднимаем первое место чуть выше */
  z-index: 2;
}

.second-place {
  order: 0; /* Ставим слева */
}

.third-place {
  order: 2; /* Ставим справа */
}

/* Стили для изображения трофея */
.circle-trophy {
  width: 70%;
  height: -300%;
  display: flex;
  position: absolute;
  top: 9px; /* Смещаем выше */
  border-radius: 20%;
  object-fit: cover;
  z-index: 1;
}

/* Стили для текста внутри круга */
.circle-position {
  position: absolute;
  font-size: 22px;
  font-weight: bold;
  color: rgb(74, 207, 255);
  z-index: 0;
  text-shadow: 0 2px 4px rgba(41, 248, 255, 0.797); /* Легкая тень для читаемости */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Стили для кругов с анимацией плавного переливания градиента на границах */
.circleRating {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border: double 6px transparent; /* Прозрачная рамка */
  background-image: linear-gradient(white, white), radial-gradient(circle at top left, #f00, #3020ff); /* Градиентная рамка */
  background-origin: border-box; /* Градиент будет ограничен рамкой */
  background-clip: content-box, border-box; /* Градиент только на рамке */
  animation: gradientFlow 5s infinite linear; /* Анимация плавного переливания */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.331), 0 6px 6px rgba(0,0,0,0.331); /* Тень для круга */
}

/* Анимация плавного переливания градиента */
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Стили для аватара в круге */
.circle-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent; /* Прозрачная рамка, чтобы не перекрывать градиент */
}

/* Стили для никнейма */
.circle-nickname {
  margin-top: 100px;
  text-align: center;
  font-size: 12px;
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.786), 0 6px 6px rgba(0, 0, 0, 0.786);
  font-weight: bold; /* Добавляем жирный шрифт */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.819); /* Сохраняем красивую тень */
}

.rating-container {
  text-align: center;
  margin-top: -160px;
  margin-bottom: 120px;
}

.ratingMore {
  font-size: 18px;
  color: #5c5d5d;
  cursor: pointer;
  transition: color 0.3s;
}

.ratingMore:hover {
  color: #2086d1;
}

/* Окно */
/* Семикруглый прямоугольник для никнейма */
.user-nickname {
  padding: 5px 10px;
  background-color: #7524ab;
  border-radius: 11px;
  color: #fff;
  text-align: center;
  font-weight: bold;
  font-size: 14px; /* Увеличение шрифта */
  box-shadow: 0px 4px 10px rgba(110, 9, 112, 0.53); /* Тень для выделения */
}

/* Обновленный стиль для количества score */
.user-score {
  font-size: 14px;
  font-weight: bold;
  color: #f8f8f8;
  background-color: #66136f76;
  padding: 8px 12px;
  border-radius: 11px; /* Полукруглый стиль */
  box-shadow: 0px 4px 8px rgba(103, 5, 116, 0.671);
  text-align: center;
  width: 60px;
}

/* Стиль для рейтингового окна */
.ranking-list {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: #3d194e;
  color: #fefefe;
  padding: 15px;
  width: 90%;
  max-width: 400px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(65, 26, 84, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

/* Настройки для прокрутки */
.ranking-list::-webkit-scrollbar {
  width: 8px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background-color: #7524ab;
  border-radius: 10px;
}

/* Заголовок рейтинга */
.ranking-list h2 {
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #ff7eb3, #7524ab);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 20px;
}

/* Стили для списка */
.ranking-list ul {
  padding: 0;
  margin: 0;
  width: 100%;
}

.ranking-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #7524ab;
}

.ranking-list li span {
  flex: 1;
  text-align: left;
}

.ranking-list li .user-score {
  text-align: right;
}

/* Кнопка для закрытия рейтинга */
.close-ranking {
  background: linear-gradient(90deg, #ff7eb3, #7524ab);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 15px;
  transition: all 0.3s ease;
}

.close-ranking:hover {
  transform: scale(1.05);
  background: linear-gradient(90deg, #7524ab, #ff7eb3);
}
</style>