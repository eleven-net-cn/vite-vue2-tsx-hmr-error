/* eslint-disable  */

// import Vue from 'vue';
// import App from './App.vue';
import TestComp from "./TestComp.vue";
import "./dist_devtools/vendors.css";
import "./dist_devtools/app.css";
import "./dist_devtools/vendors";

// @ts-ignore
window.Test = TestComp;

require("./dist_devtools/app");

// Vue.config.productionTip = false;

// new Vue({
//   render: (h) => h(App),
// }).$mount('#app');
