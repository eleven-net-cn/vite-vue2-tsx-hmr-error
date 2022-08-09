import Vue from 'vue';
import { environment } from 'appConfig';
import { DEV_NAME_PREFIX, STORAGE_KEYS } from '@/constants/dev';
import * as storage from '@/utils/localStorage';
import { IComp } from '@/types';
import { formatComp } from '@/models/merlin';

export default {
  namespaced: true,
  state() {
    return {
      websocket: null,
      error: null,
      enabled: ['development', 'test'].includes(environment) && !!storage.get(STORAGE_KEYS.ENABLED, false),
      server: storage.get(STORAGE_KEYS.SERVER, {
        baseURL: 'localhost:3000',
        protocol: 'http',
      }),
      // 将会替换线上同名组件的本地组件
      _interceptingComps: storage.get(STORAGE_KEYS.INTERCEPTING_COMPS, {}),
      // 被本地组件替换的线上组件
      interceptedComps: {},
      lastModified: +new Date(),
      devCompType: storage.get(STORAGE_KEYS.DEV_COMP_TYPE, 'component'), // 调试组件的类型（普通组件/页面级组件）
    };
  },
  getters: {
    compListArray(store, getters, rootStore, rootGetters) {
      return rootGetters.compListArray.filter((item) => item.__dev__ && !store._interceptingComps[item.name]);
    },
    compListArrayLoaded(store, getters) {
      return getters.compListArray.filter(({ __dev__: { state } }) => state === 'done');
    },
    interceptingComps(store) {
      return store.enabled ? store._interceptingComps : {};
    },
    interceptedCompArray(store) {
      return Object.values(store.interceptedComps);
    },
  },
  mutations: {
    setWebsocket(store, ws) {
      store.websocket = ws;
    },
    setServer(store, server) {
      store.server = server;
      storage.set(STORAGE_KEYS.SERVER, server);
    },
    setError(store, error) {
      store.error = error;
    },
    enable(store, yes) {
      store.enabled = yes;
      storage.set(STORAGE_KEYS.ENABLED, yes);
    },
    setInterceptingComp(store, { compName, devCompName }) {
      if (!devCompName) {
        Vue.delete(store._interceptingComps, compName);
      } else if (compName !== devCompName) {
        const payload = { compName, devCompName };
        Vue.set(store._interceptingComps, compName, payload);
      }
      storage.set(STORAGE_KEYS.INTERCEPTING_COMPS, store._interceptingComps);
    },
    addInterceptedComps(store, { compName, version, devCompName }) {
      const key = `${compName}@${version || 'latest'}`;
      if (!store.interceptedComps[key]) {
        Vue.set(store.interceptedComps, key, {
          compName,
          version,
          devCompName,
          cnt: 0,
        });
      }
      store.interceptedComps[key].cnt += 1;
    },
    updateLastModified(store, timestamp) {
      store.lastModified = timestamp;
    },
    setDevCompType(store, type) {
      store.devCompType = type;
      storage.set(STORAGE_KEYS.DEV_COMP_TYPE, type);
    },
  },
  actions: {
    connectWebsocket({ state: store, commit, dispatch }) {
      if (store.websocket) {
        store.websocket.close(4001, 'refresh');
      }

      const { baseURL, protocol } = store.server;
      const websocket = new WebSocket(`${protocol === 'https' ? 'wss' : 'ws'}://${baseURL}/ws`);
      websocket.onmessage = async ({ data }) => {
        try {
          const message = JSON.parse(data);
          if (message && message.type === 'compilation.state') {
            const { name, state } = message;
            const compName = `${DEV_NAME_PREFIX}${name}`;

            // 组件构建完成，重新拉取
            if (state === 'done') {
              await dispatch('fetchCompModule', { compName, version: 'latest' }, { root: true });
              commit('updateLastModified', +new Date());
            }
            dispatch('updateCompDev', { compName, state });
          }
        } catch (e) {
          console.error(e);
          console.warn(`Invalid message from dev server: ${data}`);
        }
      };
      commit('setWebsocket', websocket);
    },
    async refreshCompList({
      commit, dispatch, rootState: rootStore, state: store
    }, { baseURL, protocol } = store.server) {
      commit('setServer', { baseURL, protocol });

      try {
        const packageList = await fetch(`${protocol}://${baseURL}/getPackageList`).then((res) => res.json());
        const devCompList: Record<string, IComp> = Object.fromEntries(packageList.map((comp) => [comp.module_name, formatComp(comp)]));
        dispatch('connectWebsocket');

        const compList = { ...(rootStore.compList || {}) };
        Object.values(devCompList).forEach(({ name: oriName, __dev__: dev = {}, ...rest }) => {
          const name = `${DEV_NAME_PREFIX}${oriName}`;
          compList[name] = {
            ...rest,
            name,
            type: 'FEModuleTypeFE',
            __dev__: {
              ...dev,
              oriName,
              cdnBaseURL: `${protocol}://${baseURL}/packages/${oriName}`,
              namePrefix: DEV_NAME_PREFIX,
              state: '',
            },
          };
        });
        commit('updateCompList', compList, { root: true });
        commit('setError', null);
      } catch (e) {
        console.error(e);
        commit('setError', e);
      }
    },
    // FIXME: 在 action 中修改了 state？
    updateCompDev({ rootState: rootStore }, { compName, ...dev }) {
      const comp = rootStore.compList[compName];
      if (comp) {
        Vue.set(comp, '__dev__', comp.__dev__ ? { ...comp.__dev__, ...dev } : { ...dev });
      }
    },
    async ensureInterceptingDevCompReady({
      state: store, rootState: rootStore, dispatch, commit, getters
    }, { compName, version, onReady }) {
      const intercepting = getters.interceptingComps[compName];

      if (intercepting && intercepting.devCompName) {
        const { devCompName } = intercepting;

        try {
          if (!rootStore.compList[devCompName]) {
            if (!store.websocket) {
              await dispatch('refreshCompList');
            }
            await dispatch('fetchCompModule', { compName: devCompName, version: 'latest' }, { root: true });
          }

          const devComp = rootStore.compList[devCompName];
          dispatch('updateCompDev', { compName, ...devComp.__dev__ });

          onReady?.(devComp);
          commit('addInterceptedComps', { compName, version, devCompName });
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
};
