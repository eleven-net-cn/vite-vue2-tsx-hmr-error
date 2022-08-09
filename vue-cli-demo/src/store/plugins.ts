import {
  // Store,
  Plugin,
} from 'vuex';
// import hotkeys from 'hotkeys-js';

// import Vue from 'vue';
import { IState } from '@/types';
// import history from '@/utils/historyRecord';

// const locked = false; // 来自undo,redo产生的变化时锁住不push

// export const historyRecordPlugin = (store: Store<IState>) => {
//   const state2watch = ({
//     baseInfo,
//     nodes,
//     activeNodeId
//   }: IState) => JSON.stringify({
//     baseInfo,
//     nodes,
//     activeNodeId
//   });

//   const watchCallback = (newVal) => {
//     // console.log('new history: ', newVal === oldVal, locked, JSON.parse(newVal));
//     if (locked) {
//       locked = false;
//       return;
//     }
//     console.log('push new history: ', JSON.parse(newVal));
//     history.push(newVal, { force: true });
//     // console.log('unlock');
//     locked = false;
//   };
//   const watchOptions = {
//     immediate: false,
//     deep: false
//   };

//   store.watch(state2watch, watchCallback, watchOptions);
// };

// export const shortCutPlugin = (store: Store<IState>) => {
//   // listenShortCut();
//   const shortCutsMap = {
//     backspace: deleteNode,
//     'ctrl+z': undo,
//     'cmd+z': undo,
//     'ctrl+y': redo,
//     'cmd+shift+z': redo,
//   };
//   const hotkeysScope = Object.keys(shortCutsMap).join(',');
//   hotkeys(hotkeysScope, (event, handler) => {
//     console.log('hotkeys: ', event, handler);
//     const fn = shortCutsMap[handler.key];
//     fn(event);
//   });

//   async function deleteNode() {
//     console.log('deleteNode triggered');
//     if (!store.state.activeNodeId) {
//       return;
//     }
//     try {
//       await Vue.prototype.$confirm('确认删除该组件?', '提示', {
//         confirmButtonText: '确定',
//         cancelButtonText: '取消',
//         type: 'warning'
//       });
//       store.commit('removeNode', store.state.activeNodeId);
//     } catch (err) {
//       // this.activated = true;
//     }
//   }

//   function undo() {
//     // console.log('undo');
//     const newVal = history.undo();
//     if (newVal !== null) {
//       // console.log('lock');
//       locked = true;
//       store.commit('updateHistory', JSON.parse(newVal));
//     }
//   }
//   function redo() {
//     // console.log('redo');
//     const newVal = history.redo();
//     if (newVal !== null) {
//       // console.log('lock');
//       locked = true;
//       store.commit('updateHistory', JSON.parse(newVal));
//     }
//   }
// };

const plugins: Plugin<IState>[] = [
  // historyRecordPlugin,
  // shortCutPlugin,
];

export default plugins;
