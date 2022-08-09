<template>
  <div class="other-state-form-item-container">
    <CompOptionsForm
      :key="activeNode.id"
      :custom-comp="customFormComp"
      :custom-options="options"
      class="other-state-form-item comp-form-options"
      :class="{active:isModified}"
      :custom-comp-form-helpers="compFormHelpers"
      :custom-methods="customMethods"
    />
    <i v-show="isModified" class="el-icon-close" @click="clearCurOtherState"></i>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import CompOptionsForm from '../compOptionsForm';

export default {
  components: {
    CompOptionsForm
  },
  inheritAttrs: false,
  props: {
    customStateKey: {
      type: String,
      default: undefined
    },
    customStateOptions: {
      type: Object,
      default: undefined
    },
    customFormComp: {
      type: [Object, Function],
      default: undefined
    }
  },
  computed: {
    ...mapState(['activeNodeStateKey']),
    ...mapGetters(['activeNode', 'activeNodeOtherStateOptions']),
    stateKey() {
      return this.customStateKey ?? this.activeNodeStateKey;
    },
    stateOptions() {
      // 自定义当前激活多状态的数据
      return this.customStateOptions ?? this.activeNodeOtherStateOptions;
    },
    options() {
      return {
        ...this.activeNode.options,
        // 当前多状态的数据
        ...this.stateOptions
      };
    },
    curStateKeys() {
      return Object.keys(this.activeNode.options).filter(key => key.startsWith(this.stateKey));
    },
    isModified() {
      return this.curStateKeys.length;
    },
    compFormHelpers() {
      return {
        setImgSize: () => {}
      };
    },
    customMethods() {
      return {
        // 不允许更新元素样式，后续开放能够修改的样式
        updateStyle: () => {},
        updateEditOptions: () => {},
      };
    }
  },
  methods: {
    ...mapActions(['updateNodeOptions']),
    // 清空当前配置的多状态选项
    clearCurOtherState() {
      const newOptions = { ...this.activeNode.options };
      this.curStateKeys.forEach(key => {
        delete newOptions[key];
      });
      this.updateNodeOptions({
        reset: true,
        options: newOptions
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.other-state-form-item-container {
  display: flex;
  align-items: center;
  .other-state-form-item {
    flex: auto;
    position: relative;
    &.active::after {
      content: "";
      position: absolute;
      height: 100%;
      width: 5px;
      top: 0;
      right: 0;
      background-color: red;
    }
  }
  i {
    cursor: pointer;
  }
}
</style>
