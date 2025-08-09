import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MainPage.vue') },
      {
        path: '/data',
        component: () => import('pages/DataPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      { path: '/scenes', component: () => import('components/scenes/ScenesPage.vue') },
      {
        path: '/services',
        component: () => import('pages/ServicesPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
