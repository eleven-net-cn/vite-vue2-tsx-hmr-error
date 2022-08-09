<template>
  <el-dialog
    :visible.sync="visible"
    class="config-module"
    :title="'配置模块 / ' + bizName"
    fullscreen
    @closed="onClosed"
  >
    <iframe
      class="config-module__iframe"
      :src="url"
      frameborder="0"
    />
  </el-dialog>
</template>

<script>
export default {
  name: 'ConfigModule',

  props: {
    url: String,
    bizName: String
  },

  data() {
    return {
      visible: true
    };
  },

  methods: {
    onClosed() {
      this.$emit('resolve');
    }
  }
};
</script>

<style lang="scss">
.config-module {
  .el-dialog__body {
    padding-top: 0;
  }
}

.config-module__iframe {
  width: 100%;
  height: calc(100vh - 100px);
}
</style>
