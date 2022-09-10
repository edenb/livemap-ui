import { createWebHistory, createRouter } from 'vue-router'
import store from '@/store'
const TheLayout = () => import('@/layouts/TheLayout')
const WorldMap = () => import('@/views/WorldMapNative')
const UserList = () => import('@/views/UserList')
const DeviceList = () => import('@/views/DeviceList')
const UserLogin = () => import('@/views/UserLogin')
const UserLogout = () => import('@/views/UserLogout')

const routes = [
  {
    path: '',
    redirect: 'worldmap'
  },
  {
    path: '',
    name: '',
    component: TheLayout,
    children: [
      {
        path: 'worldmap',
        name: 'worldmap',
        component: WorldMap,
        meta: {
          requiresAuth: true
        },
      },
      {
        path: 'users',
        name: 'users',
        component: UserList,
        meta: {
          requiresAuth: true
        },
      },
      {
        path: 'devices',
        name: 'devices',
        component: DeviceList,
        meta: {
          requiresAuth: true
        },
      },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: UserLogin,
  },
  {
    path: '/logout',
    name: 'logout',
    component: UserLogout,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: 'worldmap',
    meta: {
      requiresAuth: false
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    console.log(`Authorized: ${store.state.authorized}`)
    // Re-authenticate if a token is present but user not authorized
    if(store.state.token!=='' && !store.state.authorized) {
      console.log(`Start re-authorize`)
      store.dispatch('setUserToken', store.state.token)
        .then(() => {
          console.log(`Re-authorized`);
          next();
        })
        .catch(() => {
          next({
            path: "/login"
          });
        })
    } else if(store.state.authorized) {
      next();
    } else {
      next({
        path: "/login"
      });
    }
  } else {
    next();
  }
});

export default router;
