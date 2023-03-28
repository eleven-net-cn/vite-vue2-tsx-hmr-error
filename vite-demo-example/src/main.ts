import Vue from 'vue';
import App from './App.vue';
import { queryList } from './xhr';

import './assets/main.css';

queryList().then((res: any) => {
  console.log('res: ', res);
});

new Vue({
  render: (h) => h(App),
}).$mount('#app');
