<template>
  <el-select
    :value="value" filterable
    placeholder="请选择时区"
    size="mini"
    v-bind="$attrs"
    @change="$emit('change',$event)"
  >
    <el-option
      v-for="(item) in timeZoneList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
    </el-option>
  </el-select>
</template>

<script>
import timeZoneList from './timeZoneList';

export default {
  inheritAttrs: false,
  props: {
    value: {
      require: true,
      type: Number,
    }
  },
  data() {
    return {
      timeZoneList: timeZoneList.map(item => ({
        label: `${item.label}(${item.value})`,
        value: item.value
      })),
    };
  },
};
</script>

<style>
</style>
