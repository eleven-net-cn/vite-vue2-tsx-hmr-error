<template>
  <el-dialog
    title="变更提示"
    :visible.sync="show"
    width="70%"
  >
    <div v-if="show" class="main-content" v-html="prettyHtml"></div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { createPatch } from 'diff';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    oldStr: {
      type: String,
      default: ''
    },
    newStr: {
      type: String,
      default: ''
    }
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    prettyHtml() {
      const diffs = createPatch(
        '',
        this.formatPrettyStr(this.oldStr),
        this.formatPrettyStr(this.newStr),
        '',
        ''
      );

      return Diff2Html.html(diffs, {
        drawFileList: false,
        fileListToggle: true,
        fileListStartVisible: true,
        fileContentToggle: true,
        diffStyle: 'char',
        matching: 'none',
        outputFormat: 'side-by-side'
      });
    }
  },
  methods: {
    handleClose() {
      this.show = false;
    },
    handleConfirm() {
      this.$emit('confirm');
    },
    formatPrettyStr(str) {
      return JSON.stringify(JSON.parse(str || '{}'), null, 2);
    }
  },
};
</script>

<style lang="scss">
.main-content {
  .d2h-wrapper {
    max-height: 60vh;
    position: relative;
    position: relative;
    overflow: auto;
  }
}
</style>
