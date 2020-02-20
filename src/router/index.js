import Vue from 'vue'
import Router from 'vue-router'

// Containers
const ContainerMain = () => import('@/containers/ContainerMain')

// Views
const Users = () => import('@/views/users')
const Devices = () => import('@/views/devices')
const Positions = () => import('@/views/positions')
const StaticLayers = () => import('@/views/staticlayers')

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
        {
          path: '/positions',
          name: 'positions',
          component: Positions,
          meta: {
            requiresAuth: true
          },
        },
        {
          path: '/staticlayers',
          name: 'staticlayers',
          component: StaticLayers,
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
      if (localStorage.getItem("jwt") == null) {
        next({
          path: "/"
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });

export default router;
