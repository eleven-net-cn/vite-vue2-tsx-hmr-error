<template>
  <el-date-picker
    v-model="val"
    type="datetime"
    size="mini"
    style="width:180px"
    align="right"
    v-bind="$attrs"
    @change="timeChange"
  >
  </el-date-picker>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: [Number],
      default: null
    },
  },
  data() {
    return {
      val: null,
    };
  },
  computed: {
    time() {
      return this.getCurZoneTimeByUTC(this.value);
    }
  },
  watch: {
    time: {
      immediate: true,
      handler(newVal) {
        this.val = newVal;
      }
    }
  },
  methods: {
    // 原本数据是0时区用户选择的某个时间的时间戳，现在转化成当地用户时区的这个时间的时间戳
    getCurZoneTimeByUTC(UTC) {
      if (!UTC) return null;
      return new Date(UTC + new Date().getTimezoneOffset() * 60 * 1000);
    },
    // 将拿到0时区对应的传入的时间的时间戳
    getUTCByCurZoneTime(curDate) {
      if (!curDate) return null;
      return curDate.valueOf() - curDate.getTimezoneOffset() * 60 * 1000;
    },
    // 比如当前在东八区，用户选择了8点，为了方便计算，转化成当前在0时区选择的8点的时间戳
    timeChange(curDate) {
      this.$emit('input', this.getUTCByCurZoneTime(curDate));
    },
  }
};
</script>
