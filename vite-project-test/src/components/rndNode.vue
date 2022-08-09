<template>
  <component
    :is="view"
    v-show="isShow"
    v-if="view"
    ref="editItem"
    :nodeid="config.id"
    class="edit-item-container"
    :draggable="!activeNodeId&&!attrKeyMap.noDrag&&!lang"
    :config="editConfig"
    v-bind="attrKeyMap"
  >
    <template v-if="canNestable">
      <rndNode
        v-for="child in config.children"
        :key="child.id"
        :root-node-id="rootNodeId"
        :show-in-new-screen="childrenShowInNewScreen"
        :parent-is-show="isShow"
        :config="child"
      >
      </rndNode>
    </template>
  </component>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions
} from 'vuex';

import { formateEditOptions } from '@/utils/handlerNodes';
import { SCREEN_EDIT_OPTIONS_MAP, LOCK_DATA_MAP } from '@/constants/';

export default {
  name: 'RndNode',
  components: {
  },
  inject: ['screenCategory'],
  props: {
    config: {
      type: Object,
      default() {
        return {};
      }
    },
    customEditOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    showInNewScreen: {
      type: Boolean,
      default: false
    },
    // 屏幕的根容器id
    rootNodeId: {
      type: String,
      default: ''
    },
    parentIsShow: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      editConfig: {
        enabled: true,
        disabled: false
      },
      isMounted: false,
      editItem: null,
      optionKeyMap: {},
      attrKeyMap: {},
      curComp: null,
      editOptions: {},
      maxZIndex: 0
    };
  },

  computed: {
    ...mapState([
      'baseInfo',
      'platMsg',
      'platform',
      'compList',
      'dragActiveBoxStyle',
      'activeNodeId',
      'activePageIdx',
      'lang',
      'gameBiz',
      'mi18nData'
    ]),

    ...mapGetters([
      'viewport',
      'viewPortRem',
      'mapProNodes',
      'fullpageNodes',
      'activeNodeOtherStateBoxStyle',
      'activeNodeOtherStateOptions',
      'activeNodeOtherStateConfig',
      'fmtMi18nData',
      'mi18nStateKey',
      'maxZIndexNode'
    ]),
    id() {
      return this.config.id;
    },
    // 当前节点被激活状态
    isActive() {
      return this.activeNodeId === this.config?.id;
    },
    // 如果用户有选择在哪个页面显示则显示在某个页面
    // 只有在全屏的时候用到
    checkPageShow() {
      const showPageList = this.otherOptions.showPageList;
      if (this.platMsg.body.fullScreen && showPageList?.length) {
        return showPageList.includes(this.fullpageNodes[this.activePageIdx].id);
      }
      return true;
    },
    jsonMi18nConfig() {
      const data = {
        config: {},
        // 目前只有disabled与enabled有多语言多状态产生，所以可以与config分割开
        boxStyle: {},
        options: {}
      };
      if (this.mi18nStateKey) {
        Object.keys(data).forEach(namespace => {
          const obj = namespace === 'config' ? this.config : this.config[namespace];
          const config = namespace === 'config' ? this : this.config;
          Object.keys(obj).forEach(key => {
            if (key.startsWith(this.mi18nStateKey)) {
              data[namespace][key.replace(this.mi18nStateKey, '')] = config[namespace][key];
            }
          });
        });
      }
      return data;
    },
    realConfig() {
      const config = { ...this.config, ...this.jsonMi18nConfig.config };
      if (!this.isActive) {
        return config;
      }
      return { ...config, ...this.activeNodeOtherStateConfig };
    },
    // 由两个选项进行控制，一个是enabled，一个是disabled
    // enabled类似于isShow，disabled类似于v-if
    disabled() {
      const hasMultiStateDisabled = this.isActive ? this.activeNodeOtherStateConfig?.disabled : undefined;
      // 如果多状态中有disabled的判断，则以多状态中的为准
      // 如果为undefined则以正常状态的为准
      return hasMultiStateDisabled ?? this.realConfig.disabled;
    },
    // 节点是否显示
    isShow() {
      const hasMultiStateEnabled = this.isActive ? this.activeNodeOtherStateConfig?.enabled : undefined;
      const enabled = hasMultiStateEnabled ?? this.realConfig.enabled;
      // 编辑模式中由于需要固定组件的dom元素，所以不会进行真实v-if的操作
      const isShow = this.checkPageShow && enabled && !this.disabled;
      // 在编辑属性为noDelete的情况下，不允许消失
      return Boolean(this.parentIsShow && (isShow || this.attrKeyMap.noDelete));
    },
    // 被父元素判定为需要在特定的屏幕上，或者该元素需要在特定的屏幕上且并不属于此屏幕的，或者属于此屏幕但不是根元素(轮播嵌套)(比如轮播组件套轮播组件，嵌套的轮播组件是属于此屏幕类型的，但不是根元素，所以不能被判定为能在这个屏幕中被编辑，比如弹窗是属于该屏幕也属于该屏幕的根节点可以被编辑)
    // rootNodeId作用1，用于判定拖拽的添加
    // 作用2，用于判定当前屏幕正好用于展示当前节点，比如轮播嵌套
    shouldShowInNewScreen() {
      return this.showInNewScreen || (this.config.editOptions.allowNewScreen && (this.rootNodeId !== this.config.id || this.config.editOptions.allowNewScreen !== this.screenCategory));
    },
    // 表示该元素需要特定的屏幕上显示
    curShouldInNewScreen() {
      // 此元素没有需要老屏幕声明
      return this.shouldShowInNewScreen && !this.config.editOptions.needOldScreen;
    },
    // 当前元素在新的屏幕上显示，或者当前节点只是因为需要在老屏幕中显示节点而可以显示在当前屏幕，则声明子节点需要在新的屏幕中显示
    childrenShowInNewScreen() {
      return this.curShouldInNewScreen || (this.shouldShowInNewScreen && this.config.editOptions.needOldScreen);
    },
    // 节点类型
    nodeCategory() {
      return this.config.nodeCategory;
    },
    // 组件
    comp() {
      return this.compList[this.config?.name];
    },
    // 节点的定义
    declarations() {
      return this.comp?.main?.declarations || {};
    },
    // 节点的定义中的编辑属性
    defaultEditOptions() {
      return this.declarations.defaultEditOptions || {};
    },
    // 节点是否可以加入子节点
    canNestable() {
      return this.declarations?.nestable;
    },
    // 组件vue类
    view() {
      return this.comp?.main?.view;
    },
    // 节点是否是relative类型
    isRelativeBox() {
      return this.boxStyle?.position === 'relative';
    },
    // 多状态样式
    otherStateStyle() {
      return this.isActive ? this.activeNodeOtherStateBoxStyle : {};
    },
    // 编辑端样式
    boxStyle() {
      const boxStyle = { ...this.config.boxStyle, ...this.jsonMi18nConfig.boxStyle };
      if (!this.isActive) {
        return boxStyle;
      }
      return {
        ...boxStyle, ...this.otherStateStyle, ...this.dragActiveBoxStyle
      };
    },
    // 从多语言获取的选项，目前只有options
    mi18n() {
      const id = this.config.id;
      const mi18nData = this.otherOptions.mi18nFrom ? this.fmtMi18nData[this.otherOptions.mi18nFrom.plat][this.otherOptions.mi18nFrom.id] : this.fmtMi18nData[this.platform][id];
      const customKeys = {};
      const mi18nConfig = this.config.otherOptions?.mi18n || {};
      Object.keys(mi18nConfig).forEach((key) => {
        const { enabled, customKey } = mi18nConfig[key];
        if (enabled && customKey && Object.prototype.hasOwnProperty.call(this.mi18nData, customKey)) {
          customKeys[key] = this.mi18nData[customKey];
        }
      });
      return {
        options: { ...(mi18nData?.options || {}), ...customKeys },
      };
    },
    // 当前节点补充信息
    curProNodes() {
      return this.mapProNodes[this.config.id];
    },
    // 当前元素在屏幕内更多信息
    currentProMessage() {
      return {
        id: this.id,
        activeEl: this.isShow ? this.editItem : undefined,
        screenCategory: this.screenCategory
      };
    },
    // 当前屏幕下附加的编辑属性
    screenEditOptions() {
      return SCREEN_EDIT_OPTIONS_MAP[this.screenCategory]?.[this.nodeCategory];
    },
    // 分拣编辑时需要的参数
    formatEditDatas() {
      const screenEditOptions = this.screenEditOptions || {};
      let editOptions = {
        ...this.editOptions,
        // 某个screen特殊处理的editOptions
        ...screenEditOptions
      };
      // 如果当前屏幕需要在新的屏幕上显示，则锁定该屏幕
      if (this.curShouldInNewScreen) {
        editOptions = {
          ...editOptions,
          ...LOCK_DATA_MAP
        };
      }
      editOptions = formateEditOptions(editOptions);
      const keyList = Object.keys(editOptions);
      const optionKeyMap = {};
      const attrKeyMap = {};
      keyList.forEach(key => {
        // $开头的则为编辑端模拟的组件参数
        if (key.startsWith('$')) {
          optionKeyMap[key.slice(1)] = editOptions[key];
          return;
        }
        if (editOptions[key]) {
          attrKeyMap[key] = editOptions[key];
        }
      });
      return {
        optionKeyMap,
        attrKeyMap
      };
    },
    // 组件额外的配置项
    otherOptions() {
      // 目前先忽略过渡动画
      const transitionIgnore = {
        transitionEnter: undefined, transitionLeave: undefined, animation: undefined, transitions: undefined
      };
      // 多状态忽略
      const stateIgnore = { stateList: undefined };
      return { ...this.config.otherOptions, ...transitionIgnore, ...stateIgnore } || {};
    },
    // 组件的配置项
    compOptions() {
      const options = {
        ...this.config.options,
        // 由于从多语言拿取的options与jsonMi18nConfig的不会冲突，所以权重没必要纠结
        ...this.jsonMi18nConfig.options,
        ...this.mi18n.options
      };
      let compOptions = { ...options };
      if (this.isActive) {
        compOptions = {
          ...compOptions,
          ...this.activeNodeOtherStateOptions
        };
      }
      // 编辑用的参数权重最高
      compOptions = {
        ...compOptions,
        ...this.optionKeyMap
      };
      // 显示方便编辑的参数
      if (this.attrKeyMap.showEditOptions) {
        Object.keys(this.defaultEditOptions).forEach(key => {
          // 当值等于以下几个时，判定为空，需要默认值的介入
          const noOption = [undefined, null, '', 0].includes(compOptions[key]);
          if (noOption) {
            compOptions[key] = this.defaultEditOptions[key];
          }
        });
      }
      return compOptions;
    },
    // 满足以下条件该节点不允许任何编辑
    noEveryEdit() {
      const {
        noActive, noDrag, noAppend, noBefore,
      } = this.attrKeyMap;
      return noActive && noDrag && noAppend && noBefore;
    },
    // 真正的样式
    innerStyle() {
      let styles = { ...this.boxStyle };
      // 排除vwvh等样式单位的影响
      styles = this.filterEditStyle(styles);
      const {
        noActive, noResize, noPosition, locked
      } = this.attrKeyMap;
      let cursor = 'move';
      if (noActive) {
        cursor = 'default';
      } else if (((noResize && noPosition) || this.isRelativeBox)) {
        cursor = 'pointer';
      }
      // fixed元素的层级在其他之上
      if (styles.position === 'fixed' && !this.platMsg.body.fullScreen) {
        styles.zIndex = this.maxZIndex + Number(styles.zIndex || 0) + 1;
      }
      return {
        ...styles,
        cursor,
        filter: locked ? 'opacity(60%)' : undefined,
        // 去掉内容对pointerEvents的控制
        pointerEvents: this.noEveryEdit ? 'none' : 'auto',
      };
    },
    // 组件需要的全局模拟环境
    globalOptions() {
      // bizList为后面所加，有些项目没有，所以需要game_biz兜底
      const gameBiz = this.gameBiz || this.baseInfo.bizList?.[0] || this.baseInfo.game_biz;
      // gameBiz为指定的
      const isCn = gameBiz.split('_')?.pop() === 'cn';
      const isMobile = this.platform === 'h5';
      return {
        isMobile,
        gameBiz,
        lang: this.lang || isCn ? 'zh-cn' : 'en-us',
        isSea: !isCn,
        isGame: false,
        isBBS: false,
        isModule: false,
        isEdit: true,
        environment: 'test',
        em: isMobile ? 50 : 100,
        accountRole: {
          onRole() {},
          onLogin() {},
          onBBSInfo() {},
          loginMsg: {
            isLoign: false
          },
          roleMsg: {},
          bbsMsg: {},
          accountRoleUtil: {
            show() {}
          },

        }
      };
    },
    globalMethods() {
      return {
        // 多语言功能后续补充
        getMi18nOptionKey() {},
        syncState() {}
      };
    },
    innerConfig() {
      return {
        ...this.config, appendEl: undefined, globalOptions: this.globalOptions, globalMethods: this.globalMethods, globalState: { compState: {}, store: {}, group: {} }
      };
    },
  },
  // 性能关系，都使用watch挑选着进行渲染
  watch: {
    maxZIndexNode: {
      handler(newVal) {
        this.maxZIndex = newVal.zIndex || 0;
      },
      immediate: true
    },
    'curProNodes.baseEditOptions': {
      handler(newVal, preVal) {
        if (JSON.stringify(preVal) !== JSON.stringify(newVal)) {
          this.editOptions = newVal;
        }
      },
      immediate: true
    },
    formatEditDatas: {
      handler(newVal) {
        ['optionKeyMap', 'attrKeyMap'].forEach(key => {
          if (JSON.stringify(newVal[key]) !== JSON.stringify(this[key])) {
            this[key] = newVal[key];
          }
        });
      },
      immediate: true
    },
    comp: {
      handler(newVal) {
        if (this.curComp) return;
        this.curComp = newVal;
      },
      immediate: true
    },
    // 监听当前元素所有信息，如果激活，则更新到node上
    currentProMessage: {
      handler(newVal) {
        if (this.curShouldInNewScreen) {
          return;
        }
        this.updateNodesProInPage({ id: this.config.id, message: newVal });
      },
      immediate: true,
    },
    innerConfig: {
      handler(newVal) {
        Object.keys(newVal).forEach(key => {
          if (!['boxStyle', 'options', 'id', 'otherOptions', 'events', 'enabled', 'disabled'].includes(key)) {
            this.$set(this.editConfig, key, newVal[key]);
          }
        });
      },
      immediate: true
    },
    otherOptions: {
      handler(newVal) {
        this.$set(this.editConfig, 'otherOptions', newVal);
      },
      immediate: true
    },
    compOptions: {
      handler(newVal, preVal) {
        if (JSON.stringify(newVal) === JSON.stringify(preVal)) return;
        this.$set(this.editConfig, 'options', newVal);
      },
      immediate: true
    },
    innerStyle: {
      handler(newVal, preVal) {
        if (JSON.stringify(newVal) === JSON.stringify(preVal)) return;
        this.$set(this.editConfig, 'boxStyle', newVal);
      },
      immediate: true
    },
  },
  mounted() {
    this.editItem = this.$refs.editItem.$el;
  },
  // 销毁的时候重置激活node
  beforeDestroy() {
    if (this.curShouldInNewScreen) {
      return;
    }
    if (this.isActive) {
      this.updateActiveNodeId('');
    }
    this.updateNodesProInPage({ id: this.config.id, message: {} });
  },
  methods: {
    ...mapMutations([
      'updateNodesProInPage',
    ]),
    ...mapActions(['updateActiveNodeId']),
    filterEditStyle(preStyle) {
      const style = { ...preStyle };
      Object.keys(style).forEach(key => {
        if (!style[key]) return;
        const vwReg = /(\d+\.?\d*)(vw|vh)/;
        style[key] = String(style[key]).replace(vwReg, (match, p1, p2) => {
          if (p2 === 'vw') {
            return `${this.viewPortRem.width * p1 / 100}rem`;
          }
          if (p2 === 'vh') {
            return `${this.viewPortRem.height * p1 / 100}rem`;
          }
        });
      });
      return style;
    }
  }
};
</script>

<style lang="scss">
// 编辑模式控制容器下的所有元素除非指定，不可被任何操作或者阻挡
.edit-item-container * {
  pointer-events: none;
}
.edit-item-container[noChildEdit] * {
  pointer-events: none !important;
}
</style>
<style lang="scss" scoped>
.reset-box {
  height: 100%;
  width: 100%;
}
// .lock-icon {
//   position: absolute;
//   left: 0;
//   top: 0;
//   height: 100%;
//   width: 100%;
//   font-size: 40px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: rgb(107, 57, 57, 0.6);
// }
</style>
