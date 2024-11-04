import { getOrCreateUser, registerRef, fetchTasks, completeTask } from '@/api/app'
import { defineStore } from 'pinia'
import { useScoreStore } from './score'
import { useTelegram } from '@/services/telegram'

const { user } = useTelegram()

export const useAppStore = defineStore('app', {
    state: () => ({
        user: {},
        tasks: [],
    }),
    actions: {
        async init(ref) {
            this.user = await getOrCreateUser()
            
            const score = useScoreStore()

            score.setScore(this.user.score)

            if (ref && +ref !== +this.user.telegram) {
                await registerRef(user?.first_name ?? 'Waynes', ref)
            }
        },
        async completeTask(task) {
            if (this.user?.tasks?.[task.id]) return
            await completeTask(this.user, task)
            this.user.tasks = {
							...this.user.tasks,
							[task.id]: true,
						}
        },
        async fetchTasks() {
            this.tasks = await fetchTasks()
        },
    },
})