<template>
  <el-form-item label="不使用组件">
    <el-switch v-model="disabled"></el-switch>
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
    disabled: {
      get() {
        const { disabled } = this.data.activeNode;
        return Boolean(disabled);
      },
      set(newVal) {
        this.methods.updateNodeConfig({
          options: {
            disabled: newVal
          }
        });
      }
    },
  }
};
</script>
