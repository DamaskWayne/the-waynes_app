<template>
  <div>
    <div v-if="!isClickerVisible" class="box-menu-container">
      <div class="menu-background">
        <h1>Выберите мини-игру</h1>
        <div class="box-list">
          <div class="box-item">
            <div class="game-title">
              <span>Кликер</span>
            </div>
            <button class="play-button" @click="showClicker">Играть</button>
          </div>
        </div>
      </div>
    </div>

    <ClickerGame v-else @exit="exitClicker" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ClickerGame from '@/games/ClickerGame.vue';

const isClickerVisible = ref(false);

function showClicker() {
  isClickerVisible.value = true;
}

function exitClicker() {
  isClickerVisible.value = false;
}
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
  display: inline-block;
  padding: 10px 20px;
  background: #ffffff;
  color: #000000;
  border-radius: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Кнопка "Играть" */
.play-button {
  background: white;
  color: black;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
}

.play-button:hover {
  background: #f0f0f0;
}
</style>