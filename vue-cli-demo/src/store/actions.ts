import Vue from 'vue';
import { ActionTree } from 'vuex';
import { Message } from 'element-ui';
import { INodeConfig, IState } from '@/types';
import constants from '@/constants';
import * as utils from '@/utils';
import { setPosition } from '@/utils/handlerNodes';
import eventModel from '@/models/event';
import merlinModel from '@/models/merlin';
import { dynamicDep, dynamicDepPlat } from '@/utils/handlerDynamicDep';

const actions: ActionTree<IState, IState> = {
  async fetchCompModule({
    state, getters, commit, dispatch
  }, { compName, version }) {
    let main;

    // 如果是要被本地组件替换的，使用本地组件
    await dispatch('dev/ensureInterceptingDevCompReady', {
      compName,
      version,
      onReady: (devComp) => {
        main = devComp.main;
      }
    });

    const comp = state.compList[compName];
    // 本地开发组件需要更新 main
    if (comp && comp.main && !comp.__dev__) {
      return;
    }
    // 拿取组件信息的接口时，如果没有设置version则以最新的version为准
    // 首页接口可以通过这种方式拿到最新的组件列表
    // 一共分为latest、空、具体version三个版本，分别拿仓库最新的、注册的最新的，和具体的version
    // 正常情况下页面是不会出现空version
    // 优先级 已经确定的version > 传入的version > comp?.latestVer > 'latest'
    version = comp?.version || version || comp?.latestVer || 'latest';
    if (!main) {
      const verPath = version === 'latest' ? '' : `/${version}`;
      let cdnBaseURL = `https://webstatic-test.mihoyo.com/dora/${compName}${verPath}`;
      let compExportName = compName;

      if (comp?.__dev__) {
        cdnBaseURL = comp.__dev__.cdnBaseURL || cdnBaseURL;
        compExportName = comp.__dev__.oriName || compExportName;
      }

      const cdnUrl = `${cdnBaseURL}/index.js`;
      const cssUrl = `${cdnBaseURL}/index.css`;
      main = await utils.loadComp({
        cdnUrl,
        cssUrl,
        compName: compExportName,
        declarations: getters.declarations,
        disableCache: !!comp?.__dev__
      });
    // console.log('fetchCompModule: ', compName, compExportName, main);
    }
    commit('updateComp', {
      compName,
      version,
      main: {
        ...main,
        // 兼容区分平台的initConfig
        initConfig: (data:{parent?:INodeConfig} = {}) => {
          const all = main.initConfig({
            plat: state.platform,
            screen: {
              ...getters.viewPortRem
            },
            parent: data.parent
          });
          const config = all[state.platform] || all;
          if (comp?.__dev__) {
            config.__dev__ = comp.__dev__;
            const { namePrefix } = comp.__dev__;
            if (!new RegExp(`^${namePrefix}`).test(config.name)) {
              config.name = `${namePrefix}${config.name}`;
            }
          }
          return config;
        }
      }
    });
  },
  updateNodeInNewScreen({
    state, commit
  }, { id, type, newId }) {
    const idIndex = state.activeScreenNodeId.indexOf(id);
    const typeMap = {
      add() {
        if (idIndex === -1) {
          commit('updateNodeInNewScreen', { id, type: 'add', newId });
        }
      },
      remove() {
        if (idIndex !== -1) {
          commit('updateNodeInNewScreen', { id, type: 'remove', newId });
        }
      },
      update() {
        if (idIndex !== -1) {
          commit('updateNodeInNewScreen', { id, type, newId });
        }
      },
      toggle() {
        if (idIndex !== -1) {
          this.remove();
        } else {
          this.add();
        }
      }
    };
    typeMap[type]();
  },
  updateNearNodeInNewScreen({ getters, dispatch }, id) {
    if (!id) return;
    const nodePro = getters.mapProNodes[id];
    const screenKey = nodePro.currentNode.editOptions?.allowNewScreen;
    // swiper窗口不能在preview模式打开
    if (screenKey) {
      dispatch('updateNodeInNewScreen', {
        id: nodePro.currentNode.id,
        type: 'add'
      });
      return;
    }
    const parentId = nodePro.parentNode?.id;
    dispatch('updateNearNodeInNewScreen', parentId);
  },
  updateNodeBoxStyle({ state: { activeNodeStateKey }, getters: { activeNode, mi18nStateKey }, commit }, { node, options, reset }) {
    node = node || activeNode;
    if (!node) return;
    // 如果当前有某个组件的别的状态激活，则改变当前组件的样式需要特殊处理
    if (activeNodeStateKey && node === activeNode && !reset) {
      const newOptions = {};
      Object.keys(options).forEach(key => {
        newOptions[`${activeNodeStateKey}${key}`] = options[key];
      });
      options = newOptions;
    }
    if (mi18nStateKey && !reset) {
      const newOptions = {};
      Object.keys(options).forEach(key => {
        newOptions[`${mi18nStateKey}${key}`] = options[key];
      });
      options = newOptions;
    }
    commit('updateNodeBoxStyle', { node, options, reset });
  },
  updateNodeOptions({ state: { activeNodeStateKey }, getters: { activeNode, mi18nStateKey }, commit }, { node, options, reset }) {
    node = node || activeNode;
    if (!node) return;
    // 如果当前有某个组件的别的状态激活，则改变当前组件的选项需要特殊处理
    if (activeNodeStateKey && node === activeNode && !reset) {
      const newOptions = {};
      Object.keys(options).forEach(key => {
        newOptions[`${activeNodeStateKey}${key}`] = options[key];
      });
      options = newOptions;
    }
    if (mi18nStateKey && !reset) {
      const newOptions = {};
      Object.keys(options).forEach(key => {
        newOptions[`${mi18nStateKey}${key}`] = options[key];
      });
      options = newOptions;
    }
    commit('updateNodeOptions', { node, options, reset });
  },
  updateNodesEditOptions({ getters: { activeNode }, commit }, { node, options }) {
    node = node || activeNode;
    if (!node) return;
    commit('updateNodesEditOptions', { node, options });
  },
  updateNodeEvents({ getters: { activeNode }, commit, dispatch }, {
    node, index, options, del
  }) {
    node = node || activeNode;
    let preEvents = node.events;
    if (!preEvents) {
      dispatch('updateNodeConfig', {
        node,
        options: {
          events: []
        }
      });
      preEvents = [];
    }
    // 如果没有设置index 则直接在末尾加上该事件
    if (index === undefined) {
      index = preEvents.length;
    }
    commit('updateNodeEvents', {
      node, index, options, del
    });
  },
  updateNodeMi18n({ getters, dispatch, commit }, { name, options, node }) {
    node = node || getters.activeNode;
    if (!node.otherOptions.mi18n) {
      dispatch('updateNodeOtherOptions', {
        node,
        options: {
          mi18n: {
            [name]: { ...options }
          }
        }
      });
      return;
    }
    commit('updateNodeMi18n', {
      name,
      options,
      node
    });
  },
  updateNodeCustomState({ getters, dispatch, commit }, { name, options, node }) {
    node = node || getters.activeNode;
    if (!node.otherOptions.customState) {
      dispatch('updateNodeOtherOptions', {
        node,
        options: {
          customState: {
            [name]: { ...options }
          }
        }
      });
      return;
    }
    commit('updateNodeCustomState', {
      name,
      options,
      node
    });
  },
  updateNodeConfig({ getters: { activeNode }, commit }, {
    node, ...rest
  }) {
    node = node || activeNode;
    if (!node) return;
    commit('updateNodeConfig', {
      node, ...rest
    });
  },
  // 节点配置东西的唯一id,比如新增状态等用的id
  updateNodeModId({ getters: { activeNode }, dispatch }, { node } = {}) {
    node = node || activeNode;
    if (!node) return;
    const newModId = Number(node.modId || 0) + 1;
    dispatch('updateNodeConfig', {
      node,
      options: {
        modId: newModId
      }
    });
  },
  updateNodeOtherOptions({ getters: { activeNode }, commit }, { node, options }) {
    node = node || activeNode;
    if (!node) return;
    commit('updateNodeOtherOptions', { node, options });
  },
  // 更新当前plat元素资源列表
  updateResources({ commit, getters }, resources) {
    // 规则1，如果节点树内有新的资源，则直接添加
    // 规则2，如果有预加载前preloadNum选项，则以前preloadNum的是否预加载为准
    // 规则3，如果外界传入已经格式化好的资源列表，则所有配置以外界传入的为准,如果有遗漏的，则填补上
    if (!resources) {
      resources = {};
      Object.keys(getters.platResources).forEach((url) => {
        const preItem = getters.platResources[url];
        resources[url] = {
          type: preItem.type,
          // getters.platResources会强制勾选前preloadNum个配置
          preload: preItem.preload,
          autoPreload: preItem.autoPreload || undefined,
          noPuzzleRes: !preItem.isPuzzleRes || undefined
        };
      });
    } else {
      resources = {
        ...getters.platResources,
        ...resources
      };
    }
    commit('updatePlatMsg', {
      resources
    });
  },
  // 更新当前激活元素
  updateActiveNodeId({ getters, commit, dispatch }, newId: string) {
    // 页面级组件不允许更改激活的节点
    if (getters.isPageCompType) {
      return;
    }
    // 重置组件激活的状态
    commit('updateActiveNodeStateKey', '');
    // 更新当前激活元素
    commit('updateActiveNodeId', newId);
    const nodePro = getters.mapProNodes[newId];
    if (!newId) return;
    // 递归并打开所有需要打开的屏幕
    dispatch('updateNearNodeInNewScreen', newId);
    if (nodePro.rootNode.nodeCategory === 'fullpageContainer') {
      commit('changeActivePageIdx', getters.fullpageNodes.indexOf(nodePro.rootNode));
    }
  },
  // 添加fullpagenode
  async addFullScreenRootNode({
    getters, commit, dispatch
  }) {
    const node = await dispatch('addNode', {
      index: getters.fullpageNodes.length,
      compName: '@puzzle/container'
    });
    commit('updateNodeBoxStyle', {
      node,
      options: {
        height: '100%',
        width: '100%'
      }
    });
    commit('updateNodeOptions', {
      node,
      options: {
        backgroundImage: undefined
      }
    });
    commit('updateNodeConfig', {
      node,
      options: {
        nodeCategory: 'fullpageContainer',
        editOptions: {
          noDrag: true,
          noPosition: true,
          noBefore: true,
          noResize: true,
          showEditOptions: false
        }
      },
    });
  },
  // 添加页面级别组件
  async addPageComp({ dispatch }, { name, beData }) {
    await dispatch('addNode', {
      index: 0,
      compName: name,
      beData
    });
  },
  // 添加swiperItem
  async addSwiperRootNode({
    getters, dispatch, commit
  }, id) {
    const swiperNode = getters.mapNodes[id];
    const node = await dispatch('addNode', {
      index: swiperNode.children.length,
      compName: '@puzzle/container',
      parentId: swiperNode.id
    });
    commit('updateNodeBoxStyle', {
      node,
      options: {
        position: 'absolute',
        height: '100%',
        width: '100%',
      }
    });
    commit('updateNodeConfig', {
      node,
      options: {
        nodeCategory: 'swiperContainer',
        editOptions: {
          noDrag: true,
          noBefore: true,
          noDelete: true,
          noEditStyle: true,
          showEditOptions: false
        }
      },
    });
  },
  async addCollapseRootNode({
    state, getters, dispatch
  }, id) {
    const collapseNode = getters.mapNodes[id];
    const { initConfig } = state.compList[collapseNode.name].main;
    const node = initConfig();
    const title = node.children[0];
    const content = node.children[1];
    dispatch('addNode', {
      index: collapseNode.children.length,
      parentId: collapseNode.id,
      config: title,
      needFmt: true
    });
    dispatch('addNode', {
      index: collapseNode.children.length,
      parentId: collapseNode.id,
      config: content,
      needFmt: true
    });
  },
  // 添加弹窗ndoe
  async addDialogRootNode({
    state, dispatch, commit
  }) {
    const dialogNode = await dispatch('addNode', {
      index: state.nodes.length,
      compName: '@puzzle/dialog'
    });
    commit('updateNodeBoxStyle', {
      node: dialogNode,
      options: {
        position: 'fixed',
        height: '100%',
        width: '100%',
        // todo暂定998后续会根据所有组件进行优化
        zIndex: 998,
      }
    });
    dispatch('updateActiveNodeId', dialogNode.id);
    return dialogNode;
  },
  // 添加node
  async addNode({
    state, getters, commit, dispatch
  }, {
    compName, index, parentId, config, beData, needFmt
  }) {
    const parentNode = getters.mapNodes[parentId];
    let _config = config;
    if (!config) {
      await dispatch('fetchCompModule', {
        compName,
      });
      const node = state.compList[compName]?.main?.initConfig({ parent: parentNode });

      const loadList:Promise<any>[] = [];
      utils.dfsNodes([node], (nodeItem) => {
        if (!state.compList[nodeItem.name]?.main) {
          loadList.push(dispatch('fetchCompModule', {
            compName: nodeItem.name,
          }));
        }
      });
      await Promise.all(loadList);
      _config = node;
    }
    if (!config || needFmt) {
      _config = utils.traverseNodes([_config], (item) => {
        const comp = state.compList[item.name];
        const declarations = comp?.main?.declarations || {};
        const fmtConfig = utils.initializeConfig(item);
        // 添加children字段
        if (declarations.nestable && !fmtConfig.children) {
          fmtConfig.children = [];
        }
        fmtConfig.version = comp?.version;
        if (!fmtConfig.otherOptions.defaultState && declarations.event?.fastSync) {
          fmtConfig.otherOptions.defaultState = utils.getDefaultState(declarations.linkStateMsg);
        }
        return {
          ...fmtConfig,
          beData
        };
      })[0];
    }
    commit('addChildNode', {
      index,
      config: _config,
      parentNode
    });

    return _config;
  },
  copyNode({ getters, dispatch }, { node, indexOffset = 0 }) {
    if (!node) return;
    const proNode = getters.mapProNodes[node.id];
    const preNodeIndex = proNode.index;

    const newConfig = utils.getCopyNodeConifg(node);
    // 元素不为relative并且组件支持变更位置的情况下允许变更到差异的位置
    if (newConfig.boxStyle.position !== 'relative' && !proNode.editOptions.noPosition) {
      ['left', 'top', 'right', 'bottom'].forEach(key => {
        const val = newConfig.boxStyle[key];
        if (val) {
          newConfig.boxStyle[key] = setPosition(val);
        }
      });
    }
    dispatch('addNode', {
      parentId: proNode.parentNode?.id,
      index: preNodeIndex + 1 + indexOffset,
      config: newConfig
    });
    Message({
      message: '节点粘贴成功',
      type: 'success',
      duration: 1000
    });
    return newConfig.id;
  },
  async pasteNode({ state, getters, dispatch }, { node }) {
    if (!node) return;
    // 拿当前文档中的最新的节点信息
    node = getters.mapNodes[node.id];
    if (!node) return;
    const nodePro = getters.mapProNodes[node.id];
    const activeNode = getters.activeNode;
    if (!activeNode) {
      Message({
        message: '请先选中激活节点',
        type: 'warning'
      });
      return;
    }

    const activeNodePro = getters.activeNodePro;
    // 如果当前激活节点和复制节点一样，则直接在后面加,暂时不受editOptions约束
    if (activeNode.id === node.id) {
      const id = dispatch('copyNode', { node });
      return id;
    }
    // 判断当前元素是否可以加入元素，todo 后续这些判断加入到addnode中
    if (activeNodePro.editOptions.noAppend || !activeNodePro.canNestable) {
      Message({
        message: '当前节点不可添加内容',
        type: 'warning'
      });
      return;
    }
    const preParentList = nodePro.parentNode?.children || state.nodes;
    const newParentList = activeNode.children;
    // 如果新节点位置和旧的一样，则直接加到后面
    if (preParentList === newParentList) {
      const id = await dispatch('copyNode', { node });
      return id;
    }
    const newConfig = utils.getCopyNodeConifg(node);
    await dispatch('addNode', {
      config: newConfig,
      parentId: activeNode.id,
      // 加到当前激活元素的最后
      index: activeNode.children.length
    });
    Message({
      message: '节点粘贴成功',
      type: 'success',
      duration: 1000
    });
    return newConfig.id;
  },
  // 通过id替换一个node
  replaceNode({ state, getters, commit }, { newNode, id }) {
    const proNode = getters.mapProNodes[id];
    // 找到元素的父元素的list
    const parentList = proNode.parentNode?.children || state.nodes;
    const index = parentList.findIndex(node => node.id === id);
    commit('replaceNode', { newNode, parentList, index });
  },
  // 往某个点默认是以鼠标中心点进行缩放
  updateScaleNum({ commit, getters: { transformedCanvasToBrowser }, state: { canvasTransformData } }, { scale, origin, publicOrigin }) {
    let originPointer;
    if (publicOrigin) {
      originPointer = {
        x: publicOrigin.x - transformedCanvasToBrowser.x,
        y: publicOrigin.y - transformedCanvasToBrowser.y
      };
    } else {
      originPointer = origin;
    }
    const preScale = canvasTransformData.scale;
    // 最新缩放的比例
    const scaleRatio = scale / preScale;
    // 画布左上角的距离，离缩放中心点的距离缩小了scaleRatio
    // 先算出画布左上角到中心点的距离
    commit('setCanvasTranslate', {
      x: canvasTransformData.x + originPointer.x * (1 - scaleRatio),
      y: canvasTransformData.y + originPointer.y * (1 - scaleRatio)
    });
    // 设置缩放的偏移
    commit('setCanvasScale', scale);
  },
  // 根据画布当前的视口中心位置进行缩放
  setScaleNumFromPublicOrigin({ dispatch, state: { canvasTransformData } }, num) {
    dispatch('updateScaleNum', {
      scale: num,
      publicOrigin: {
        x: canvasTransformData.clientWidth / 2 + canvasTransformData.offsetLeft,
        y: canvasTransformData.clientHeight / 2 + canvasTransformData.offsetTop
      }
    });
  },
  handleZoomIn({ dispatch, state: { canvasTransformData } }) {
    const num = canvasTransformData.scale * 0.9;
    if (num < 0.2) return;
    dispatch('setScaleNumFromPublicOrigin', num);
  },
  handleZoomOut({ dispatch, state: { canvasTransformData } }) {
    const num = canvasTransformData.scale * 1.1;
    dispatch('setScaleNumFromPublicOrigin', num);
  },
  // 设置线框盒子的样式
  resetActiveEditBoxStyle({ commit, state, getters }) {
    if (!getters.activeNodeProInPage?.activeEl) return;
    // 设置原始画布的信息
    commit('resetCanvasClientData');
    // 拿到画布缩放之前位于屏幕左上角的距离
    const { offsetLeft, offsetTop } = state.canvasTransformData;
    // getBoundingClientRect拿取的是元素当前缩放后的大小以及位置，受transform影响
    // 拿到元素相对于布局左上角的距离
    const {
      left, top, width, height
    } = getters.activeNodeProInPage.activeEl.getBoundingClientRect();
    // left 和 top是指当前激活元素相对于后台页面的位置
    // offsetLeft offsetTop是指画布未位移之前位于屏幕的位置
    // x和y是相对于画布的位置
    const currentActiveElStyleNum = {
      // x,y为当前激活元素相对于画布的位置
      x: left - offsetLeft,
      y: top - offsetTop,
      width,
      height,
    };
    // 当前元素经由画布缩放位移,getComputedStyle得到的值不会受transform影响，所以需要乘上scale
    const compActiveStyle = window.getComputedStyle(getters.activeNodeProInPage.activeEl);
    ['marginLeft', 'marginTop', 'marginRight', 'marginLeft', 'left', 'top'].forEach(key => {
      currentActiveElStyleNum[key] = parseFloat(compActiveStyle[key]) * state.canvasTransformData.scale;
    });
    commit('updateCurrentActiveElStyleNum', currentActiveElStyleNum);
  },

  async getBizList({ state, commit }) {
    if (state.bizList.length > 0) {
      return;
    }
    const bizList = await eventModel.getBizList();
    commit('updateBizList', bizList);
  },
  moveNodeIndex({ getters, state, dispatch }, { type, newIndex, id }) {
    const nodePro = getters.mapProNodes[id];
    const node = nodePro.currentNode;
    const parentList = nodePro.parentNode?.children || state.nodes;
    if (type === 'first') {
      newIndex = 0;
    } else if (type === 'last') {
      newIndex = parentList.length - 1;
    }
    dispatch('removeNode', { id });
    dispatch('addNode', { parentId: nodePro.parentNode?.id, config: node, index: newIndex });
  },
  removeNode({ state, getters, commit }, { id, parentList, index }) {
    if (id) {
      const nodePro = getters.mapProNodes[id];
      parentList = parentList || nodePro.parentNode?.children || state.nodes;
      index = parentList.indexOf(nodePro.currentNode);
    }
    if (!parentList) return;
    const node = parentList.splice(index, 1)[0];
    const nodeId = node.id;
    commit('updateNodesEditOptionsTemporary', {
      id: nodeId,
      type: 'remove'
    });
    return node;
  },
  async checkMi18nStatus(data, { env, is_mi18n, eventId }) {
    console.log('checkMi18nStatus', env, is_mi18n, eventId);
    if (!is_mi18n || constants.envMap[env].value === 'test') {
      return;
    }
    const [err, { is_release, complete, total }] = await Vue.prototype.$async(eventModel.checkMi18nStatus({
      id: eventId,
      env,
    }));
    if (err) {
      return;
    }
    if (!is_release) {
      Vue.prototype.$notify({
        title: '提示',
        message: `多语言尚未发布到${constants.envMap[env].name}`,
        type: 'warning'
      });
      return Promise.reject();
    }
    if (complete < total) {
      await Vue.prototype.$confirm(`多语言尚未翻译完成(进度：${complete}/${total})，确定继续发布?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
    }
  },
  async setMi18nData({ state: { baseInfo: { mi18n } }, commit, dispatch }, { gameBiz, lang, id }) {
    let mi18nData = {};
    if (!gameBiz || !lang || !mi18n?.key) {
      gameBiz = '';
      lang = '';
    } else {
      mi18nData = await eventModel.getMi18nData({
        biz_type: gameBiz,
        app_key: mi18n.key,
        lang,
        id
      });
    }
    dispatch('updateActiveNodeId', '');
    commit('updateM18nGameBiz', gameBiz);
    commit('updateM18nLang', lang);
    commit('updateMi18nData', mi18nData);
  },
  async getEventFuncModuleList({ commit }, { eventId }) {
    const params = {
      page_size: 100,
      puzzle_id: eventId
    };
    const res = await merlinModel.getEventFuncModuleList(params);
    commit('updateFuncModules', res.list);
    commit('updateCompList', res.allComps);
    return res;
  },
  async getFeFuncModuleList({ commit }, { eventId, eventType }) {
    const params = {
      page: 1,
      page_size: 500,
      puzzle_id: eventId,
      is_dev: eventType === 'EventTypeDev' ? 1 : undefined
    };
    const res = await merlinModel.getFeFuncModuleList(params);
    commit('updateCompList', res);
  },
  // 需要搜索当前渠道的
  searchDepPlat({ state: { compList }, getters: { dfsNodes } }) {
    Object.keys(dynamicDepPlat).forEach(dep => {
      dynamicDepPlat[dep].before?.();
      let condition = false;
      dfsNodes.forEach(node => {
        const comp = compList[node.name];
        const msg = {
          comp,
          node
        };
        dynamicDepPlat[dep].callBack?.(msg);
        if (!dynamicDepPlat[dep].condition?.(msg)) return;
        condition = true;
      });
      if (condition) {
        dynamicDepPlat[dep].action?.();
      } else {
        dynamicDepPlat[dep].reset?.();
      }
    });
  },
  // 需要搜索整个项目的
  searchDep({ getters: { pageConfig, otherType }, state: { platform, compList } }) {
    Object.keys(dynamicDep).forEach(dep => {
      let condition = false;
      dynamicDep[dep].before?.();
      utils.dfsNodes([...pageConfig[platform].nodes, ...(pageConfig[otherType]?.nodes || [])], (node) => {
        const comp = compList[node.name];
        const msg = {
          comp,
          node
        };
        dynamicDep[dep].callBack?.(msg);
        if (!dynamicDep[dep].condition?.(msg)) return;
        condition = true;
      });
      if (condition) {
        dynamicDep[dep].action?.();
      } else {
        dynamicDep[dep].reset?.();
      }
    });
  },
};

export default actions;
