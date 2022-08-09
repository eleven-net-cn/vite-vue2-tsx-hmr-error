<template>
  <component
    :is="formComp"
    v-if="formComp"
    :value="compConfig"
    :class="[{'comp-form-options':!isPageCompType}]"
    size="mini"
    :env="compFormEnv"
    :config="activeNode"
    label-position="left"
    label-width="80px"
    :edit-module="pageModule"
    :helpers="compFormHelpers"
    :nodes="mapProNodes"
    @updateStyle="formMethods.updateStyle"
    @updateOptions="formMethods.updateOptions(arguments)"
    @updateEditOptions="formMethods.updateEditOptions"
  />
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import { environment } from 'appConfig';
import { getOtherStateKeyMsg } from '@/utils/globalMedthod';
import { loadImage } from '@/utils/preloadImages';
import * as utils from '@/utils';

export default {
  props: {
    customComp: {
      type: [Function, Object],
    },
    customOptions: {
      type: Object,
    },
    customCompFormHelpers: {
      type: Object,
      default() {
        return {};
      }
    },
    customMethods: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    ...mapState(['compList', 'pageModule', 'platform']),
    ...mapGetters([
      'hasCnBiz',
      'hasSeaBiz',
      'mapProNodes',
      'activeNode',
      'viewPortRem',
      'activeNodePro',
      'isPageCompType',
      'mi18nStateKey'
    ]),
    formComp() {
      return this.customComp || this.compList[this.activeNode?.name]?.main?.form;
    },
    compFormEnv() {
      return {
        hasSea: this.hasSeaBiz,
        hasCn: this.hasCnBiz,
        isMi18n: Boolean(this.mi18nStateKey),
        isMobile: this.platform === 'h5',
        environment
      };
    },
    compConfig() {
      let options = this.customOptions || this.activeNode.options;
      // 如果是没有多状态字段的，则返回原options对象
      // 如果有多字段的，则返回新的options选项，但删除多状态字段
      // 并不排除多语言字段，有多语言字段的都需要有对应的多语言表单，做过兼容没啥问题
      Object.keys(options).forEach(key => {
        if (getOtherStateKeyMsg(key)) {
          options = { ...options };
          delete options[key];
        }
      });
      return options;
    },
    formMethods() {
      return {
        updateStyle: this.updateActiveNodeBoxStyle,
        updateOptions: this.updateActiveNodeOptions,
        updateEditOptions: this.updateActiveNodesEditOptions,
        ...this.customMethods
      };
    },
    compFormHelpers() {
      return {
        setImgSize: this.setImgSize,
        ...this.customCompFormHelpers
      };
    },
  },
  methods: {
    ...mapActions(['updateNodesEditOptions', 'updateNodeBoxStyle', 'updateNodeOptions']),
    setImgSize(newVal) {
      const { noResizeHeight, noResizeWidth } = this.activeNodePro.editOptions;
      if (noResizeHeight || noResizeWidth || !newVal) {
        return;
      }
      const node = this.activeNode;
      loadImage(newVal)
        .then(img => {
          if (node !== this.activeNode) return;
          const { width, height } = img;
          if (![node.boxStyle.height, node.boxStyle.width].every(val => val?.endsWith('rem'))) {
            return;
          }
          const options = {
            width: utils.dpx2rem(width),
            height: utils.dpx2rem(height)
          };
          if (width / 100 === this.viewPortRem.width && options.width !== node.boxStyle.width && node.boxStyle.left) {
            options.left = '0rem';
          }
          this.updateNodeBoxStyle({
            options,
          });
        })
        .catch(err => {
          console.log(`loadImage ${newVal} err: `, err);
        });
    },
    getOriginOption(options) {
      if (this.isPageCompType) return options;
      const originOptions = {};
      // 取消表单关于其它状态的修改
      Object.keys(options).forEach(key => {
        if (getOtherStateKeyMsg(key) || key.startsWith('pzmi18n')) return;
        originOptions[key] = options[key];
      });
      return originOptions;
    },
    updateActiveNodeBoxStyle(boxStyle) {
      // 表单不能修改其它状态
      this.updateNodeBoxStyle({
        options: this.getOriginOption(boxStyle)
      });
    },
    updateActiveNodesEditOptions(options) {
      this.updateNodesEditOptions({
        options
      });
    },
    updateActiveNodeOptions(arg) {
      const options = arg[0];
      const updateMsg = arg[1] || {};
      this.updateNodeOptions({
        // 除非明示，不然不能修改其他状态的选项
        // 用于排除未多状态情况下deep监听替换的情况
        options: this.getOriginOption(options),
        reset: updateMsg.reset
      });
    },
  }
};
</script>

<style>
</style>
