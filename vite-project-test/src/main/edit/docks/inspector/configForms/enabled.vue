<template>
  <el-form-item label="显示组件">
    <el-switch v-model="enabled"></el-switch>
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
    enabled: {
      get() {
        return this.data.activeNode.enabled;
      },
      set(enabled) {
        this.methods.updateNodeConfig({
          options: {
            enabled
          }
        });
      }
    },
  }
};
</script>
