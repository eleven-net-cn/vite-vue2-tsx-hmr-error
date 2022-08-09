<template>
  <el-row>
    <el-form-item label="高" label-width="30px">
      <num :style-attr.sync="height"></num>
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
    height: {
      get() {
        return this.boxStyle.height;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        const resetWidth = this.fixAspectRatioHandler(val);
        const options = {
          height: val
        };
        if (resetWidth) {
          options.width = resetWidth;
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
      const preWidthItem = getCssValAndUnit(this.boxStyle.width);
      const preHeightItem = getCssValAndUnit(this.boxStyle.height);
      const curHeightItem = getCssValAndUnit(val);
      const hasBadVal = [preWidthItem, curHeightItem, preHeightItem].some(item => !item || item.unit === 'calc' || item.val === 0);
      // 三个单位要一致才能开启锁定宽高比
      if (hasBadVal || !(preHeightItem.unit === preWidthItem.unit && preWidthItem.unit === curHeightItem.unit)) return;
      const preRatio = preWidthItem.val / preHeightItem.val;
      return `${curHeightItem.val * preRatio}${curHeightItem.unit}`;
    },
  },
};
</script>

<style>
</style>
