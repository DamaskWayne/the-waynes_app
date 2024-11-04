<template>
  <div class="game-container">
    <!-- Контейнер для множества падающих изображений -->
    <div class="falling-container">
      <img v-for="n in pumpkinCount" :key="'pumpkin' + n" src="../assets/pumpkin.png" alt="Pumpkin" class="falling pumpkin" />
      <img v-for="n in waynesCount" :key="'waynes' + n" src="../assets/WAYNES.png" alt="WAYNES" class="falling waynes" />
    </div>
  </div>
  <div class="menu">
    <RouterLink to="/" custom v-slot="{ isActive, navigate }">
      <i
        class="menu-button fa fa-bullseye"
        :class="{ active: isActive }"
        @click="navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>
    <RouterLink to="/friends" custom v-slot="{ isActive, navigate }">
      <i
        class="menu-button fa fa-users"
        :class="{ active: isActive }"
        @click="navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>

    <RouterLink to="/tasks" custom v-slot="slotProps">
      <i
        class="menu-button fa fa-tasks"
        :class="{ active: slotProps?.isActive }"
        @click="slotProps?.navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'

export default {
  data() {
    return {
      pumpkinCount: 20, // количество тыкв
      waynesCount: 1,   // количество изображений WAYNES
    }
  }
}
</script>
