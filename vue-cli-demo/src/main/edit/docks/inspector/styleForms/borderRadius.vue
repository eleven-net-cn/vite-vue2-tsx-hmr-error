<template>
  <el-row>
    <el-form-item label="圆角" label-width="30px">
      <num :style-attr.sync="borderRadius" :custom-units="units"></num>
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
      return styleConst.unit.filter(item => ['rem', '%', 'none'].includes(item.value));
    },
    borderRadius: {
      get() {
        return this.boxStyle.borderRadius;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        const options = {
          borderRadius: val
        };
        if (val) {
          options.willChange = 'opacity';
        }
        updateNodeBoxStyle({
          options
        });
      }
    }
  },
};
</script>
