import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

// Containers
const ContainerMain = () => import('@/containers/ContainerMain')

// Views
const Worldmap = () => import('@/views/worldmap')
const Users = () => import('@/views/users')
const Devices = () => import('@/views/devices')

// Views - Pages
const Login = () => import('@/views/pages/login')
const Logout = () => import('@/views/pages/logout')

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
      path: '/home',
      name: 'Home',
      component: ContainerMain,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '/worldmap',
          name: 'worldmap',
          component: Worldmap,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: '/users',
          name: 'users',
          component: Users,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: '/devices',
          name: 'devices',
          component: Devices,
          meta: {
            requiresAuth: true
          },
        },
      ]
    },
    {
      path: "/",
      name: "login",
      component: Login,
    },
    {
      path: "/logout",
      name: "logout",
      component: Logout,
      meta: {
        requiresAuth: true
      },
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
              path: "/"
            });
          })
      } else if(store.state.authorized) {
        next();
      } else {
        next({
          path: "/"
        });
      }
    } else {
      next();
    }
  });

export default router;
