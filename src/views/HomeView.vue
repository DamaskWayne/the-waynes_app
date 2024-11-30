<template>
  <div class="game-container">
    <ScoreProgress />
    <div class="header">
      <div class="score-container">
        <h2 class="score">{{ store.score }} WCoin</h2>
        <i class="fa fa-plus plus-icon" @click="showModal = true"></i>
      </div>
      <button class="bubbly-button" :disabled="!isBonusAvailable" @click="getBonus">{{ buttonText }}</button>
    </div>
    <div class="circle">
      <img ref="img" id="circle" :src="imgSrc" />
    </div>
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
const MY_ID = user?.id ?? 4252;
const store = useScoreStore();

const imgSrc = computed(() => (store.score > 25 ? lizard : frog));
const buttonText = ref('Получить бонус');
const isBonusAvailable = ref(true);
const timer = ref(null);

// Проверка времени бонуса из Supabase
const checkBonusAvailability = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('last_bonus')
    .eq('telegram', MY_ID)
    .single();

  if (error || !data.last_bonus) {
    isBonusAvailable.value = true;
    return;
  }

  const lastBonusTime = new Date(data.last_bonus).getTime();
  const currentTime = Date.now();
  const timePassed = Math.floor((currentTime - lastBonusTime) / 1000); // В секундах

  if (timePassed < 3600) {
    isBonusAvailable.value = false;
    startTimer(3600 - timePassed);
  } else {
    isBonusAvailable.value = true;
  }
};

// Получение бонуса
const getBonus = async () => {
  if (!isBonusAvailable.value) return;

  store.add(35);
  buttonText.value = 'Таймер: 1:00:00';
  isBonusAvailable.value = false;

  // Обновление времени в Supabase
  await supabase
    .from('users')
    .update({ last_bonus: new Date().toISOString() })
    .eq('telegram', MY_ID);

  startTimer(3600); // Запуск таймера
};

// Запуск таймера
const startTimer = (seconds) => {
  let remainingTime = Math.floor(seconds);

  timer.value = setInterval(() => {
    remainingTime--;

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    buttonText.value = `Бонус через: ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remainingTime <= 0) {
      clearInterval(timer.value);
      buttonText.value = 'Получить бонус';
      isBonusAvailable.value = true;
    }
  }, 1000);
};

// Инициализация компонента
onMounted(() => {
  checkBonusAvailability();

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

// Очистка таймера
onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value);
});

// Модальное окно
const showModal = ref(false);

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
/* Ваши стили */
</style>