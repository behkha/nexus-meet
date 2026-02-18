import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "#/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/auth",
    name: "auth",
    component: () => import("../views/AuthView.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("../components/auth/LoginForm.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initializeAuth();

  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = !!authStore.accessToken;

  if (requiresAuth && !isAuthenticated) {
    next({
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    });
    return;
  }

  if (to.name === "login" && isAuthenticated) {
    return next({ name: "home" });
  }

  next();
});

export default router;
