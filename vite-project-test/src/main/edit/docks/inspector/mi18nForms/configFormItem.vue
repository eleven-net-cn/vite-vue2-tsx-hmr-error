<template>
  <!-- 将多语言当作多状态 -->
  <StyleFormItem
    :name="name"
    custom-state-key=""
    :custom-state-config="{}"
  />
</template>

<script>
import StyleFormItem from '../multipleStateForms/configFormItem';

export default {
  components: {
    StyleFormItem
  },
  props: {
    name: {
      type: String,
      default: ''
    }
  },
};
</script>
