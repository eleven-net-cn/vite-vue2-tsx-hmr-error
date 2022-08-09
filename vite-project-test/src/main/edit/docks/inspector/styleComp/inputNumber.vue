<template>
  <el-input-number
    class="puzzle-input-number"
    :value="value"
    controls-position="right"
    size="mini"
    v-bind="$attrs"
    @change="handleChange"
  ></el-input-number>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: [Number],
      default: null
    }
  },
  methods: {
    handleChange(val) {
      this.$emit('input', val);
    }
  }
};
</script>

<style lang="scss" scoped>
.puzzle-input-number {
  width: 70px;
}
</style>
