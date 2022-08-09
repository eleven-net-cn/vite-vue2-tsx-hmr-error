<template>
  <div>
    <el-form-item label="透明度" label-width="70px">
      <el-input-number
        :value="opacity"
        style="width:120px"
        :min="0"
        :step="0.1"
        :max="1"
        @change="change"
      ></el-input-number>
    </el-form-item>
  </div>
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
  data() {
    return {
      opacity: 1
    };
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
  },
  watch: {
    'boxStyle.opacity': {
      handler(newVal) {
        newVal = Number(newVal ?? 1);
        if (Number(newVal) === this.num) return;
        this.opacity = newVal;
      },
      immediate: true,
    }
  },
  methods: {
    // slider有个bug，只能这种形式
    change(opacity) {
      const { updateNodeBoxStyle } = this.methods;
      updateNodeBoxStyle({
        options: {
          opacity: String(opacity)
        }
      });
    }
  },
};
</script>
