<template>
  <el-form-item label="点击穿透" label-width="50px">
    <el-radio-group v-model="pointerEvents">
      <el-radio-button v-for="item in pointerEventsData" :key="item.value" :label="item.value">
        {{ item.label }}
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
  data() {
    return {
      pointerEventsData: [
        {
          label: '继承',
          value: 'inherit'
        },
        {
          label: '点击穿透',
          value: 'none'
        },
        {
          label: '可点击',
          value: 'auto'
        }
      ]
    };
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    pointerEvents: {
      get() {
        return this.boxStyle.pointerEvents || 'inherit';
      },
      set(val) {
        console.log(val);
        const { updateNodeBoxStyle } = this.methods;
        if (val === 'inherit') {
          val = undefined;
        }
        updateNodeBoxStyle({
          options: {
            pointerEvents: val
          }
        });
      }
    }
  },
};
</script>

<style>
</style>
