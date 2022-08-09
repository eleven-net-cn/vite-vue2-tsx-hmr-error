<template>
  <div>
    <el-divider content-position="left">
      入场动画
    </el-divider>
    <el-select
      v-model="transitionEnterKey" filterable size="mini"
      placeholder="请选择过渡效果类型"
    >
      <el-option
        v-for="(item,key) in transitions" :key="key" :label="item.aliasName"
        :value="key"
      ></el-option>
    </el-select>
    <el-divider content-position="left">
      出场动画
    </el-divider>
    <el-select
      v-model="transitionLeaveKey" filterable size="mini"
      placeholder="请选择过渡效果类型"
    >
      <el-option
        v-for="(item,key) in transitions" :key="key" :label="item.aliasName"
        :value="key"
      ></el-option>
    </el-select>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters
} from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'activeNode',
    ]),
    otherOptions() {
      return this.activeNode.otherOptions || {};
    },
    transitions() {
      return this.otherOptions.transitions || {};
    },
    transitionEnter() {
      return this.otherOptions.transitionEnter || {};
    },
    transitionLeave() {
      return this.otherOptions.transitionLeave || {};
    },
    transitionEnterKey: {
      get() {
        return this.transitionEnter.transitionKey;
      },
      set(newVal) {
        this.updateNodeOtherOptions({
          options: {
            transitionEnter: {
              ...this.transitionEnter,
              transitionKey: newVal
            }
          }
        });
      }
    },
    transitionLeaveKey: {
      get() {
        return this.transitionLeave.transitionKey;
      },
      set(newVal) {
        this.updateNodeOtherOptions({
          options: {
            transitionLeave: {
              ...this.transitionLeave,
              transitionKey: newVal
            }
          }
        });
      }
    },
  },
  methods: {
    ...mapActions(['updateNodeOtherOptions'])
  }
};
</script>
