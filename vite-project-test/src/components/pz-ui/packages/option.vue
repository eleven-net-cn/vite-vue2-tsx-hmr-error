<template>
  <el-option class="pz-option" v-bind="$attrs">
    <slot></slot>
  </el-option>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>

<style lang="scss" scoped>
.pz-option {
  height: 24px;
  line-height: 24px;
}
</style>
