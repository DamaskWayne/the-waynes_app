<template>
  <div class="app-container">
    <div class="snow-container">
      <div v-for="i in total" :key="i" class="snowflake"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Snowfall",
  data() {
    return {
      total: 200, // Количество снежинок
    };
  },
};
</script>

<style lang="scss">
@use "sass:math";

// Определяем функцию random_range
@function random_range($min, $max) {
  @return $min + math.random() * ($max - $min);
}

// Убедитесь, что контейнер приложения занимает весь экран
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

// Контейнер для снежинок
.snow-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // Чтобы снежинки не мешали другим элементам
}

// Стили для снежинок
.snowflake {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;

  $total: 200;

  @for $i from 1 through $total {
    $random-x: math.random() * 100vw;
    $random-offset: random_range(-100, 100) * 1vw;
    $random-x-end: $random-x + $random-offset;
    $random-x-end-yoyo: $random-x + math.div($random-offset, 2);
    $random-yoyo-time: random_range(0.3, 0.8);
    $random-yoyo-y: $random-yoyo-time * 100vh;
    $random-scale: math.random();
    $fall-duration: random_range(10, 30) * 1s;
    $fall-delay: math.random() * -30s;

    &:nth-child(#{$i}) {
      opacity: math.random();
      transform: translate($random-x, -10px) scale($random-scale);
      animation: fall-#{$i} $fall-duration $fall-delay linear infinite;
    }

    @keyframes fall-#{$i} {
      #{math.percentage($random-yoyo-time)} {
        transform: translate($random-x-end, $random-yoyo-y) scale($random-scale);
      }

      to {
        transform: translate($random-x-end-yoyo, 100vh) scale($random-scale);
      }
    }
  }
}
</style>