<template>
  <div class="box-menu-container" v-if="!selectedBox">
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
  </div>

  <div class="box-detail-container" v-else-if="!isTransitioning">
    <transition name="slide-up">
      <div class="selected-box" v-if="showPurchaseInfo">
        <span>Откройте {{ selectedBox.name }}</span>
        <button class="go-button" @click="goToOpenBox">Перейти</button>
      </div>
    </transition>
  </div>

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

export default {
  data() {
    return {
      boxes: [
        { id: 1, name: 'Обычный Бокс 1000W', image: boxClosed, price: 1000, rewards: [150, 200, 300, 400, '40.000$', '50.000$', '60.000$', 'Гитара на спину', 'Бананка "Supreme"'] },
        { id: 2, name: 'Серебряный Бокс 4000W', image: boxClosed, price: 4000, rewards: [450, 550, 700, 900, 1200, 2000, '60.000$', '80.000$', '110.000$', 'Щелкунчик на спину', 'Крест на спину'] },
        { id: 3, name: 'Золотой Бокс 6000W', image: boxClosed, price: 6000, rewards: [450, 500, 750, 800, 2000, 2500, 3000, '130.000$', '150.000$', '190.000$', 'Мишка на спину', 'Конфета на спину', 'Подарок на спину'] },
        { id: 4, name: 'Платиновый Бокс 10000W', image: boxClosed, price: 10000, rewards: [1700, 1900, 2200, 3000, 4000, 5000, '200.000$', '300.000$', '400.000$', 'Фредди', 'Айсмен', 'Арабский Шейх', 'Бустер'] },
        { id: 5, name: 'Wayne Box 20000W', image: boxClosed, price: 20000, rewards: [2500, 2900, 3200, 5000, 7000, 8000, 10000, '700.000$', '820.000$', '900.000$', '1.200.000$', 'Дрейк', 'Литвин', 'Илон Маск'] },
      ],
      selectedBox: null,
      isTransitioning: false,
      showPurchaseInfo: false,
      isBoxOpen: false,
      reward: null, // Выбранная награда
      rewardType: null, // Тип награды: "WCoin" или "item"
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

      scoreStore.add(-boxPrice); // Списываем стоимость бокса
      this.isBoxOpen = true;

      // Рандомное определение награды
      const rewards = this.selectedBox.rewards;
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      this.reward = reward;

      // Определяем тип награды
      this.rewardType = typeof reward === 'number' ? 'WCoin' : 'item';

      // Обновляем баланс или просто показываем уведомление
      if (this.rewardType === 'WCoin') {
        scoreStore.add(reward);
        toast.success(`Вы получили ${reward} WCoin!`);
      } else {
        toast.success(`Вам выпал предмет: ${reward}. Сделайте скриншот экрана и отправьте в чат!`, { timeout: 10000 });
      }
    },
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
}

.buy-button:hover {
  background: #f0f0f0;
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
</style>