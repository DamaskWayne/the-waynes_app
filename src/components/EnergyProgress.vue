<template>
  <div class="energy-container" @click="decreaseEnergy">
    <div class="energy-bar" :style="{ width: energy + '%' }"></div>
    <span class="energy-text">{{ energy }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue';
import { updateEnergy, fetchEnergy } from '@/api/app'

const energy = ref(maxEnergy);
const maxEnergy = 100;
const energyRecoveryInterval = 60000;
const recoveryRate = 1;

// Функция для уменьшения энергии
function decreaseEnergy() {
  if (energy.value > 0) {
    energy.value -= 1
    updateEnergy(energy.value) // Обновляем значение энергии в базе
  }
}

defineExpose({
  decreaseEnergy,
  energy // Экспортируем энергию как публичное свойство
});

async function calculateRecoveredEnergy(savedEnergy, lastUpdated) {
  const now = Date.now();
  const timeElapsed = now - new Date(lastUpdated).getTime();

  // Рассчитываем, сколько энергии восстановилось
  const energyRecovered = Math.floor(timeElapsed / energyRecoveryInterval) * recoveryRate;
  return Math.min(savedEnergy + energyRecovered, maxEnergy); // Ограничиваем значение энергией maxEnergy
}

let recoveryInterval;
onMounted(async () => {
  const { energy: savedEnergy, lastUpdated } = await fetchEnergy() || { energy: maxEnergy, lastUpdated: Date.now() };
  energy.value = await calculateRecoveredEnergy(savedEnergy, lastUpdated);

  recoveryInterval = setInterval(() => {
    if (energy.value < maxEnergy) {
      energy.value += 1;
      updateEnergy(energy.value);
    }
  }, energyRecoveryInterval);
});
</script>

<style scoped>
.disabled {
  opacity: 0.5; /* Делаем изображение полупрозрачным */
  pointer-events: none; /* Отключаем события мыши */
}

.energy-container {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 150px;
  height: 20px;
  background: #4b402e;
  border-radius: 10px;
  overflow: hidden;
  cursor: default;
}

.energy-bar {
  height: 100%;
  background: #32cd32;
  transition: width 0.2s ease;
}

.energy-text {
  position: absolute;
  width: 100%;
  text-align: center;
  top: 0;
  left: 0;
  color: #fff;
  font-size: 12px;
}
</style>