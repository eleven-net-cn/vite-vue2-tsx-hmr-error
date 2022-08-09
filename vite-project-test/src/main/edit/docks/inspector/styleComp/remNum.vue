<template>
  <PzNumberInput
    v-model="val"
    v-bind="$attrs"
  ></PzNumberInput>
</template>

<script>
import PzNumberInput from './inputNumber.vue';
import { toFixed } from '@/utils/cssUnit';

export default {
  components: {
    PzNumberInput
  },
  inheritAttrs: false,
  props: {
    value: {
      type: [String],
      default: null
    }
  },
  computed: {
    val: {
      get() {
        return toFixed((parseFloat(this.value) || 0) * 100);
      },
      set(newVal) {
        newVal = toFixed(newVal / 100, 2);
        this.$emit('input', `${newVal}rem`);
      }
    },

  },
};
</script>

<style lang="scss" scoped>
.puzzle-input-number-px {
}
</style>
