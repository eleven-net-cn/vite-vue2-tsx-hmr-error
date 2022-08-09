<template>
  <el-form
    :model="boxStyle"
    size="mini"
    label-position="left"
    label-width="80px"
    @submit.native.prevent
  >
    <StyleFormItem name="width" />
    <StyleFormItem name="height" />
    <StyleFormItem name="left" />
    <StyleFormItem name="top" />
    <StyleFormItem name="right" />
    <StyleFormItem name="bottom" />
  </el-form>
</template>

<script>
import {
  mapGetters
} from 'vuex';

import StyleFormItem from './styleForms/index';

export default {
  components: {
    StyleFormItem
  },
  computed: {
    ...mapGetters([
      'activeNode',
    ]),
    boxStyle() {
      return this.activeNode.boxStyle;
    },
  },
};
</script>
