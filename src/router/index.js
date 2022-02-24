import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

// Views
const TheLayout = () => import('@/layouts/TheLayout')

const WorldMap = () => import('@/views/WorldMap')
const UserList = () => import('@/views/UserList')
const DeviceList = () => import('@/views/DeviceList')

const UserLogin = () => import('@/views/UserLogin')
const UserLogout = () => import('@/views/UserLogout')

// Prevent 'NavigationDuplicated' when navigating to the same path
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
};

Vue.use(Router)

const router = new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({ y: 0 }),
  routes: configRoutes()
})

function configRoutes () {
  return [
    {
      path: "/",
      redirect: "worldmap"
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
      path: "/login",
      name: "login",
      component: UserLogin,
    },
    {
      path: "/logout",
      name: "logout",
      component: UserLogout,
      meta: {
        requiresAuth: true
      },
    },
    {
      path: "/*",
      redirect: "/"
    },
  ]
}

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
