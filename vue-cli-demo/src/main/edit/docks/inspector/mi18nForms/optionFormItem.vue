<template>
  <!-- 将多语言当作多状态 -->
  <OptionFormItem
    :name="name"
    :custom-state-key="mi18nStateKey"
    :custom-state-options="activeNodeMi18nStateOptions"
    :custom-form-comp="customFormComp"
  />
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import OptionFormItem from '../multipleStateForms/optionFormItem';

export default {
  components: {
    OptionFormItem
  },
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState(['compList']),
    ...mapGetters(['activeNode', 'mi18nStateKey', 'activeNodeMi18nStateOptions']),
    customFormComp() {
      return this.compList[this.activeNode?.name]?.main?.mi18nForm;
    }
  }
};
</script>
