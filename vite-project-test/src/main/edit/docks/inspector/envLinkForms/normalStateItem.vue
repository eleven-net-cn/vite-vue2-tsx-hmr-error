<template>
  <div>
    <el-form-item v-if="formType.includes('key')" :label="declarations.keyLabel">
      <el-input
        :value="linkMsg.key"
        @input="handleChange($event,'key')"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-switch
        :value="linkMsg.equal"
        active-text="是"
        inactive-text="不是"
        @input="handleChange($event,'equal')"
      ></el-switch>
    </el-form-item>
    <template v-if="formType.includes('val')">
      <el-form-item :label="declarations.valLabel">
        <el-input
          :value="linkMsg.val"
          @input="handleChange($event,'val')"
        ></el-input>
      </el-form-item>
    </template>
  </div>
</template>

<script>
export default {
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
  computed: {
    formType() {
      return this.declarations.formType || '';
    },
  },
  methods: {
    handleChange(val, key) {
      this.$set(this.linkMsg, key, val);
    },
  }
};
</script>
