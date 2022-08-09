<template>
  <el-row>
    <el-form-item label="上" label-width="30px">
      <num :style-attr.sync="top" :custom-units="units"></num>
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
    },
    envList: {
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
    // 多状态表单
    isMutiStateForm() {
      return this.envList.isMutiStateForm;
    },
    units() {
      return styleConst.unit.filter(item => !['auto'].includes(item.value));
    },
    top: {
      get() {
        return this.boxStyle.top;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        const options = {
          top: val,
        };
        if (!this.isMutiStateForm) {
          options.bottom = undefined;
        }
        updateNodeBoxStyle({
          options
        });
      }
    }
  },
};
</script>

<style>
</style>
