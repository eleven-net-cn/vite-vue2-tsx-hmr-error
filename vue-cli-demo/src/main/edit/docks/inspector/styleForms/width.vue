<template>
  <el-row>
    <el-form-item label="宽" label-width="30px">
      <num :style-attr.sync="width"></num>
    </el-form-item>
  </el-row>
</template>

<script>
import { getCssValAndUnit } from '@/utils/cssUnit';
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
    fixAspectRatio() {
      return this.envList.fixAspectRatio;
    },
    width: {
      get() {
        return this.boxStyle.width;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        const resetHeight = this.fixAspectRatioHandler(val);
        const options = {
          width: val
        };
        if (resetHeight) {
          options.height = resetHeight;
        }
        updateNodeBoxStyle({
          options
        });
      }
    }
  },
  methods: {
    fixAspectRatioHandler(val) {
      if (!this.fixAspectRatio) return;
      const preHeightItem = getCssValAndUnit(this.boxStyle.height);
      const preWidthItem = getCssValAndUnit(this.boxStyle.width);
      const curWidthItem = getCssValAndUnit(val);
      const hasBadVal = [preHeightItem, curWidthItem, preWidthItem].some(item => !item || item.unit === 'calc' || item.val === 0);
      // 三个单位要一致才能开启锁定宽高比
      if (hasBadVal || !(preWidthItem.unit === preHeightItem.unit && preHeightItem.unit === curWidthItem.unit)) return;
      const preRatio = preHeightItem.val / preWidthItem.val;
      return `${curWidthItem.val * preRatio}${curWidthItem.unit}`;
    },
  },
};
</script>

<style>
</style>
