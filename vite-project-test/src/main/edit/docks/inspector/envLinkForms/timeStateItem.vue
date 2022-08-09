<template>
  <div>
    <el-form-item label="时间类型">
      <el-select
        v-model="linkMsg.timeType" filterable
        placeholder="请选择"
        @change="handlerTimeTypeChange"
      >
        <el-option
          v-for="(item) in timeTypeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <TimeSelector
      v-if="linkMsg.timeType !== 'biz'"
      :start-time="linkMsg.startTime" :time-zone="timeZone" :end-time="linkMsg.endTime"
      @timeChange="handleTimeChange"
      @zoneChange="handlerZoneChange"
    />
    <template v-else>
      <template v-for="(item,biz) in linkMsg.timeMap">
        <el-divider :key="biz+'divider'" content-position="left">
          {{ biz }}
        </el-divider>
        <TimeSelector

          :key="biz"
          :start-time="item.startTime" :time-zone="item.timeZone" :end-time="item.endTime"
          @timeChange="handleTimeChange($event,item)"
          @zoneChange="handlerZoneChange($event,item)"
        />
      </template>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TimeSelector from './timeSelector.vue';
import { getDefaultZone } from './utils';

export default {
  components: {
    TimeSelector
  },
  props: {
    declarations: {
      type: Object,
      default() {
        return {};
      }
    },
    linkMsg: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      timeTypeList: [
        // 时间戳加时区进行时间的选择
        {
          label: '对应时区时间',
          value: 'normal'
        },
        {
          // 运行时进行时区的运算
          label: '页面投放当地时间',
          value: 'local'
        },
        {
          label: '不同区服自定义',
          value: 'biz'
        },
      ],
    };
  },
  computed: {
    ...mapState(['baseInfo']),
    timeZone() {
      return this.linkMsg.timeType === 'normal' ? this.linkMsg.timeZone : undefined;
    },
  },
  methods: {
    handleTimeChange({ val, key }, namespace = this.linkMsg) {
      this.$set(namespace, key, val);
    },
    handlerZoneChange(newVal, namespace = this.linkMsg) {
      this.$set(namespace, 'timeZone', newVal);
    },
    handlerTimeTypeChange(newVal) {
      const timeMap = { ...this.linkMsg.timeMap };
      if (newVal === 'biz') {
        this.baseInfo.bizList.forEach(biz => {
          if (timeMap[biz]) return;
          timeMap[biz] = {
            startTime: null,
            endTime: null,
            timeZone: getDefaultZone(biz) ?? this.linkMsg.timeZone,
          };
        });
      }
      this.linkMsg.timeMap = timeMap;
    }
  }
};
</script>
