<template>
  <el-switch v-model="val" class="pz-switch" v-bind="$attrs">
  </el-switch>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    val: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit('input', newVal);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pz-switch {
  height: 14px;
  &::v-deep {
    .el-switch__core {
      height: 100%;
      width: 30px !important;
      transition: unset;
    }
    .el-switch__core::after {
      height: 10px;
      width: 10px;
      transition: unset;
    }
    &.is-checked .el-switch__core::after {
      margin-left: -11px;
    }
  }
}
</style>
