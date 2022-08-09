// @ts-nocheck
import Vue from 'vue';
import store from '@/store';

export default (Dialog, data = {}) => new Promise((resolve, reject) => new Vue({
  store,
  name: 'OpenDialog',

  created() {
    this.$mount();
    document.body.appendChild(this.$el);
  },

  destroyed() {
    document.body.removeChild(this.$el);
  },

  methods: {
    onResolve(payload) {
      resolve(payload);
      this.$destroy();
    },

    onReject(payload) {
      reject(payload);
      this.$destroy();
    }
  },

  render(h) {
    return h('div', { class: 'open-dialog' }, [
      h(Dialog, {
        ...data,
        on: {
          ...data.on,
          resolve: this.onResolve,
          reject: this.onReject
        }
      })
    ]);
  }
}));
