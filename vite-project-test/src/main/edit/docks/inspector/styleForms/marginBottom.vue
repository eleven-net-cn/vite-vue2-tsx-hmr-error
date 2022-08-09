<template>
  <el-row>
    <el-form-item label="下边距" label-width="50px">
      <num :style-attr.sync="marginBottom" :custom-units="units"></num>
    </el-form-item>
  </el-row>
</template>

<script>
import styleConst from '@/constants/style';
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
    units() {
      return styleConst.unit.filter(item => item.value !== '%');
    },
    marginBottom: {
      get() {
        return this.boxStyle.marginBottom;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            marginBottom: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
