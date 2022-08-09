import { GetterTree } from 'vuex';
import commonDeclarations from '@puzzle/wrapper/dist/declarations';
import { compareBuildver } from '@/utils/versionCompare';
import {
  INodeConfig,
  IState,
  NodePro,
  ICreateMi18nMsg,
  MI18N_RES_TYPE,
  COMPARE_SYMBOL,
} from '@/types';
import * as utils from '@/utils';
import { formateEditOptions } from '@/utils/handlerNodes';
import constants from '@/constants';
import { getResMsgByUrl } from '@/utils/resources';
import { EXTRA_EDIT_OPTIONS_MAP } from '@/constants/';
import {
  fmtMi18nOptionsMsg,
  collectNodesMi18nKeys,
  getMi18nModuleName,
  getMi18nCreateMsg,
} from '@/utils/getMi18nKey';
import LINKTYPE from '@/constants/linkType';

const getterList: GetterTree<IState, IState> = {
  bizMap({ bizList }) {
    const map = {};
    bizList.forEach(biz => {
      map[biz.biz_type] = biz.name;
    });
    return map;
  },
  // 有国服的业务
  hasCnBiz({ baseInfo: { bizList } }) {
    return bizList.find(biz => biz.endsWith('_cn'));
  },
  // 有海外的业务
  hasSeaBiz({ baseInfo: { bizList } }) {
    return bizList.find(biz => !biz.endsWith('_cn'));
  },
  viewport({ platform, platMsg, customCanvas, previewExtraParams }) {
    const curPageModeConf =
      constants.pageModeMap.find(
        item => item.fullScreen === platMsg.body?.fullScreen,
      ) || constants.pageModeMap[0];
    const viewportSet = {
      h5: {
        width: 750,
        height: 1334,
      },
      pc: {
        width: 1920,
        height: 1080,
      },
    };
    const isMobile =
      platform === 'h5' &&
      !previewExtraParams.some(
        item => item.key === 'is_mobile' && item.val === '',
      );
    // 移动端屏幕一般为一倍，而像素为两倍
    const scale = isMobile ? 2 : 1;
    return {
      width:
        (customCanvas?.width ||
          platMsg.body?.width ||
          curPageModeConf[`${platform}InitState`]?.width ||
          viewportSet[platform].width) / scale,
      height:
        (customCanvas?.height ||
          platMsg.body?.height ||
          curPageModeConf[`${platform}InitState`]?.height ||
          viewportSet[platform].height) / scale,
    };
  },
  viewPortRem({ platform }, { viewport }) {
    const scale = platform === 'h5' ? 2 : 1;
    return {
      height: (viewport.height * scale) / 100,
      width: (viewport.width * scale) / 100,
    };
  },
  isFullScreen({ platMsg }) {
    return Boolean(platMsg.body.fullScreen);
  },
  // =========  有关node过滤值 =========
  // 普通主页面节点
  normalNodes({ nodes }) {
    return nodes.filter(node => node.nodeCategory !== 'dialog');
  },
  // fullpageNode的节点
  fullpageNodes({ nodes }) {
    return nodes.filter(node => node.nodeCategory === 'fullpageContainer');
  },
  // 弹窗节点
  dialogNodes({ nodes }) {
    return nodes.filter(node => node.nodeCategory === 'dialog');
  },
  // 是否有页面组件节点
  isPageCompType({ platMsg, dev }) {
    const { enabled, devCompType } = dev ?? {};

    // only dev comp
    // 本地调试组件时，普通活动页面，允许切换到页面级组件模式
    if (enabled === true) {
      return devCompType === 'page';
    }

    return platMsg.mode === 'comppage';
  },
  // 页面组件节点
  pageCompNode({ nodes }, { isPageCompType }) {
    return isPageCompType ? nodes[0] : undefined;
  },
  // 页面级别组件
  pageComp({ compList }, { pageCompNode }) {
    return compList[pageCompNode?.name];
  },
  // 深度优先遍历的节点列表
  dfsNodes({ nodes }) {
    const result: INodeConfig[] = [];
    utils.dfsNodes(nodes, (node: INodeConfig) => {
      result.push(node);
    });
    return result;
  },
  // 弹窗深度优先遍历节点列表
  dfsDialogNodes(state, { dialogNodes }) {
    const result: INodeConfig[] = [];
    utils.dfsNodes(dialogNodes, (node: INodeConfig) => {
      result.push(node);
    });
    return result;
  },
  // 深度优先遍历的字典
  mapNodes({ nodes }) {
    const result = {};
    utils.dfsNodes(nodes, (node: INodeConfig) => {
      result[node.id] = node;
    });
    return result;
  },
  // 添加node元素的额外信息,
  mapProNodes({ nodes, nodesEditOptions, compList }) {
    let indexInPage = 0;
    const mapProNodes = {};
    // 深度遍历
    const traverseNodes = (
      parent?: INodeConfig,
      parentProNode?: NodePro,
      rootNode?: INodeConfig,
      rootProNode?: NodePro,
    ) => {
      const childrenList = parent ? parent.children : nodes;
      if (!childrenList) return;
      childrenList.forEach((node, index) => {
        const { id } = node;
        const declarations = compList[node.name]?.main?.declarations || {};
        const editOptions = {
          // 定义的编辑选项权重最小
          ...(declarations.editOptions || {}),
          // 本身携带的editOptions
          ...node.editOptions,
          ...(nodesEditOptions[id] || {}),
        };
        const normalEditOptions = {
          ...editOptions,
          ...(EXTRA_EDIT_OPTIONS_MAP[node.nodeCategory || ''] || {}),
        };
        mapProNodes[id] = {
          id,
          currentNode: node,
          // 当前组件在页面中的位置
          indexInPage,
          // 在父容器下的索引
          index,
          brotherList: childrenList,
          parentProNode,
          // 基础编辑信息，除了某个屏幕下的编辑信息
          baseEditOptions: formateEditOptions(editOptions),
          // 元素最大能被被编辑的信息
          editOptions: formateEditOptions(normalEditOptions),
          parentNode: parent,
          rootNode: rootNode || node,
          canNestable: declarations.nestable,
          declarations,
        };
        indexInPage += 1;
        mapProNodes[id].rootProNode = rootProNode || mapProNodes;
        traverseNodes(
          node,
          mapProNodes[id],
          mapProNodes[id].rootNode,
          mapProNodes[id].rootProNode,
        );
      });
    };
    traverseNodes();
    return mapProNodes;
  },
  // 当前激活元素的额外信息
  activeNodePro({ activeNodeId }, { mapProNodes }) {
    return mapProNodes[activeNodeId];
  },
  activeNodeProInPage({ nodesProInPage, activeNodeId }) {
    return nodesProInPage[activeNodeId];
  },
  // 当前激活的状态
  activeState({ activeNodeStateKey }, { activeNode }) {
    if (!activeNodeStateKey || !activeNode?.otherOptions.stateList?.length)
      return undefined;
    return (
      activeNode.otherOptions.stateList.find(
        item => item.stateKey === activeNodeStateKey,
      ) || undefined
    );
  },
  allComps({ compList }) {
    return Object.keys(compList).map(compName => compList[compName]);
  },
  compListArray({ platform }, { allComps }) {
    return allComps.filter(item => item[`is_${platform}`]);
  },
  otherType({ platform }) {
    return platform === 'pc' ? 'h5' : 'pc';
  },
  curBiz({ baseInfo: { game_biz } }) {
    return game_biz.replace(/_.*/g, '');
  },
  // 放入新的屏幕的node
  activeScreenNode({ activeScreenNodeId }, { mapNodes }) {
    return activeScreenNodeId
      .map(id => {
        const node = mapNodes[id];
        return node
          ? {
            node,
            type: node.editOptions.allowNewScreen,
          }
          : undefined;
      })
      .filter(node => node);
  },

  activeNode({ activeNodeId }, { mapNodes }) {
    // return nodes.find(item => item.id === activeNodeId);
    return mapNodes[activeNodeId];
  },
  // 当前激活元素的激活状态
  activeNodeState({ activeNodeStateKey }, { activeNode }) {
    if (!activeNodeStateKey || activeNode) return {};
    return activeNode.otherOptions?.stateList?.find(
      item => item.stateKey === activeNodeStateKey,
    );
  },
  // 当前激活元素的mi18nStyle状态
  activeNodeMi18nStateBoxStyle(state, { activeNode, mi18nStateKey }) {
    const otherStateStyle = {};
    if (!mi18nStateKey || !activeNode) {
      return otherStateStyle;
    }
    Object.keys(activeNode.boxStyle).forEach(key => {
      if (key.startsWith(mi18nStateKey)) {
        const realKey = key.replace(mi18nStateKey, '');
        otherStateStyle[realKey] = activeNode.boxStyle[key];
      }
    });
    return otherStateStyle;
  },
  // 解析所有加上多语言前缀的key，生成去掉多语言的key，可能会包含多语言状态下的多状态字段
  activeNodeMi18nStateConfig(state, { activeNode, mi18nStateKey }) {
    const otherStateConfig = {};
    if (!mi18nStateKey || !activeNode) {
      return otherStateConfig;
    }
    Object.keys(activeNode).forEach(key => {
      if (key.startsWith(mi18nStateKey)) {
        const realKey = key.replace(mi18nStateKey, '');
        otherStateConfig[realKey] = activeNode[key];
      }
    });
    return otherStateConfig;
  },
  // 当前激活元素的mi18nOptions状态
  activeNodeMi18nStateOptions(state, { activeNode, mi18nStateKey }) {
    const otherStateStyle = {};
    if (!mi18nStateKey || !activeNode) {
      return otherStateStyle;
    }
    Object.keys(activeNode.options).forEach(key => {
      if (key.startsWith(mi18nStateKey)) {
        const realKey = key.replace(mi18nStateKey, '');
        otherStateStyle[realKey] = activeNode.options[key];
      }
    });
    return otherStateStyle;
  },
  // 当前激活元素的不同的激活状态
  activeNodeOtherStateBoxStyle(
    { activeNodeStateKey },
    { activeNode, activeNodeMi18nStateBoxStyle, mi18nStateKey },
  ) {
    const otherStateStyle = {};
    if (!activeNodeStateKey || !activeNode) {
      return otherStateStyle;
    }
    const boxStyle = mi18nStateKey
      ? { ...activeNode.boxStyle, ...activeNodeMi18nStateBoxStyle }
      : activeNode.boxStyle;
    Object.keys(boxStyle).forEach(key => {
      if (key.startsWith(activeNodeStateKey)) {
        const realKey = key.replace(activeNodeStateKey, '');
        otherStateStyle[realKey] = boxStyle[key];
      }
    });
    return otherStateStyle;
  },
  activeNodeOtherStateOptions(
    { activeNodeStateKey },
    { activeNode, mi18nStateKey, activeNodeMi18nStateOptions },
  ) {
    const otherStateStyle = {};
    if (!activeNodeStateKey || !activeNode) {
      return otherStateStyle;
    }
    const options = mi18nStateKey
      ? { ...activeNode.options, ...activeNodeMi18nStateOptions }
      : activeNode.options;
    Object.keys(options).forEach(key => {
      if (key.startsWith(activeNodeStateKey)) {
        const realKey = key.replace(activeNodeStateKey, '');
        otherStateStyle[realKey] = options[key];
      }
    });
    return otherStateStyle;
  },
  // 解析激活状态的key生成正常状态的key
  // 多语言状态下，直接解析多语言状态下的key
  activeNodeOtherStateConfig({ activeNodeStateKey }, getters) {
    const otherStateConfig = {};
    if (!activeNodeStateKey || !getters.activeNode) {
      return otherStateConfig;
    }
    const config = getters.mi18nStateKey
      ? { ...getters.activeNode, ...getters.activeNodeMi18nStateConfig }
      : getters.activeNode;
    Object.keys(config).forEach(key => {
      if (key.startsWith(activeNodeStateKey)) {
        const realKey = key.replace(activeNodeStateKey, '');
        otherStateConfig[realKey] = config[key];
      }
    });
    return otherStateConfig;
  },
  activeCompMain({ compList }, { activeNode }) {
    if (!activeNode) {
      return null;
    }
    return compList[activeNode.name]?.main;
  },
  // 缩放后位移后的画布相对于浏览器的距离
  transformedCanvasToBrowser({ canvasTransformData }) {
    return {
      x: canvasTransformData.x + canvasTransformData.offsetLeft,
      y: canvasTransformData.y + canvasTransformData.offsetTop,
    };
  },
  screenMessageList({ screenList, canvasTransformData }) {
    const screenMessageList = {};
    screenList.forEach(screenConfig => {
      screenMessageList[screenConfig.id] = {
        // 屏幕距离浏览器左上角的值
        x: canvasTransformData.x + canvasTransformData.offsetLeft,
        y: canvasTransformData.y + canvasTransformData.offsetTop,
      };
    });
    return screenMessageList;
  },
  pageConfig({ prePageConfig, baseInfo, platform, platMsg, nodes }) {
    return {
      ...prePageConfig,
      baseInfo,
      [platform]: {
        ...platMsg,
        nodes,
      },
    };
  },
  platResources({ baseInfo, platMsg }, { dfsNodes }) {
    const platResources = {};
    // 一些不是定义在节点内的资源
    const baseResources = [
      {
        name: '海外分享图',
        id: baseInfo.publish_key + 0,
        src: baseInfo.seaHead.shareImage,
        noPreload: true,
      },
      {
        name: '国内分享图',
        id: baseInfo.publish_key + 1,
        src: baseInfo.share.img,
        noPreload: true,
      },
      {
        name: '页面背景图',
        id: baseInfo.publish_key + 2,
        src: platMsg.body.backgroundImage,
      },
    ];
    // 将platMsg中的新背景数组加入到列表中
    const bgList = platMsg.body.backgroundListConfig;
    const idx = 3;
    bgList?.forEach((bg, index) => {
      if (bg.backgroundImage) {
        baseResources.push({
          name: `多背景图${index}`,
          id: `${baseInfo.publish_key}+${idx}`,
          src: bg.backgroundImage,
        });
      }
    });
    let { preloadNum } = platMsg;
    const setResources = ({
      id,
      name,
      src,
      type,
      isPuzzleRes,
      noPreload,
      extension,
    }: {
      id: string;
      name: string;
      extension: string;
      src?: string;
      type: string;
      isPuzzleRes: boolean;
      noPreload?: boolean;
    }) => {
      if (!src) return;
      if (!platResources[src]) {
        let preload;
        // 自动设置preloading
        let autoPreload;
        // 如果该资源是需要预加载的，并且在前preloadNum张，则自动设置为预加载
        if (!noPreload && type === 'image' && preloadNum > 0) {
          preloadNum -= 1;
          autoPreload = true;
        }
        platResources[src] = {
          compList: [
            {
              id,
              name,
            },
          ],
          type,
          isPuzzleRes,
          noPreload,
          extension,
          autoPreload,
          src,
          preload: preload || platMsg.resources[src]?.preload,
        };
        return;
      }
      if (platResources[src].compList.find(item => item.id === id)) return;
      platResources[src].compList.push({ id, name });
    };
    baseResources.forEach(item => {
      const imgMsgs = getResMsgByUrl(item.src);
      if (!imgMsgs) return;
      imgMsgs.forEach(imgItem => {
        setResources({
          ...item,
          src: imgItem.url,
          type: 'image',
          extension: imgItem.extension,
          isPuzzleRes: imgItem.isPuzzleRes,
        });
      });
    });
    dfsNodes.forEach(node => {
      // 资源目前只存放在节点options当中
      JSON.stringify(node.options, (key, val) => {
        if (typeof val !== 'string') return val;
        const resMsgs = getResMsgByUrl(val);
        if (!resMsgs) return val;
        resMsgs.forEach(imgItem => {
          setResources({
            name: node.alias,
            id: node.id,
            type: imgItem.type,
            src: imgItem.url,
            extension: imgItem.extension,
            noPreload: ['video', 'audio'].includes(imgItem.type),
            isPuzzleRes: imgItem.isPuzzleRes,
          });
        });
        return val;
      });
    });
    return platResources;
  },
  merlinList(state, { dfsNodes }) {
    const merlin = {};
    dfsNodes.forEach(node => {
      if (node.beData) {
        merlin[node.name] = node.beData;
      }
    });
    return merlin;
  },
  maxZIndexNode(state, { dfsNodes }) {
    let preNode;
    let preNodeZIndex = 0;
    dfsNodes.forEach(node => {
      // 弹窗不需要进入层级的对比
      if (node.nodeCategory === 'dialog') return;
      // 有关层级的调研https://km.mihoyo.com/articleBase/109/49097
      // 目前所有元素都加了position !== static，所以默认与有opacity等元素在🙆同一层级
      const zIndex = Number(node.boxStyle.zIndex) || 0;
      if (!preNode || zIndex >= preNodeZIndex) {
        preNode = node;
        preNodeZIndex = Number(node.boxStyle.zIndex) || 0;
      }
    });
    return { id: preNode?.id, zIndex: preNodeZIndex };
  },
  hasMi18n(state) {
    return state.baseInfo.mi18n?.key;
  },
  fmtMi18nData(
    {
      mi18nData,
      // platform,
      // baseInfo,
    },
    { isPageCompType },
  ) {
    const fmtMi18nData = {
      h5: {},
      pc: {},
      baseInfo: {},
    };
    const setData = ({ namespaceOptions, realKey, isArray, value, index }) => {
      if (isArray) {
        if (!namespaceOptions[realKey]) {
          namespaceOptions[realKey] = [];
        }
        namespaceOptions[realKey][index] = value;
      }
      namespaceOptions[realKey] = value;
    };
    if (isPageCompType) {
      return fmtMi18nData;
    }
    Object.keys(mi18nData || {}).forEach(key => {
      const value = (mi18nData as any)[key];
      const match = key.match(
        /^(h5|pc)-(pz-[A-Za-z0-9_-]{10})-(options)-(.*?)(-pzarray-(\d)+)?$/,
      );
      if (!match) {
        fmtMi18nData.baseInfo[key] = value;
        return;
      }

      const plat = match[1];
      const nodeId = match[2];
      const namespace = match[3];
      const realKey = match[4];
      const isArray = Boolean(match[5]);
      const index = Number(match[6]);
      if (!fmtMi18nData[plat][nodeId]) {
        fmtMi18nData[plat][nodeId] = {
          options: {},
          events: {},
        };
      }
      const namespaceOptions = fmtMi18nData[plat][nodeId][namespace];
      setData({
        namespaceOptions,
        realKey,
        isArray,
        value,
        index,
      });
    });
    return fmtMi18nData;
  },
  mi18nStateKey({ lang, gameBiz }) {
    return lang ? `pzmi18n${gameBiz}${lang}-` : '';
  },
  declarations() {
    return commonDeclarations;
  },
  /**
   * 所有多语言信息的集合
   */
  allMi18nMsgList(
    state,
    { pageComp, pageCompNode, isPageCompType, pageConfig },
  ) {
    const basePlat = '通用信息';
    let mi18nKeys = [
      {
        mi18nKEY: 'baseinfo-title',
        type: 'text',
        module: getMi18nModuleName(basePlat, MI18N_RES_TYPE.TEXT),
        desc: '页面标题',
      },
    ];
    // 页面级别组件用的渠道
    const compPagePlat = 'h5';
    // 更新多语言上的字段
    const updateMi18nOptionsKey = data => {
      mi18nKeys.push(fmtMi18nOptionsMsg(data));
    };
    // 如果页面级别组件里面有自定义initmi18n的方法，则直接使用
    if (pageComp?.main?.initMi18n) {
      pageComp.main.initMi18n(pageCompNode).forEach(item => {
        const { type, label, mi18nKEY, desc, index } = item;
        updateMi18nOptionsKey({
          optionMsg: {
            key: mi18nKEY,
            val: desc,
            item: {
              type,
              optionLabel: label,
            },
          },
          index,
          node: pageCompNode,
          module: 'puzzle',
        });
      });
    } else if (isPageCompType) {
      // 其他页面级别的组件搜集h5端的所有信息
      mi18nKeys = mi18nKeys.concat(
        collectNodesMi18nKeys(pageConfig[compPagePlat]?.nodes, 'puzzle'),
      );
    } else {
      const plats = ['pc', 'h5'];
      // 渠道的名称
      plats.forEach(plat => {
        mi18nKeys = mi18nKeys.concat(
          collectNodesMi18nKeys(pageConfig[plat]?.nodes, plat),
        );
      });
    }
    return mi18nKeys;
  },
  /**
   * 多语言平台信息创建列表
   */
  mi18nCreateMsgList({ baseInfo }, { allMi18nMsgList }) {
    const mi18nCreateMsgList: ICreateMi18nMsg[] = [];
    // 大于此版本多语言允许推送自定义key
    if (compareBuildver(COMPARE_SYMBOL.GE, '2.10.45')) {
      Object.keys(baseInfo.customMi18nKey).forEach(key => {
        const { type, desc } = baseInfo.customMi18nKey[key];
        mi18nCreateMsgList.push({
          mi18nKEY: key,
          type,
          desc,
          module: getMi18nModuleName('通用信息', type),
        });
      });
    }
    allMi18nMsgList
      .filter(item => !item.customKey)
      .forEach(item => {
        mi18nCreateMsgList.push(getMi18nCreateMsg(item));
      });
    return mi18nCreateMsgList;
  },
  canLinkList({ compList, baseInfo }, { dfsNodes, activeNode, isFullScreen }) {
    const linkableList = {};
    dfsNodes.forEach(node => {
      const linkStateMsg = compList[node.name].main.declarations?.linkStateMsg;
      if (linkStateMsg && node.id !== activeNode.id) {
        const declFastSync =
          compList[node.name]?.main?.declarations?.event?.fastSync;
        const fastSync = declFastSync
          ? {
            name: declFastSync.name,
          }
          : undefined;
        linkableList[node.id] = { node, linkStateMsg, fastSync };
      }
    });
    const pageId = baseInfo.publish_key;
    const pageLinkMsg: any = {
      node: {
        id: pageId,
        alias: '全局',
      },
      fastSync: true,
      linkStateMsg: {
        qs: {
          type: 'string',
          stringType: 'any',
          label: '链接参数',
          // 能够被使用于覆盖参数
          canUseOption: true,
          // 不可以用于组件联动表单
          noLink: true,
          // 是否自定义获取的属性名
          customPropName: true,
        },
      },
    };
    linkableList[pageId] = pageLinkMsg;
    if (isFullScreen) {
      pageLinkMsg.linkStateMsg = {
        ...pageLinkMsg.linkStateMsg,
        index: {
          type: 'number',
          label: '页',
          rule: {
            min: 1,
          },
        },
      };
    } else {
      // 长页面模式
      pageLinkMsg.linkStateMsg = {
        ...pageLinkMsg.linkStateMsg,
        scrollStart: {
          type: 'number',
          label: '滚动起始值',
          rule: {
            min: 0,
          },
          // 在wrapper处理比较逻辑
          linkType: LINKTYPE.SCROLL_START,
        },
        scrollEnd: {
          type: 'number',
          label: '滚动终止值',
          rule: {
            min: 0,
          },
          // 在wrapper处理比较逻辑
          linkType: LINKTYPE.SCROLL_END,
        },
      };
    }
    return linkableList;
  },
  // 所有能够输出数据的组件数据
  globalStateList(state, { canLinkList }) {
    const globalStateList = {};
    Object.keys(canLinkList).forEach(key => {
      const item = canLinkList[key];
      if (
        Object.values(item.linkStateMsg).some(
          linkStateMsg => (linkStateMsg as any).canUseOption === true,
        )
      ) {
        globalStateList[key] = item;
      }
    });
    return globalStateList;
  },
  activeFormData(state, { activeNode, activeNodePro, maxZIndexNode }) {
    if (!activeNode) return {};
    const editOptions = activeNodePro.editOptions;
    return {
      // 当前激活元素的额外信息
      activeNodePro: { ...activeNodePro, editOptions },
      activeNode,
      maxZIndexNode,
    };
  },
};

export default getterList;
