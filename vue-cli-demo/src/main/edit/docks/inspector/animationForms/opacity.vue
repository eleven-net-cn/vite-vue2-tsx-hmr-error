<template>
  <div>
    <el-form-item label="初始透明度" label-width="50px">
      <el-input-number
        :value="start"
        style="width:100%"
        :min="0"
        :max="1"
        :step="0.01"
        size="mini"
        placeholder="初始透明度" @change="num => start = num"
      ></el-input-number>
    </el-form-item>
    <el-form-item label="终点透明度" label-width="50px">
      <el-input-number
        :value="end"
        style="width:100%"
        :min="0"
        :max="1"
        :step="0.01"
        size="mini"
        placeholder="终点透明度" @change="num => end = num"
      ></el-input-number>
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
    <el-form-item label="贝塞尔曲线" label-width="80px">
      <el-input
        v-model="ease" size="mini" placeholder="请输入符合规格的贝塞尔曲线"
        @change="easeChange"
      ></el-input>
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
    start: {
      get() {
        return Number(this.value.start || 0);
      },
      set(newVal) {
        this.$emit('updateParams', { start: String(newVal || 0) });
      }
    },
    end: {
      get() {
        return Number(this.value.end || 0);
      },
      set(newVal) {
        this.$emit('updateParams', { end: String(newVal || 0) });
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
