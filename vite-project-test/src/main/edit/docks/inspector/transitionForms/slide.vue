<template>
  <div>
    <el-form-item label="X轴偏移">
      <num :style-attr.sync="xLength" :custom-units="units"></num>
    </el-form-item>
    <el-form-item label="Y轴偏移">
      <num :style-attr.sync="yLength" :custom-units="units"></num>
    </el-form-item>
  </div>
</template>

<script>
import { formatTranslate } from '@/utils/cssUnit';
import styleConst from '@/constants/style';
import Num from '../styleComp/Num';

export default {
  components: {
    Num
  },
  props: {
    value: {
      type: Object,
      required: true,
      default() {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    units() {
      return styleConst.unit.filter(item => item.value !== 'calc');
    },
    xLength: {
      get() {
        return formatTranslate(this.value.transform)?.x.value || '0rem';
      },
      set(newval) {
        this.$emit('updateStyles', { transform: `translate(${newval},${this.yLength})` });
      }
    },
    yLength: {
      get() {
        return formatTranslate(this.value.transform)?.y.value || '0rem';
      },
      set(newVal) {
        this.$emit('updateStyles', { transform: `translate(${this.xLength},${newVal})` });
      }
    }
  }
};
</script>
