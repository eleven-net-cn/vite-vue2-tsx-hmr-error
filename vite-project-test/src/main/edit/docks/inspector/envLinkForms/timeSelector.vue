<template>
  <div>
    <el-form-item v-if="timeZone!==undefined" label="时区">
      <ZoneSelector :value="timeZone" @change="$emit('zoneChange',$event)" />
    </el-form-item>
    <el-form-item label="开始时间">
      <ZeroZoneTimeSelector v-model="sTime" placeholder="选择日期时间" />
    </el-form-item>
    <el-form-item label="结束时间">
      <ZeroZoneTimeSelector v-model="eTime" placeholder="选择日期时间" />
    </el-form-item>
  </div>
</template>

<script>
import ZeroZoneTimeSelector from './zeroZoneTimeSelector.vue';
import ZoneSelector from './zoneSelector.vue';

export default {
  components: {
    ZeroZoneTimeSelector,
    ZoneSelector
  },
  props: {
    startTime: {
      type: Number,
      default: null
    },
    endTime: {
      type: Number,
      default: null
    },
    timeZone: {
      require: true,
      type: Number,
    }
  },
  computed: {
    sTime: {
      get() {
        return this.startTime;
      },
      set(newVal) {
        this.$emit('timeChange', {
          key: 'startTime',
          val: newVal
        });
      }
    },
    eTime: {
      get() {
        return this.endTime;
      },
      set(newVal) {
        this.$emit('timeChange', {
          key: 'endTime',
          val: newVal
        });
      }
    },
  },

};
</script>
