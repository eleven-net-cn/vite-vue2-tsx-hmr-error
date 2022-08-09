<template>
  <el-form-item label="背景重复">
    <el-switch
      v-model="backgroundRepeat"
      active-value="repeat"
      inactive-value="no-repeat"
    >
    </el-switch>
  </el-form-item>
</template>

<script>

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    methods: {
      type: Object,
      default() {
        return {};
      }
    }
  },

  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    pointerEvents: {
      get() {
        return this.boxStyle.pointerEvents;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({ options: { pointerEvents: val || undefined } });
      },
    },
  },
};
</script>

<style>
</style>
