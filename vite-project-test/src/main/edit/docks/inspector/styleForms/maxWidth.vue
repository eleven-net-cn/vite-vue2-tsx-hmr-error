<template>
  <el-row>
    <el-row>
      最大宽度
    </el-row>
    <el-row>
      <el-form-item label-width="0px">
        <num :style-attr.sync="maxWidth"></num>
      </el-form-item>
    </el-row>
  </el-row>
</template>

<script>
import Num from '../styleComp/Num';

export default {
  components: {
    Num
  },
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
    maxWidth: {
      get() {
        return this.boxStyle.maxWidth;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            maxWidth: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
