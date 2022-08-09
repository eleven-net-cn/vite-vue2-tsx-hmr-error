import Vue from 'vue';
import Vuex from 'vuex';

import { IState } from '@/types';
import initState from './initState';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import plugins from './plugins';
import dev from './modules/dev';

Vue.use(Vuex);

export default new Vuex.Store<IState>({
  // strict: process.env.NODE_ENV !== 'production',
  state: initState,
  getters,
  mutations,
  actions,
  plugins,
  modules: { dev }
});
