<template>
  <div>
    <div v-if="!isClickerVisible" class="box-menu-container">
      <div class="menu-background">
        <h1>Выберите мини-игру</h1>
        <div class="box-list">
          <div class="box-item">
            <div class="game-title">
              <span>Кликер</span>
            <button class="play-button" @click="showClicker">Играть</button>
            </div>
            <div class="info-row">
              <span class="info-text">У вас</span>
              <button class="action-button" :disabled="!isBonusAvailable || isBonusBlocked" @click="getBonus">{{ buttonText }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ClickerGame v-else @exit="exitClicker" />
  </div>
</template>

<script setup>
import ClickerGame from '@/games/ClickerGame.vue';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import supabase from '@/services/supabase';
import { useTelegram } from '@/services/telegram';
import { useScoreStore } from '@/stores/score';

const store = useScoreStore();
const { user } = useTelegram();
const MY_ID = user?.id ?? 4252;

const buttonText = ref('Бонус');
const isBonusBlocked = ref(true);
const isBonusAvailable = ref(true);
const timer = ref(null);

const isClickerVisible = ref(false);

function showClicker() {
  isClickerVisible.value = true;
}

function exitClicker() {
  isClickerVisible.value = false;
}

// Проверка доступности бонуса
const checkBonusAvailability = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('last_bonus')
    .eq('telegram', MY_ID)
    .single();

  if (error || !data?.last_bonus) {
    isBonusAvailable.value = true;
    return;
  }

  const lastBonusTime = new Date(data.last_bonus).getTime();
  const currentTime = Date.now();
  const timePassed = Math.floor((currentTime - lastBonusTime) / 1000);

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
  buttonText.value = '1:00:00';
  isBonusAvailable.value = false;

  await supabase
    .from('users')
    .update({ last_bonus: new Date().toISOString() })
    .eq('telegram', MY_ID);

  startTimer(3600);
};

// Таймер обратного отсчета
const startTimer = (seconds) => {
  let remainingTime = seconds;

  timer.value = setInterval(() => {
    remainingTime--;

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    buttonText.value = `${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remainingTime <= 0) {
      clearInterval(timer.value);
      buttonText.value = 'Бонус';
      isBonusAvailable.value = true;
    }
  }, 1000);
};

onMounted(() => {
  isBonusBlocked.value = true;
  setTimeout(() => {
    isBonusBlocked.value = false;
  }, 2000); // 2 секунды
  checkBonusAvailability();
});

onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value);
});
</script>

<style scoped>
/* Фон заднего меню */
.menu-background {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1a1524;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  color: white;
  max-width: 400px;
  margin: auto;
}

/* Меню выбора */
.box-menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  justify-content: center;
  color: white;
}

.game-title {
  display: flex;
  justify-content: center; /* Центрируем по горизонтали */
  align-items: center; /* Центрируем по вертикали */
  padding: 10px 20px;
  background: #ffffff;
  color: #000000;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.396);
}

/* Кнопка "Играть" */
.play-button {
  background: #23ff23;
  box-shadow: 0 10px 25px rgba(11, 255, 44, 0.775);
  color: black;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  margin-left: 15px;
}

.play-button:hover {
  background: #f0f0f0;
}

.info-row {
  display: inline-block;
  padding: 10px 20px;
  background: #ffffff;
  color: #000000;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.357);
}

.info-text {
  background: white;
  color: black;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
}

.action-button {
  flex-shrink: 0; /* Кнопка не сжимается */
  padding: 10px 20px;
  background-color: #32cd32;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-button:disabled {
  background-color: gray;
  cursor: not-allowed;
}

.action-button:not(:disabled):hover {
  background-color: #28a745;
}
</style>