<template>
  <div class="clicker-container">
    <EnergyProgress ref="energyRef" />
    <div class="header">
      <h2 class="score">{{ headerText }}</h2>
    </div>
    <div class="circle">
      <img
        @click="handleIncrement"
        ref="img"
        id="circle"
        src="@/assets/WAYNES.png"
        :class="{ 'disabled': isLoading || energyRef?.energy <= 0 }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useScoreStore } from '@/stores/score';
import EnergyProgress from '@/components/EnergyProgress.vue';
import { useToast } from 'vue-toastification';

const img = ref(null);
const energyRef = ref(null);
const isLoading = ref(true); // Изначально заблокировано
const headerText = ref('Временно не доступно...');
const toast = useToast();
const store = useScoreStore();

// Снимаем блокировку через 2 секунды после загрузки
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false; // Разрешаем клики
    headerText.value = 'Кликай по «WAYNES»';
  }, 2000000000);
});

// Основная логика обработки клика
function handleIncrement(event) {
  const energyComponent = energyRef.value;
  if (!energyComponent || energyComponent.energy <= 0) {
    toast.error('Недостаточно энергии для клика!');
    return;
  }

  store.add(1);
  energyComponent.decreaseEnergy();

  const rect = event.target.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - rect.width / 2;
  const offsetY = event.clientY - rect.top - rect.height / 2;
  const DEG = 40;

  img.value.style.setProperty('--tiltX', `${(offsetY / rect.height) * DEG}deg`);
  img.value.style.setProperty('--tiltY', `${(offsetX / rect.width) * -DEG}deg`);

  setTimeout(() => {
    img.value.style.setProperty('--tiltX', `0deg`);
    img.value.style.setProperty('--tiltY', `0deg`);
  }, 300);

  const plusOne = document.createElement('div');
  plusOne.classList.add('plus-one');
  plusOne.textContent = '+1';
  plusOne.style.left = `${event.clientX - rect.left}px`;
  plusOne.style.top = `${event.clientY - rect.top}px`;
  img.value.parentElement.appendChild(plusOne);

  setTimeout(() => plusOne.remove(), 2000);
}
</script>

<style scoped>
.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>