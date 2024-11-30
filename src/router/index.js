import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/tasks',
			name: 'tasks',
			component: () => import('../views/TasksView.vue'),
		},
		{
  			path: '/farm',
  			name: 'farm',
  			component: () => import('../views/FarmView.vue'),
		},
		{
			path: '/friends',
			name: 'friends',
			component: () => import('../views/FriendsView.vue'),
		},
		{
			path: '/box',
			name: 'box',
			component: () => import('../views/BoxView.vue'), 
		},
	],
})

export default router
