import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/store.js";
const TheLayout = () => import("@/layouts/TheLayout.vue");
const WorldMap = () => import("@/views/WorldMap.vue");
const UserList = () => import("@/views/UserList.vue");
const DeviceList = () => import("@/views/DeviceList.vue");
const UserLogin = () => import("@/views/UserLogin.vue");
const UserLogout = () => import("@/views/UserLogout.vue");

const routes = [
  {
    path: "",
    redirect: "worldmap",
  },
  {
    path: "",
    name: "",
    component: TheLayout,
    children: [
      {
        path: "worldmap",
        name: "worldmap",
        component: WorldMap,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "users",
        name: "users",
        component: UserList,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "devices",
        name: "devices",
        component: DeviceList,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: UserLogin,
  },
  {
    path: "/logout",
    name: "logout",
    component: UserLogout,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "worldmap",
    meta: {
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const authStore = useAuthStore();
    // Re-authenticate if a token is present but user not authorized
    if (authStore.token && !authStore.authorized) {
      try {
        await authStore.setAuthorized(authStore.token);
        next();
      } catch {
        next({ path: "/login" });
      }
    } else if (authStore.authorized) {
      next();
    } else {
      next({ path: "/login" });
    }
  } else {
    next();
  }
});

export default router;
