<template>
  <div>
    <el-form-item label="起始位置" label-width="50px">
      <num :style-attr.sync="start" :custom-units="units"></num>
    </el-form-item>
    <el-form-item label="终点位置" label-width="50px">
      <num :style-attr.sync="end" :custom-units="units"></num>
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
    return {
      ease: undefined
    };
  },
  computed: {
    units() {
      return styleConst.unit.filter(item => item.value !== 'calc');
    },
    start: {
      get() {
        return this.value.start || '0rem';
      },
      set(newVal) {
        this.$emit('updateParams', { start: newVal });
      }
    },
    end: {
      get() {
        return this.value.end || '0rem';
      },
      set(newVal) {
        this.$emit('updateParams', { end: newVal });
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
