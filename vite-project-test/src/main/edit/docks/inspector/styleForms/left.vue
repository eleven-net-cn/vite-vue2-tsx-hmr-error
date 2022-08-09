<template>
  <el-row>
    <el-form-item label="左" label-width="30px">
      <num :style-attr.sync="left" :custom-units="units"></num>
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
    left: {
      get() {
        return this.boxStyle.left;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        const options = {
          left: val,
        };
        if (!this.isMutiStateForm) {
          options.right = undefined;
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
