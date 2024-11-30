<template>
  <div class="game-container">
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

    <RouterLink to="/farm" custom v-slot="slotProps">
      <i
        class="menu-button fa fa-leaf"
        :class="{ active: slotProps?.isActive }"
        @click="slotProps?.navigate"
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
    <RouterLink to="/box" custom v-slot="slotProps">
      <i
        class="menu-button fa fa-box"
        :class="{ active: slotProps?.isActive }"
        @click="slotProps?.navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'

</script>
