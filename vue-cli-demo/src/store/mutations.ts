import Vue from 'vue';
import { MutationTree } from 'vuex';

import { setGlobalCompress } from '@puzzle-admin/upload';
import {
  IBaseInfo, IState, Platform, Position,
} from '@/types';
import * as utils from '@/utils';
import { resetBaseInfo, resetPlatMsg } from './initState';

const mutations: MutationTree<IState> = {
  // =========== 有关node的操作 ===========
  // 更新元素的编辑属性
  updateNodesEditOptionsTemporary(state, { id, options, type = 'update' }) {
    if (type === 'remove') {
      state.nodesEditOptions[id] = undefined;
      delete state.nodesEditOptions[id];
      return;
    }
    if (state.nodesEditOptions[id]) {
      state.nodesEditOptions[id] = {
        ...state.nodesEditOptions[id],
        ...options
      };
    } else {
      Vue.set(state.nodesEditOptions, id, options);
    }
  },
  updateNodesEditOptions(state, { node, options }) {
    const newOptions = {
      ...node.editOptions,
      ...options
    };
    Object.keys(newOptions).forEach(key => {
      Vue.set(node.editOptions, key, newOptions[key] ?? undefined);
    });
  },
  // 更新当前元素的boxStyle
  updateNodeBoxStyle(state, { node, options, reset }) {
    if (reset) {
      Vue.set(node, 'boxStyle', options);
      return;
    }
    const newBoxStyle = {
      ...node.boxStyle,
      ...options
    };
    Object.keys(newBoxStyle).forEach(key => {
      const newVal = newBoxStyle[key];
      if (node.boxStyle[key] === newVal) return;
      Vue.set(node.boxStyle, key, newVal || undefined);
    });
  },
  // 更新组件的option
  updateNodeOptions(state, { node, options, reset }) {
    if (reset) {
      Vue.set(node, 'options', options);
      return;
    }
    const newOptions = {
      ...node.options,
      ...options
    };
    Object.keys(newOptions).forEach(key => {
      Vue.set(node.options, key, newOptions[key] ?? undefined);
    });
  },
  // 更新组件的option
  updateNodeEvents(state, {
    node, index, options, del
  }) {
    if (del && !options) {
      node.events.splice(index, 1);
      return;
    }
    if (!node.events[index]) {
      Vue.set(node.events, index, options);
      return;
    }
    Object.keys(options).forEach(key => {
      Vue.set(node.events[index], key, options[key]);
    });
  },
  updateNodeMi18n(state, { node, name, options }) {
    if (!node.otherOptions.mi18n[name]) {
      Vue.set(node.otherOptions.mi18n, name, {
        ...options
      });
      return;
    }
    Object.keys(options).forEach(key => {
      Vue.set(node.otherOptions.mi18n[name], key, options[key]);
    });
  },
  updateNodeCustomState(state, { node, name, options }) {
    if (!node.otherOptions.customState[name]) {
      Vue.set(node.otherOptions.customState, name, {
        ...options
      });
      return;
    }
    Object.keys(options).forEach(key => {
      Vue.set(node.otherOptions.customState[name], key, options[key]);
    });
  },
  updateNodeOtherOptions(state, { node, options }) {
    const newOtherOptions = {
      ...node.otherOptions,
      ...options
    };
    Object.keys(newOtherOptions).forEach(key => {
      Vue.set(node.otherOptions, key, newOtherOptions[key] ?? undefined);
    });
  },
  // 更新node的某个属性
  updateNodeConfig(state, {
    node, options, del, keys = []
  }) {
    if (del) {
      keys.forEach(key => {
        Vue.set(node, key, undefined);
        delete node[key];
      });
      return;
    }
    Object.keys(options).forEach(key => {
      Vue.set(node, key, options[key]);
    });
  },
  // 根据父元素list和index定位，替换一个node
  replaceNode(state, { newNode, parentList, index }) {
    Vue.set(parentList, index, newNode);
  },

  // moveRootNode(state, { oldIndex, newIndex }) {
  //   const taget = state.nodes[oldIndex];
  //   state.nodes.splice(oldIndex, 1);
  //   state.nodes.splice(newIndex, 0, taget);
  // },

  // 更新一个node
  updateNode(state, { newConfig }) {
    state.nodes = utils.traverseNodes(state.nodes, (node) => {
      if (node.id === newConfig.id) {
        return {
          ...node,
          ...newConfig
        };
      }
      return node;
    });
  },
  addChildNode(state, {
    parentNode, config, index = 0
  }) {
    if (parentNode && !parentNode.children) {
      Vue.set(parentNode, 'children', [config]);
      return;
    }
    const parentList = parentNode?.children || state.nodes;
    parentList.splice(index, 0, config);
  },
  // 更新当前设备模式
  updatePlatform(state, newPlat: Platform) {
    state.platform = newPlat;
  },
  updateCompList(state, newValue) {
    state.compList = {
      ...newValue,
      ...state.compList
    };
  },
  // 更新组件信息
  updateComp(state, { compName, version, main }) {
    if (!state.compList[compName]) {
      Vue.set(state.compList, compName, {
        main,
        version
      });
      return;
    }
    state.compList[compName].main = main;
    state.compList[compName].version = version;
  },
  // 更新一整个nodes
  updateNodes(state, { newNodes = [] }) {
    newNodes = JSON.parse(JSON.stringify(newNodes));
    // 上边已经深拷贝过了，就不需要每个节点再拷贝一遍
    const fmtNodes = utils.traverseNodes(newNodes, (node) => utils.fmtConfig(node, false));
    state.nodes = fmtNodes;
  },
  // 更新baseInfo
  updateBaseInfo(state, newBaseInfo: IBaseInfo) {
    state.baseInfo = resetBaseInfo(newBaseInfo);
    // 设置项目是否开启压缩
    setGlobalCompress(state.baseInfo.uploadCompress);
  },
  // 初始化渠道信息
  initPlatMsg(state, {
    platform, pageMode, platMsg, flexibleOptions
  }) {
    state.platMsg = resetPlatMsg(platform, pageMode, platMsg, flexibleOptions);
  },
  // 更新渠道信息
  updatePlatMsg(state, options = {}) {
    Object.keys(options).forEach(key => {
      Vue.set(state.platMsg, key, options[key]);
    });
  },
  updatePreviewPlatList(state, options) {
    state.baseInfo.previewPlatList = options;
  },
  // 更新预览模式下额外的预览参数
  updatePreviewExtraParams(state, options) {
    state.previewExtraParams = options;
  },
  // 取消选择当前页面的激活元素
  updateActiveNodeId(state, newId: string) {
    state.activeNodeId = newId;
  },
  updateActiveNodeStateKey(state, newKey) {
    state.activeNodeStateKey = newKey || '';
  },
  // 更新当前编辑页面中的node的额外信息
  updateNodesProInPage({ nodesProInPage }, { id, message }) {
    Vue.set(nodesProInPage, id, message);
  },
  // 原始画布元素
  updateCanvasContainerEl(state, newEl:Element) {
    state.canvasContainerEl = newEl;
  },
  updateMi18nAdminUrl(state, url: string) {
    state.mi18nAdminUrl = url;
  },
  updateM18nGameBiz(state, gameBiz:string) {
    state.gameBiz = gameBiz;
  },
  updateM18nLang(state, lang:string) {
    state.lang = lang;
  },
  // 更新18n信息
  updateMi18nData(state, data = {}) {
    state.mi18nData = data;
  },
  // 设置画布的位移
  setCanvasTranslate(state, translateData) {
    state.canvasTransformData = {
      ...state.canvasTransformData,
      ...translateData
    };
  },
  // 设置画布的缩放
  setCanvasScale(state, scale) {
    state.canvasTransformData.scale = scale;
  },
  // 更新操作历史(undo, redo)
  updateHistory(state, newVal) {
    // console.log('updateHistory: ', newVal);
    const {
      nodes,
    } = newVal;
    state.nodes = nodes;
  },
  setCustomBaseInfo(state, customBaseInfo = {}) {
    Object.keys(customBaseInfo).forEach(key => {
      state.baseInfo[key] = customBaseInfo[key];
    });
  },
  changeCustomCanvas(state, options) {
    state.customCanvas = options;
  },
  // 添加屏幕
  addScreen(state, { screenData, index }) {
    if (index !== undefined) {
      // 加入到某个插槽里去
      state.screenList.splice(index, 0, screenData);
    } else {
      const blankIndex = state.screenList.findIndex(item => item === undefined);
      if (blankIndex === -1) {
        state.screenList.splice(1, 0, screenData);
      } else {
        // 如果某个前面的插槽为空，则放到前面去
        state.screenList[index] = screenData;
      }
    }
    // 重新执行render并补齐empty项
    state.screenList = [...state.screenList];
  },
  removeScreen(state, id) {
    const index = state.screenList.findIndex(item => id === item.id);
    if (index === -1) return;
    state.screenList.splice(index, 1);
  },
  // screenid设置为
  updateScreen(state, { index, options }) {
    const newOptions = {
      ...state.screenList[index],
      ...options
    };
    Vue.set(state.screenList, index, newOptions);
  },
  // 拿取原始画布位于屏幕的信息
  resetCanvasClientData(state) {
    const {
      left, top, width, height
    } = state.canvasContainerEl!.getBoundingClientRect();
    state.canvasTransformData.offsetLeft = left;
    state.canvasTransformData.offsetTop = top;
    state.canvasTransformData.clientWidth = width;
    state.canvasTransformData.clientHeight = height;
  },
  // 更新当前激活元素的各状态
  updateCurrentActiveElStyleNum(state, style) {
    state.currentActiveElStyleNum = style;
  },
  // 设置鼠标按下去时候的位置
  updateMouseDownPosition(state, position?:Position) {
    state.mouseDownPosition = position;
  },
  updateDragActiveBoxStyle(state, dragActiveBoxStyle) {
    state.dragActiveBoxStyle = dragActiveBoxStyle;
  },
  // 设置当前的模式 preview 与edit
  changeModeType(state, modeType) {
    state.modeType = modeType;
  },
  updateBizList(state, data) {
    state.bizList = data;
  },
  // 将node加入到新的窗口
  updateNodeInNewScreen(state, { id, type, newId }) {
    const idIndex = state.activeScreenNodeId.indexOf(id);
    const typeMap = {
      add() {
        state.activeScreenNodeId.splice(0, 0, id);
      },
      remove() {
        state.activeScreenNodeId.splice(idIndex, 1);
      },
      update() {
        state.activeScreenNodeId.splice(idIndex, 1, newId);
      },
    };
    typeMap[type]();
  },
  // 更新pageConfig
  updatePageConfig(state, pageConfig) {
    state.prePageConfig = pageConfig;
  },
  // 改变当前激活的fullpage
  changeActivePageIdx(state, newVal) {
    state.activePageIdx = newVal;
  },
  // 设置拖拽状态
  updateDuringDrag(state, newVal) {
    state.duringDrag = newVal;
  },

  // 更新后端模块
  updateFuncModules(state, newVal) {
    state.funcModules = newVal;
  },
  // 更新页面组件模块
  updatePageModule(state, newVal) {
    state.pageModule = newVal;
  },
  updatePageStatus(state, newVal) {
    state.pageStatus = newVal;
  },
  updatePreviewZone(state, newVal) {
    state.previewZone = newVal;
  },
  updatePreviewTime(state, newVal) {
    state.previewTime = newVal || null;
  }
};

export default mutations;
