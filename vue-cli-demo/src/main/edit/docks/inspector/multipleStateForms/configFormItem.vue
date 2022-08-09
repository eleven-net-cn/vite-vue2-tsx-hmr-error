<template>
  <div class="other-state-form-item-container">
    <configFormItem
      class="other-state-form-item" :class="{active:isModified}" :name="name"
      :custom-form-data="customFormData"
      :custom-form-methods="customFormMethods"
    />
    <i v-show="isModified" class="el-icon-close" @click="clearCurOtherState"></i>
  </div>
</template>

<script>
import {
  mapActions, mapGetters, mapState
} from 'vuex';
import configFormItem from '../configForms/index';
import formList from '../configForms/formList';

export default {
  components: {
    configFormItem
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
    customStateConfig: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    ...mapState(['activeNodeStateKey']),
    ...mapGetters(['activeNode', 'mi18nStateKey', 'activeNodeMi18nStateConfig', 'activeNodeOtherStateConfig']),
    stateKey() {
      return this.customStateKey ?? this.activeNodeStateKey;
    },
    stateConfig() {
      return this.customStateConfig ?? this.activeNodeOtherStateConfig;
    },
    customFormData() {
      return {
        activeNode: {
          ...this.activeNode,
          ...this.activeNodeMi18nStateConfig,
          ...this.stateConfig
        },
        isMutiStateForm: true
      };
    },
    customFormMethods() {
      return {
        updateNodeConfig: (options) => {
          this.setConfig(options);
        }
      };
    },
    bindConfig() {
      return formList[this.name].bindConfig;
    },
    curKey() {
      return `${this.mi18nStateKey}${this.activeNodeStateKey}${this.bindConfig}`;
    },
    isModified() {
      return this.bindConfig && this.activeNode[this.curKey] !== undefined;
    }
  },
  methods: {
    ...mapActions(['updateNodeConfig']),
    clearCurOtherState() {
      this.updateNodeConfig({
        del: true,
        keys: [this.curKey]
      });
    },
    // 由于conifg还有很多不可控的表单未完善，所以暂时不在全局进行代理
    setConfig({ options }) {
      const newOptions = {};
      Object.keys(options).forEach(key => {
        newOptions[`${this.mi18nStateKey}${this.activeNodeStateKey}${key}`] = options[key];
      });
      this.updateNodeConfig({
        options: newOptions
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
