<template>
  <div>
    <el-divider content-position="left">
      <span>组件事件配置</span>
    </el-divider>
    <template v-for="(item, index) in eventsConfig">
      <div
        v-if="item"
        :key="index"
      >
        <div>
          <el-tag size="small" :disable-transitions="true">
            事件{{ index + 1 }}
          </el-tag>
          <el-popconfirm
            title="确定删除当前事件吗？"
            @confirm="handleDeleteEvent(index)"
          >
            <i slot="reference" class="el-icon-delete"></i>
          </el-popconfirm>
        </div>

        <EventFormItem
          :value="item"
          :reset-compare-data="resetCompareData"
          @input="itemChange($event,index)"
        >
        </EventFormItem>
      </div>
    </template>
    <el-button
      class="events-btn"
      type="primary"
      plain
      size="mini"
      @click="pushEventConfig"
    >
      <i class="el-icon-circle-plus"></i>
      添加事件
    </el-button>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import EventFormItem from './eventFormItem';

export default {
  components: {
    EventFormItem
  },
  computed: {
    ...mapState(['baseInfo', 'activeNodeId']),
    ...mapGetters(['activeNode', 'declarations']),
    eventsConfig() {
      return this.activeNode.events || [];
    },
    resetCompareData() {
      return {
        enable: false,
        compareSymbol: this.declarations.compareSymbolMap?.EQUAL,
        compareValue: undefined
      };
    }
  },
  methods: {
    ...mapActions(['updateNodeConfig', 'updateNodeEvents']),
    itemChange(newData, index) {
      this.updateNodeEvents({
        options: newData,
        index
      });
    },
    handleDeleteEvent(index) {
      this.updateNodeEvents({
        index,
        del: true
      });
    },
    pushEventConfig() {
      const newEvents = {
        source: this.activeNodeId,
        compare: {
          ...this.resetCompareData
        },
        emitter: undefined,
        target: this.baseInfo.publish_key,
        listener: undefined,
        data: undefined,
      };
      this.updateNodeEvents({
        options: newEvents
      });
    },
  }
};
</script>

<style>
</style>
