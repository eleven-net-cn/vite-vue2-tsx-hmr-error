<template>
  <el-form-item label="鼠标光标">
    <el-select v-model="boxStyle.cursor" placeholder="请选择">
      <el-option
        v-for="item in cursorValues"
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
      cursorValues: styleConst.cursorValues,
    };
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    cursor: {
      get() {
        return this.boxStyle.cursor;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        updateNodeBoxStyle({
          options: {
            cursor: val
          }
        });
      }
    }
  },
};
</script>
