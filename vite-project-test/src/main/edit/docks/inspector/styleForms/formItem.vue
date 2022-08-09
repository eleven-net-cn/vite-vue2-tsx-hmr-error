<template>
  <component
    :is="curComponent.is"
    v-if="curComponent.enable"
    :data="data"
    :methods="methods"
    :env-list="envList"
    :options="formOptions"
  ></component>
</template>

<script>

import formList from './formList';

export default {
  props: {
    data: {
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
    },
    methods: {
      type: Object,
      default() {
        return {};
      }
    },
    formOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    name: {
      type: String
    },
  },
  computed: {
    curComponent() {
      const node = formList[this.name];
      return {
        ...formList[this.name],
        enable: this.methods.checkEnable(node.include, node.exclude),
        is: require(`./${this.name}`).default
      };
    }
  },
};
</script>
