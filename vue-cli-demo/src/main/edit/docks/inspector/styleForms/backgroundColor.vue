<template>
  <el-form-item label="背景色">
    <el-color-picker
      v-model="backgroundColor"
      show-alpha
      :predefine="predefineColors"
    >
    </el-color-picker>
  </el-form-item>
</template>

<script>
import styleConst from '@/constants/style';

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    methods: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      predefineColors: styleConst.predefineColors,
    };
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    backgroundColor: {
      get() {
        return this.boxStyle.backgroundColor;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            backgroundColor: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
