<template>
  <div>
    <el-form-item label="缩放">
      <el-slider
        v-model="num" :min="0"
        :max="5"
        :step="0.01"
        @change="change"
      ></el-slider>
    </el-form-item>
  </div>
</template>

<script>
import { formatScale } from '@/utils/cssUnit';

export default {
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
    return {
      num: 0
    };
  },
  watch: {
    'value.transform': {
      handler(newVal) {
        newVal = formatScale(newVal);
        if (newVal === this.num) return;
        this.num = newVal;
      },
      immediate: true,
    }
  },
  methods: {
    // slider有个bug，只能这种形式
    change(num) {
      this.$emit('updateStyles', { transform: `scale(${num})` });
    }
  },
};
</script>
