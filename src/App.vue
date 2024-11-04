<template>
  <main class="game" v-if="loaded">
    <div class="page">
      <div ref="fallingContainer" class="falling-container"></div>
      <RouterView />
    </div>
    <TheMenu />
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
import TheMenu from './components/TheMenu.vue'
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useTelegram } from '@/services/telegram'
import pumpkinImg from './assets/pumpkin.png'
import waynesImg from './assets/WAYNES.png'

const loaded = ref(false)
const app = useAppStore()
const fallingContainer = ref(null);

const { tg } = useTelegram()

const urlParams = new URLSearchParams(window.location.search)

app.init(urlParams.get('ref')).then(() => {
    loaded.value = true
  })

onMounted(() => {
  tg.ready()

  tg.expand()

  const createFallingElement = (type) => {
  const img = document.createElement('img');
  img.src = type === 'pumpkin' ? pumpkinImg : waynesImg; // Используем импортированные изображения
  img.classList.add('falling', type);

  const startX = Math.random() * 100 + '%';
  img.style.setProperty('--startX', startX);

  // Используем реф для доступа к контейнеру
    if (fallingContainer.value) {
      fallingContainer.value.appendChild(img);
    } else {
      console.error('falling-container не найден!');
    }

    // Удаляем элемент после окончания анимации
    img.addEventListener('animationend', () => {
      img.remove();
    });

  // Устанавливаем случайную задержку и продолжительность анимации
  const delay = Math.random() * 5 + 's'; // случайная задержка до 5 секунд
  const duration = Math.random() * 5 + 5 + 's'; // продолжительность от 5 до 10 секунд
  img.style.animationDelay = delay;
  img.style.animationDuration = duration;

  // Запускаем анимацию
  img.classList.add('start');
};

  const startFallAnimation = () => {
    // Создаём элементы каждые 1000 мс
    setInterval(() => {
      createFallingElement('pumpkin');
      createFallingElement('waynes');
    }, 1000); // Создаём новые элементы каждую секунду
  };

  startFallAnimation(); // Интервал запуска анимации
})
</script>


