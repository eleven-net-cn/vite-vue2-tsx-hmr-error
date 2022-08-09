/**
 * 我们将 event-bus 封装为一个插件.
 */

const globalEventPlugin = {
  install(Vue) {
    const EventBus = new Vue({});
    Vue.prototype.$gemit = EventBus.$emit.bind(EventBus);
    Vue.prototype.$gon = EventBus.$on.bind(EventBus);
    Vue.prototype.$gonce = EventBus.$once.bind(EventBus);
    Vue.prototype.$goff = EventBus.$off.bind(EventBus);
  }
};

export default (Vue) => {
  Vue.use(globalEventPlugin);
};
