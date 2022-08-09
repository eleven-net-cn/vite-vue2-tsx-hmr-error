<template>
  <el-form-item label="层级">
    <el-button size="mini" @click="setTopZIndex">
      置于顶层
    </el-button>
    <el-button size="mini" @click="setBottomZIndex">
      置于底层
    </el-button>
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
    },
    envList: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  methods: {
    setTopZIndex() {
      const { isRelativeBox } = this.envList;
      const { id, activeNode, maxZIndexNode } = this.data;
      if (!isRelativeBox) {
        this.methods.moveNodeIndex({ id, type: 'last' });
      }
      // 如果本身已经是zIndex最高的组件了就不需要再提高
      if (maxZIndexNode.id === activeNode.id) return;
      const newMaxZIndex = maxZIndexNode.zIndex + 1;
      this.methods.updateNodeBoxStyle({
        options: {
          zIndex: String(newMaxZIndex)
        }
      });
    },
    // 置于底层就
    setBottomZIndex() {
      const { isRelativeBox } = this.envList;
      const { id } = this.data;
      this.methods.updateNodeBoxStyle({
        options: {
          zIndex: undefined
        }
      });
      if (!isRelativeBox) {
        this.methods.moveNodeIndex({ id, type: 'first' });
      }
    },
  }
};
</script>

<style>
</style>
