<template>
  <el-row>
    <el-form-item label="右边距" label-width="50px">
      <num :style-attr.sync="marginRight" :custom-units="units"></num>
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
    marginRight: {
      get() {
        return this.boxStyle.marginRight;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            marginRight: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
