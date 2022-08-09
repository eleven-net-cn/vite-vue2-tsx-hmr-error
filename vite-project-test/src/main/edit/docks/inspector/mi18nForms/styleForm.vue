<template>
  <el-form
    size="mini"
    label-position="left"
    label-width="80px"
    @submit.native.prevent
  >
    <StyleFormItem name="width" />
    <StyleFormItem name="height" />
    <StyleFormItem v-if="boxStyle.top" name="top" />
    <StyleFormItem v-if="boxStyle.left" name="left" />
    <StyleFormItem v-if="boxStyle.bottom" name="bottom" />
    <StyleFormItem v-if="boxStyle.right" name="right" />
    <StyleFormItem name="opacity" />
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex';
import StyleFormItem from './styleFormItem';

export default {
  components: {
    StyleFormItem
  },
  computed: {
    ...mapGetters(['activeNode']),
    boxStyle() {
      return this.activeNode.boxStyle;
    }
  }
};
</script>
