<template>
  <el-form-item label="显示编辑样式">
    <el-switch v-model="showEditOptions"></el-switch>
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
    showEditOptions: {
      get() {
        return this.envList.showEditOptions || false;
      },
      set(newVal) {
        this.methods.updateNodesEditOptions({
          options: {
            showEditOptions: newVal
          }
        });
      }
    },
  }
};
</script>
