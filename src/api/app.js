import supabase from "@/services/supabase";
import { useTelegram } from '@/services/telegram'
import { useScoreStore } from '@/stores/score'

const { user } = useTelegram()

const MY_ID = user?.id ?? 4252

export async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*')
    return data
}

export async function getOrCreateUser() {
	// Получаем информацию о пользователе по его telegram ID
	const { data: existingUser } = await supabase
		.from('users')
		.select()
		.eq('telegram', MY_ID)
		.single()

	if (existingUser) {
		// Если пользователь существует, обновляем его никнейм, если он изменился
		if (existingUser.nickname !== user?.username) {
			await supabase
				.from('users')
				.update({ nickname: user?.username })
				.eq('telegram', MY_ID)
		}
		return existingUser
	}

	// Если пользователя нет в базе, создаем нового
	const newUser = {
		telegram: MY_ID,
		nickname: user?.username || 'Без ника', // Если нет ника, записываем 'Без ника'
		friends: {},
		tasks: {},
		score: 0,
		energy: 100,
	}

	// Вставляем нового пользователя в базу данных
	await supabase.from('users').insert(newUser)
	return newUser
}

export async function updateScore(score) {
    await supabase.from('users').update({ score }).eq('telegram', MY_ID)
}

export async function updateEnergy(energy) {
	await supabase
		.from('users')
		.update({ energy, lastUpdated: new Date().toISOString() })
		.eq('telegram', MY_ID)
}

export async function fetchEnergy() {
	const { data } = await supabase
		.from('users')
		.select('energy, lastUpdated')
		.eq('telegram', MY_ID)
		.single()
	return { energy: data?.energy, lastUpdated: data?.lastUpdated }
}

export async function registerRef(userName, refId) {
	const { data } = await supabase.from('users').select().eq('telegram', +refId)

	const refUser = data[0]

	// Проверка, был ли уже приглашён этот пользователь (по его ID в friends)
	if (refUser.friends && refUser.friends[MY_ID]) {
		return // Если уже есть, ничего не делаем
	}

	await supabase
		.from('users')
		.update({
			friends: { ...refUser.friends, [MY_ID]: userName },
			score: refUser.score + 500,
		})
		.eq('telegram', +refId)
}

export async function completeTask(user, task) {
    const score = useScoreStore()
    const newScore = score.score + task.amount
    score.setScore(newScore)

    await supabase
			.from('users')
			.update({
				tasks: { ...user.tasks, [task.id]: true },
                score: newScore,
			})
			.eq('telegram', MY_ID)
}