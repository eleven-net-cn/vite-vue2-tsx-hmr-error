<template>
  <el-row>
    <el-row>
      最小高度
    </el-row>
    <el-row>
      <el-form-item label-width="0px">
        <num :style-attr.sync="minHeight"></num>
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
    minHeight: {
      get() {
        return this.boxStyle.minHeight;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            minHeight: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
