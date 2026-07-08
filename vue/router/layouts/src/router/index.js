import { createWebHistory, createRouter } from "vue-router";
import store from '@/store/'
//layouts
import ClientLayout from "@/layouts/client-layout.vue";
import AdminLayout from "@/layouts/admin-layout.vue";

const routes = [
  {
    path:'/',
    nme:'client-layout',
    component: ClientLayout,
    children:[
      {
        path: "/",
        name: "home",
        component: () => import('../views/client/home.vue'),
        meta:{title: 'Home'}
      }
    ]
  },
  {
    path: "/admin",
    name: "admin-layout",
    component: AdminLayout,
    beforeEnter: (to, from) => {
      if(!store.state.auth || store.state.auth != 'Mesto'){
        return {path: '/'}
      }
    },
    children:[
      {
        path:'/admin',
        name:'dashboard',
        component: () => import('../views/admin/dashboard.vue'),
        meta:{title: 'Dashboard'}
      },
      {
        path:'/admin/posts',
        name:'posts',
        component: () => import('../views/admin/posts.vue'),
        meta:{title: 'Posts'}
      },
      {
        path:'/posts/:id',
        name:'details',
        component: () => import('../views/admin/details.vue'),
        meta:{title: 'Details'}
      }
    ]
  },
  {
    path: "/:pathName(.*)",
    name: "notfound",
    component: () => import('../views/notfound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    return {
      top:500
    }
  },
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next()
})
export default router;
