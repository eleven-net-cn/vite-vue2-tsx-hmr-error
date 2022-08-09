<template>
  <el-select class="pz-select" v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </el-select>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>

<style lang="scss" scoped>
.pz-select {
  height: 20px;
  display: flex;
  align-items: center;
  padding: 2px 0;
  &::v-deep {
    input {
      height: 18px;
      line-height: 18px;
      padding: 0 6px;
      border-radius: 4px;
    }
    .el-select__caret {
      font-size: 12px !important;
      line-height: 18px;
    }
    .el-input__suffix {
      right: 1px;
    }
  }
}
</style>
