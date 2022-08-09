<template>
  <el-row>
    <el-row>
      最小宽度
    </el-row>
    <el-row>
      <el-form-item label-width="0px">
        <num :style-attr.sync="minWidth"></num>
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
    minWidth: {
      get() {
        return this.boxStyle.minWidth;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            minWidth: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
