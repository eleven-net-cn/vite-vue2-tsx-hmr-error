<template>
  <el-form-item label="适应方式">
    <el-radio-group v-model="backgroundSize">
      <el-radio-button label="cover">
        覆盖
      </el-radio-button>
      <el-radio-button label="contain">
        适应
      </el-radio-button>
      <el-radio-button label="100% 100%">
        拉伸
      </el-radio-button>
    </el-radio-group>
  </el-form-item>
</template>

<script>

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
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    backgroundSize: {
      get() {
        return this.boxStyle.backgroundSize;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            backgroundSize: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
