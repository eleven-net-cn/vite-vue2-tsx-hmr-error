const requireContext = require.context('./packages', false, /^.*\.vue$/);
const packages = {};
requireContext.keys().forEach(key => {
  packages[`pz-${key.slice(2, -4).replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`] = requireContext(key).default;
});

export default {
  install(Vue) {
    Object.keys(packages).forEach(name => {
      Vue.component(name, packages[name]);
    });
  }
};
