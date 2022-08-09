<template>
  <el-input
    class="pz-input" :value="value" v-bind="$attrs"
    @input="$emit('input',$event)"
  >
  </el-input>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: ''
    },
  }
};
</script>

<style lang="scss" scoped>
.pz-input {
  height: 20px;
  display: flex;
  align-items: center;
  padding: 2px 0;
  &::v-deep input {
    height: 18px;
    line-height: 18px;
    padding: 0 6px;
    border-radius: 4px;
  }
}
</style>
