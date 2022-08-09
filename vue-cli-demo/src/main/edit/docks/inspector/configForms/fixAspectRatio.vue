<template>
  <el-form-item label="锁定宽高比">
    <el-switch v-model="fixAspectRatio"></el-switch>
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
    },
    envList: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    fixAspectRatio: {
      get() {
        return this.envList.fixAspectRatio || false;
      },
      set(newVal) {
        this.methods.updateNodesEditOptions({
          options: {
            fixAspectRatio: newVal
          }
        });
      }
    },
  }
};
</script>
