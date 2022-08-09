// import Vue from 'vue'

// import App from './App.vue'
// import router from './router'

// import './assets/main.css'

// new Vue({
//   router,
//   render: (h) => h(App)
// }).$mount('#app')

import Test from "./Test.vue";
import "puzzle-admin-fe/dist_devtools/vendors.css";
import "puzzle-admin-fe/dist_devtools/app.css";
import "puzzle-admin-fe/dist_devtools/vendors";

// @ts-ignore
window.Test = Test;

import("puzzle-admin-fe/dist_devtools/app");