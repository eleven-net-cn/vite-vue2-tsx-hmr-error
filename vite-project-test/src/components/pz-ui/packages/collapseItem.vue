<template>
  <el-collapse-item v-bind="$attrs">
    <template slot="title">
      <slot name="title"></slot>
    </template>
    <slot></slot>
  </el-collapse-item>
</template>
<script>
export default {
  inheritAttrs: false,
};
</script>
