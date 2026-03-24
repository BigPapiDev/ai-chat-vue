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
    // TODO Fase 4+: Add additional routes if needed
    // Examples:
    // {
    //   path: '/settings',
    //   name: 'settings',
    //   component: () => import('../views/SettingsView.vue')
    // },
    // {
    //   path: '/chat/:id',
    //   name: 'chat',
    //   component: HomeView,
    //   props: true
    // }
  ],
})

export default router
