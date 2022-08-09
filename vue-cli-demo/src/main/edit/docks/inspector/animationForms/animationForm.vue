<template>
  <el-form
    size="mini"
    label-position="left"
    label-width="80px"
    @submit.native.prevent
  >
    <el-select
      v-model="animationName" filterable size="mini"
      placeholder="请选择驻场动画类型"
    >
      <el-option
        v-for="(item,name) in formList" :key="item.label" :label="item.label"
        :value="name"
      ></el-option>
    </el-select>
    <component
      :is="curComponent.is"
      v-if="curComponent"
      :value="params"
      @updateParams="e=>{$emit('updateParams',e)}"
    ></component>
  </el-form>
</template>

<script>
import formList from './formList';

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      formList: {
        none: {
          label: '无'
        },
        ...formList,
      }
    };
  },
  computed: {
    params() {
      return this.value.params;
    },
    curComponent() {
      if (this.animationName === 'none') return;
      return {
        is: require(`./${this.animationName}`).default
      };
    },
    animationName: {
      get() {
        return this.value.name || 'none';
      },
      set(newVal) {
        let initConfig;
        if (newVal !== 'none') {
          initConfig = { ...this.formList[newVal]?.initConfig, name: newVal };
        }
        this.$emit('initConfig', initConfig);
      }
    }
  },
};
</script>
