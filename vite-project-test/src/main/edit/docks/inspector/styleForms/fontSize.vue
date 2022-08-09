<template>
  <el-row>
    <el-form-item label="字号" label-width="40px">
      <num :style-attr.sync="fontSize" :custom-units="units"></num>
    </el-form-item>
  </el-row>
</template>

<script>
import Num from '../styleComp/Num';

export default {
  components: {
    Num
  },
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
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    units() {
      return [{
        value: 'rem',
        label: 'px',
        desc: '等于根节点的字体尺寸。',
      }];
    },
    fontSize: {
      get() {
        return this.boxStyle.fontSize;
      },
      set(val) {
        const { updateNodeBoxStyle } = this.methods;
        const options = {
          fontSize: val,
        };
        updateNodeBoxStyle({
          options
        });
      }
    }
  }
};
</script>
