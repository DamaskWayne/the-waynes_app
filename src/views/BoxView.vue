<template>
  <div class="box-menu-container" v-if="!selectedBox && !showRewards">
    <h1>Выберите Бокс</h1>
    <div class="score-display">
      Доступно: <span class="score-amount">{{ score }} WCoin</span>
    </div>

    <div class="box-list">
      <div class="box-item" v-for="box in boxes" :key="box.id">
        <span>{{ box.name }}</span>
        <button class="buy-button" @click="selectBox(box)">Купить</button>
      </div>
    </div>
    <button class="rewards-button" @click="openRewardsWindow">Мои награды</button>
  </div>

  <!-- Окно с наградами -->
  <div v-if="showRewards" class="rewards-container">
    <h2>Ваши награды</h2>
    <ul>
      <li v-for="reward in rewards" :key="reward.id">
        {{ reward.item }} - Дата: {{ formatDate(reward.date) }}
      </li>
    </ul>
    <button @click="closeRewardsWindow">Закрыть</button>
  </div>

  <!-- Окно с деталями бокса -->
  <div class="box-detail-container" v-else-if="!isTransitioning">
    <transition name="slide-up">
      <div class="selected-box" v-if="showPurchaseInfo">
        <span>Откройте {{ selectedBox.name }}</span>
        <button class="go-button" @click="goToOpenBox">Перейти</button>
      </div>
    </transition>
  </div>

  <!-- Окно открытия бокса -->
  <div class="box-opening-container" v-if="isTransitioning">
    <h1>Открытие {{ selectedBox.name }}</h1>
    <img :src="boxImage" alt="Коробка" />
    <button @click="openBox" class="open-button">Открыть</button>
  </div>
</template>

<script>
import boxClosed from '../assets/boxClosed_waynes.png';
import boxOpenWCoin from '../assets/boxOpenWCoin.png';
import boxOpenItem from '../assets/boxOpenItem_waynes.png';
import { useScoreStore } from '@/stores/score';
import { useToast } from "vue-toastification";
import supabase from '@/services/supabase';
import { useTelegram } from '@/services/telegram';

const { user } = useTelegram();
const MY_ID = user?.id ?? 4252;

export default {
  data() {
    return {
      boxes: [
        { id: 1, name: 'Обычный Бокс 1000W', image: boxClosed, price: 1000, rewards: [150, '50.000$', 200, 300, '60.000$', 400, 500, 450, 'Гитара на спину', 550, 600, 650, '40.000$', 'Бананка "Supreme"'] },
        { id: 2, name: 'Серебряный Бокс 4000W', image: boxClosed, price: 4000, rewards: [450, 550, 700, 900, 1200, 2000, 1000, 1300, 1400, 1600, 1700, 1800, 1850, '60.000$', '80.000$', '110.000$', 'Щелкунчик на спину', 'Крест на спину'] },
        { id: 3, name: 'Золотой Бокс 6000W', image: boxClosed, price: 6000, rewards: [450, 500, 750, 800, 2000, 2500, 3000, 900, 1000, 2200, 2600, 3200, 3400, 3500, 3600, '130.000$', '150.000$', '190.000$', 'Мишка на спину', 'Конфета на спину', 'Подарок на спину'] },
        { id: 4, name: 'Платиновый Бокс 10000W', image: boxClosed, price: 10000, rewards: [1700, 1900, 2200, 3000, 4000, 5000, 3500, 3600, 4100, 4500, 4800, 5100, 5200, 5300, '200.000$', '300.000$', '400.000$', 'Фредди', 'Айсмен', 'Арабский Шейх', 'Бустер'] },
        { id: 5, name: 'Wayne Box 20000W', image: boxClosed, price: 20000, rewards: [2500, 2900, 3200, 5000, 7000, 8000, 10000, 5500, 5600, 5700, 5800, 6000, 7500, 8500, 9000, 9500, 11000, '700.000$', '820.000$', '900.000$', '1.200.000$', 'Дрейк', 'Литвин', 'Илон Маск'] },
      ],
      selectedBox: null,
      isTransitioning: false,
      showPurchaseInfo: false,
      isBoxOpen: false,
      reward: null,
      rewardType: null,
      rewards: [],
      showRewards: false,
    };
  },
  computed: {
    boxImage() {
      if (!this.isBoxOpen) return this.selectedBox.image;
      return this.rewardType === 'WCoin' ? boxOpenWCoin : boxOpenItem;
    },
    score() {
      const scoreStore = useScoreStore();
      return scoreStore.score;
    },
  },
  methods: {
    formatDate(date) {
      const options = { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' };
      const formatter = new Intl.DateTimeFormat('ru-RU', options);
      return formatter.format(new Date(date));
    },

    // Пример использования:
    displayDate() {
      const currentDate = new Date();
      return this.formatDate(currentDate); // Возвращает строку в формате ГГ.ММ.ДД
    },
    selectBox(box) {
      this.selectedBox = box;
      this.showPurchaseInfo = true;
    },
    goToOpenBox() {
      this.showPurchaseInfo = false;
      setTimeout(() => {
        this.isTransitioning = true;
      }, 300);
    },
    openBox() {
      const toast = useToast();
      const scoreStore = useScoreStore();
      const boxPrice = this.selectedBox.price;

      if (scoreStore.score < boxPrice) {
        toast.error('Недостаточно средств для покупки этого бокса!');
        return;
      }

      scoreStore.add(-boxPrice);
      this.isBoxOpen = true;

      const rewards = this.selectedBox.rewards;
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      this.reward = reward;

      this.rewardType = typeof reward === 'number' ? 'WCoin' : 'item';

      if (this.rewardType === 'WCoin') {
        scoreStore.add(reward);
        toast.success(`Вы получили ${reward} WCoin!`);
      } else {
        toast.success(`Вам выпал предмет: ${reward}. Сделайте скриншот экрана и отправьте в чат!`, { timeout: 10000 });
        this.saveReward(reward, 'item');
      }
    },
    async saveReward(item, type) {
      const { data, error } = await supabase
        .from('rewards')
        .insert([{ telegram: MY_ID, telegram_nickname: user?.username || null, item, type, date: new Date() }]);

      if (error) {
        console.error('Ошибка при сохранении награды:', error);
      } else {
        console.log('Награда сохранена:', data);
      }
    },
    async fetchRewards() {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('telegram', MY_ID);

      if (error) {
        console.error('Ошибка при получении наград:', error);
      } else {
        this.rewards = data;
      }
    },
    openRewardsWindow() {
      this.showRewards = true;
      this.fetchRewards();
    },
    closeRewardsWindow() {
      this.showRewards = false;
    },
  },
  mounted() {
    this.fetchRewards(); // Загружаем награды при монтировании компонента
  },
};
</script>

<style scoped>
.box-menu-container,
.box-detail-container,
.box-opening-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: white;
}

h1 {
  margin-bottom: 20px;
}

.box-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.box-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #221a30;
  border-radius: 30px;
  padding: 10px 20px;
  width: 300px;
}

.buy-button {
  background: white;
  color: black;
  border: none;
  border-radius: 20px;
  padding: 5px 15px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.237);
  transition: all 0.3s ease;
}

.buy-button:hover {
  background: #19fc00;
  transform: translateY(3px);
}

.selected-box {
  background: #221a30;
  border-radius: 30px;
  padding: 10px 20px;
  display: flex;
  flex-direction: column; /* Изменено с row на column для вертикального расположения */
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  width: 300px;
  height: 150px; /* Фиксированная высота для стабильности */
}

.go-button {
  outline: none;
  border: none;
  padding: 10px 20px; /* Увеличен padding для лучшей читаемости */
  border-radius: 30px;
  width: 200px; /* Фиксированная ширина для ровного расположения */
  font-size: 1em; /* Уменьшено, чтобы не выглядело слишком большим */
  text-align: center; /* Центровка текста внутри кнопки */
  box-shadow: 0 5px 0 #15fc89; /* Уменьшен box-shadow для визуальной гармонии */
  transition: all 0.3s;
}

.go-button:hover {
  box-shadow: 5px 5px 5px #0f0a18;
  transform: translateY(3px);
}

.open-button {
  outline: none;
  border: none;
  padding: 4px;
  border-radius: 30px;
  display: block;
  margin: 15px auto;
  width: 150px;
  font-size: 1.5em;
  box-shadow: 0 10px 0 #15fc89;
  transition: all 0.3s;
}

.open-button:hover,
.go-button:hover {
  box-shadow: 10px 10px 10px #0f0a18;
  transform: translateY(3px);
}

.box-opening-container img {
  margin-top: 20px;
  width: 256px;
  height: 256px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.score-display {
  background: #221a30;
  color: white;
  border-radius: 20px;
  padding: 10px 20px;
  margin-bottom: 20px;
  font-size: 1.2em;
  text-align: center;
}

.score-amount {
  color: #15fc89; /* Зеленый цвет для баланса */
  font-weight: bold;
}

.rewards-button {
  background-color: yellow;
  color: black;
  border: none;
  border-radius: 20px;
  padding: 12px 30px;
  font-size: 1.2em;
  width: 250px;
  margin-top: 20px;
  align-self: center;
  box-shadow: 0 8px 15px rgba(255, 255, 0, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.rewards-button:hover {
  background-color: #ffcc00;
  transform: translateY(3px);
  box-shadow: 0 15px 20px rgba(255, 255, 0, 0.7);
}

.rewards-container {
  background-color: #221a30;
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.5);
}

.rewards-container h2 {
  text-align: center;
  margin-bottom: 10px;
}

.rewards-container ul {
  list-style-type: none;
  padding: 0;
}

.rewards-container li {
  margin: 10px 0;
  font-size: 1.1em;
}

.rewards-container button {
  background-color: red; /* Красный цвет */
  color: white; /* Белый цвет текста */
  border: none;
  padding: 6px 20px;
  border-radius: 50px; /* Полукруглая форма */
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 15px rgba(255, 0, 0, 0.593);
}

.rewards-container button:hover {
  background-color: darkred; /* Цвет при наведении */
  transform: translateY(3px);
}
</style>