<template>
  <component
    :is="comp"
    :data="data"
    :methods="methods"
    :env-list="envList"
    :form-options="formOptions"
    :name="name"
  ></component>
</template>

<script>
import {
  mapState, mapGetters, mapActions
} from 'vuex';
import { compareVersion } from '@/utils/';

export default {
  props: {
    customFormData: {
      type: Object,
      default() {
        return undefined;
      }
    },
    customFormMethods: {
      type: Object,
      default() {
        return {};
      }
    },
    formOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    name: {
      type: String
    },
    comp: {
      type: Object
    }
  },
  computed: {
    ...mapState([
      'baseInfo',
      'platMsg'
    ]),
    ...mapGetters([
      'maxZIndexNode',
      'activeFormData'
    ]),
    formMethods() {
      const {
        updateNodeBoxStyle, moveNodeIndex, updateNodeConfig, updateNodesEditOptions, checkEnable
      } = this;
      return {
        updateNodeBoxStyle,
        moveNodeIndex,
        updateNodeConfig,
        updateNodesEditOptions,
        checkEnable,
        ...this.customFormMethods
      };
    },
    formData() {
      if (!this.customFormData) {
        return this.activeFormData;
      }
      return {
        ...this.activeFormData,
        ...this.customFormData
      };
    },
    // 组件以及全局的环境变量
    envList() {
      const {
        noPosition,
        noResize,
        showEditOptions,
        noResizeHeight,
        fixAspectRatio
      } = this.formData.activeNodePro.editOptions;
      const {
        activeNode, isMutiStateForm
      } = this.formData;
      const { position } = activeNode.boxStyle;
      const { nodeCategory } = activeNode;
      return {
        // 组件不能被变动position定位相关的样式
        noPosition,
        noResize,
        noResizeHeight,
        fixAspectRatio,
        showEditOptions,
        // 该组件是relative定位的组件
        isRelativeBox: position === 'relative',
        isNormalPage: this.platMsg.mode === 'normal',
        version: this.baseInfo.buildVer,
        isMutiStateForm,
        nodeCategory
      };
    },
    // 一些需要用到的数据
    data() {
      const {
        activeNodePro, activeNode
      } = this.formData;
      const parentNode = activeNodePro.parentNode;
      const brotherList = activeNodePro.brotherList;
      const curIndex = activeNodePro.index;
      const id = activeNode.id;
      // 所有的node节点
      return {
        // 当前激活元素的父级
        parentNode,
        // 兄弟层级的列表
        brotherList,
        // 组件id
        id,
        // 当前元素在父元素中的index
        curIndex,
        // 当前激活的node
        activeNode,
        // 最大的z-index的node
        maxZIndexNode: this.maxZIndexNode,
      };
    },
    methods() {
      return {
        ...this.formMethods
      };
    },
  },
  methods: {
    ...mapActions(['updateNodeBoxStyle', 'moveNodeIndex', 'updateNodeConfig', 'updateNodesEditOptions']),
    checkHitEnv(envArr) {
      return envArr.some(item => {
        if (typeof item === 'object') {
          const typeMap = {
            version: () => compareVersion(this.envList.version, item.compare, item.version),
            nodeCategory: () => this.envList.nodeCategory === item.category
          };
          return typeMap[item.type]();
        }
        return this.envList[item];
      });
    },
    checkEnable(include = [], exclude = []) {
      let enable;
      // 如果不包含include选项，则认为直接显示
      if (!include.length) {
        enable = true;
      } else {
        // 如果有include选项，则选择显示
        enable = this.checkHitEnv(include);
      }
      if (exclude.length) {
        // 只要有一个环境变量被命中，则取消显示
        const isDisable = this.checkHitEnv(exclude);
        if (isDisable) {
          enable = false;
        }
      }
      return enable;
    },
  }
};
</script>

<style>
</style>
