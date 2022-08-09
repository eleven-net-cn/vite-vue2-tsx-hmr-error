// @ts-nocheck
import Vue from 'vue';
import 'lodash';
import mihoyoAdminCookie from 'mihoyo-admin-cookie';

import registerFrameworkServices from '@framework';
import { memoryCache } from '@cacheService';
import { environment } from 'appConfig';
import store from '@/store';
import router from '@/router';

import app from './app.vue';
import registerFilters from './configs/filterConfigs/registerFilters';
import registerComponent from './configs/componentConfigs/registerComponent';
import registerGlobalEvent from './configs/eventConfigs/registerEvent';
import './index.scss';

window.PUZZLE_ADMIN_ENVIRONMENT = environment;

// 设置全局变量是否为海外
const opArea = mihoyoAdminCookie.getOpArea();
window.PUZZLE_ADMIN_IS_SEA = opArea !== 'cn' && opArea !== 'all';

// 注册全局事件
registerGlobalEvent(Vue);
// 注册全局组件
registerComponent(Vue);

// 注册过滤器
registerFilters(Vue);

// 注册框架服务
registerFrameworkServices(Vue).then((allLibs) => {
  const vueItem = new Vue({
    el: '#root',
    components: { app },
    template: '<app />',
    store,
    router,
    ...allLibs
  });

  // 将vue对象存入缓存
  memoryCache.set('vueItem', vueItem);
});
