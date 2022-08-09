<template>
  <div>
    <el-form-item label="透明度">
      <el-slider
        v-model="num" :min="0" :step="0.05"
        :max="1"
        @change="change"
      ></el-slider>
    </el-form-item>
  </div>
</template>

<script>

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
    'value.opacity': {
      handler(newVal) {
        newVal = Number(newVal);
        if (Number(newVal) === this.num) return;
        this.num = newVal;
      },
      immediate: true,
    }
  },
  methods: {
    // slider有个bug，只能这种形式
    change(num) {
      this.$emit('updateStyles', { opacity: String(num) });
    }
  },
};
</script>
