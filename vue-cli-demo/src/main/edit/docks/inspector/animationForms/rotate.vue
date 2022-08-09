<template>
  <div>
    <el-form-item label="反向旋转" label-width="50px">
      <el-switch v-model="direction">
      </el-switch>
    </el-form-item>
    <el-form-item label="时间(ms/轮)" label-width="80px">
      <el-input-number
        :value="duration"
        style="width:100%"
        :min="0"
        :step="50"
        size="mini"
        placeholder="从起点到终点的时间" @change="num => duration = num"
      ></el-input-number>
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
      ease: undefined
    };
  },
  computed: {
    direction: {
      get() {
        return this.value.direction !== 'normal';
      },
      set(newVal) {
        this.$emit('updateParams', { direction: newVal ? 'reverse' : 'normal' });
      }
    },
    duration: {
      get() {
        return (this.value.duration?.length && Number(this.value.duration.slice(0, -2))) || 2000;
      },
      set(newVal) {
        this.$emit('updateParams', { duration: `${newVal}ms` });
      }
    }
  },
  watch: {
    'value.ease': {
      handler(newVal) {
        if (newVal === this.ease) return;
        this.ease = newVal;
      },
      immediate: true
    }
  },
  methods: {
    easeChange(newVal) {
      this.$emit('updateParams', { ease: newVal });
    }
  },
};
</script>
