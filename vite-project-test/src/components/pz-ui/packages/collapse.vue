<template>
  <el-collapse class="pz-collapse" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </el-collapse>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>

<style lang="scss" scoped>
.pz-collapse {
  background-color: #fafafa;
  border: unset !important;
  border-radius: 4px;
  padding: 2px 0;
  &::v-deep {
    .el-collapse-item__header {
      height: 20px;
      font-size: 12px;
      display: flex;
      padding: 0 6px;
      padding-right: 2px;
      align-items: center;
      border: unset !important;
      background-color: transparent;
    }
    .el-collapse-item__content {
      padding-bottom: 0;
    }
    .el-collapse-item__wrap {
      transition: unset !important;
      border: unset !important;
      background-color: transparent;
    }
  }
}
</style>
