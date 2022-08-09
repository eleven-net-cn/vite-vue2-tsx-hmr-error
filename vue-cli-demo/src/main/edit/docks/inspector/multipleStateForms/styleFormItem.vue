<template>
  <div class="other-state-form-item-container">
    <StyleFormItem
      class="other-state-form-item" :class="{active:isModified}" :name="name"
      :custom-form-data="customFormData"
    />
    <i v-show="isModified" class="el-icon-close" @click="clearCurOtherState"></i>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import StyleFormItem from '../styleForms/index';
import formList from '../styleForms/formList';

export default {
  components: {
    StyleFormItem
  },
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      default: ''
    },
    customStateKey: {
      type: String,
      default: undefined
    },
    customStateBoxStyle: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    ...mapState(['activeNodeStateKey']),
    ...mapGetters(['activeNode', 'mi18nStateKey', 'activeNodeMi18nStateBoxStyle', 'activeNodeOtherStateBoxStyle']),
    stateKey() {
      return this.customStateKey ?? this.activeNodeStateKey;
    },
    stateBoxStyle() {
      return this.customStateBoxStyle ?? this.activeNodeOtherStateBoxStyle;
    },
    // 给表单自定义的内容
    customFormData() {
      return {

        activeNode: {
          ...this.activeNode,
          boxStyle: {
            // 原本的状态
            ...this.activeNode.boxStyle,
            // 多语言的状态
            ...this.activeNodeMi18nStateBoxStyle,
            // 从多语言的多状态中解析出来的状态
            ...this.stateBoxStyle
          }
        },
        isMutiStateForm: true
      };
    },
    bindStyle() {
      return formList[this.name].bindStyle;
    },
    // 默认key由多语言和多状态组成,如果去掉多状态，就可以直接表示多语言
    curKey() {
      return `${this.mi18nStateKey}${this.stateKey}${this.bindStyle}`;
    },
    isModified() {
      return this.bindStyle && Object.prototype.hasOwnProperty.call(this.activeNode.boxStyle, this.curKey);
    }
  },
  methods: {
    ...mapActions(['updateNodeBoxStyle']),
    clearCurOtherState() {
      // 删除当前key用的是最原始的boxStyle
      const newBoxStyle = { ...this.activeNode.boxStyle };
      delete newBoxStyle[this.curKey];
      this.updateNodeBoxStyle({
        reset: true,
        options: newBoxStyle
      });
    }
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
