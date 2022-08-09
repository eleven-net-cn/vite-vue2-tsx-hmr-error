<template>
  <el-form-item>
    <el-tooltip slot="label" content="背景的对齐方式" placement="top">
      <span>背景位置 <i class="el-icon-info" /></span>
    </el-tooltip>
    <el-select v-model="backgroundPosition" placeholder="请选择">
      <el-option
        v-for="item in backgroundPositionList"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>
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
      backgroundPositionList: styleConst.backgroundPosition
    };
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    backgroundPosition: {
      get() {
        const { updateNodeBoxStyle } = this.methods;
        if (!this.boxStyle.backgroundPosition) {
          updateNodeBoxStyle({
            options: {
              backgroundPosition: 'center'
            }
          });
          return 'center';
        }
        return this.boxStyle.backgroundPosition;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            backgroundPosition: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
