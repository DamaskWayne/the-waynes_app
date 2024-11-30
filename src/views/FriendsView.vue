<template>
  <div class="text-content">
    <h1>Твои друзья</h1>

    <div class="center">
      <button class="referal" @click="copy">{{ referalText }}</button>
    </div>

    <h3 v-if="friends.length === 0">Вы еще не пригласили никого</h3>

    <ul class="list">
      <li class="list-item" v-for="friend in friends" :key="friend.id">
        {{ friend.name }}
        <span class="list-btn done">500</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useTelegram } from '@/services/telegram'
import { useAppStore } from '@/stores/app'
import { ref, computed } from 'vue'

const app = useAppStore()
const { user } = useTelegram()

const referalText = ref('Нажмите, чтобы получить реф.ссылку')

const friends = computed(() => Object.keys(app.user.friends).map((id) => ({
  id,
  name: app.user.friends[id],
})))

function copy() {
  navigator.clipboard.writeText('https://t.me/the_waynes_bot?start=' + user?.id)
  referalText.value = 'Ваша ссылка готова!'
}
</script>