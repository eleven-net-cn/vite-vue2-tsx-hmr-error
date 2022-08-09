import Vue from 'vue';
import VueRouter from 'vue-router';

import home from '@/main/home/home.vue';

// import eventEdit from '@/main/edit';
// import eventList from '@/main/event';
// import componentList from '@/main/component';
// import templateList from '@/main/pageTemplate';

Vue.use(VueRouter);

const routerConfigs = [{
  path: '/',
  name: 'home',
  component: home,
  redirect: '/event-list',
  children: [
    {
      path: 'event-list',
      name: 'eventList',
      component: () => import(/* webpackChunkName: "eventList" */ '@/main/event/index.vue'),
    },
    {
      path: 'event-edit/:eventId',
      name: 'eventEdit',
      component: () => import(/* webpackChunkName: "edit" */ '@/main/edit/index.vue'),
    },
    {
      path: 'template-edit/:templateId',
      name: 'templateEdit',
      component: () => import(/* webpackChunkName: "edit" */ '@/main/edit/index.vue'),
    },
    {
      path: 'page-template',
      name: 'pageTemplate',
      component: () => import(/* webpackChunkName: "pageTemplate" */ '@/main/pageTemplate/index.vue'),
    }
  ]
}];

const router = new VueRouter({
  mode: 'hash',
  routes: routerConfigs,
});

export default router;
