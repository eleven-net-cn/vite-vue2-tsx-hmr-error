<template>
  <el-form
    :model="boxStyle"
    size="mini"
    label-position="left"
    label-width="80px"
    @submit.native.prevent
  >
    <StyleFormItem name="position" />
    <StyleFormItem name="zIndex" />
    <StyleFormItem name="width" />
    <StyleFormItem name="height" />
    <StyleFormItem name="left" />
    <StyleFormItem name="top" />
    <StyleFormItem name="right" />
    <StyleFormItem name="bottom" />
    <StyleFormItem name="marginTop" />
    <StyleFormItem name="marginLeft" />
    <StyleFormItem name="marginBottom" />
    <StyleFormItem name="marginRight" />
    <StyleFormItem name="alignTools" />
    <StyleFormItem name="backgroundImage" :form-options="{suitBGSize:true}" />
    <template v-if="boxStyle.backgroundImage">
      <StyleFormItem name="backgroundSize" />
      <StyleFormItem name="backgroundPosition" />
    </template>
    <el-collapse>
      <el-collapse-item title="更多配置">
        <StyleFormItem name="maxWidth" />
        <StyleFormItem name="maxHeight" />
        <StyleFormItem name="minWidth" />
        <StyleFormItem name="minHeight" />
        <StyleFormItem name="backgroundColor" />
        <StyleFormItem name="pointerEvents" />
        <StyleFormItem name="opacity" />
        <StyleFormItem name="borderRadius" />
        <StyleFormItem name="cursor" />
        <StyleFormItem name="border" />
      </el-collapse-item>
    </el-collapse>
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
