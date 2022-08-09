<template>
  <el-form
    size="mini"
    label-position="left"
    label-width="80px"
    @submit.native.prevent
  >
    <ConfigFormItem name="disabled" />
    <ConfigFormItem name="enabled" />
  </el-form>
</template>

<script>
import ConfigFormItem from './configFormItem';

export default {
  components: {
    ConfigFormItem
  }
};
</script>
