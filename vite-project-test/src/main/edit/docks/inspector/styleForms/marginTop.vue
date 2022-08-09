<template>
  <el-row>
    <el-form-item label="上边距" label-width="50px">
      <num :style-attr.sync="marginTop" :custom-units="units"></num>
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
    marginTop: {
      get() {
        return this.boxStyle.marginTop;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            marginTop: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
