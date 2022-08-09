<template>
  <el-collapse v-if="canLinkList" :value="['comp']">
    <el-collapse-item title="组件联动" name="comp">
      <div v-for="(item,index) in linkMsgList" :key="index">
        <div>
          <el-tag size="small" :disable-transitions="true">
            联动{{ index + 1 }}
          </el-tag>
          <el-popconfirm
            title="确定删除当前联动？"
            @confirm="handleDeleteEvent(index)"
          >
            <i slot="reference" class="el-icon-delete"></i>
          </el-popconfirm>
        </div>
        <LinkFormItem
          :link-msg="item"
          :can-link-list="canLinkList"
        />
      </div>
      <el-button
        class="events-btn"
        type="primary"
        plain
        size="mini"
        @click="pushEventConfig"
      >
        <i class="el-icon-circle-plus"></i>
        添加联动
      </el-button>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import LinkFormItem from './linkFormItem.vue';

export default {
  components: {
    LinkFormItem
  },
  computed: {
    ...mapState(['compList', 'baseInfo', 'platMsg']),
    ...mapGetters(['activeNode', 'canLinkList']),
    // 可供联动的节点
    linkMsgList() {
      return this.activeNode.otherOptions.linkMsgList || [];
    }
  },
  methods: {
    ...mapActions(['updateNodeOtherOptions']),
    pushEventConfig() {
      this.updateNodeOtherOptions({
        options: {
          linkMsgList: [...this.linkMsgList, {
            // 存放联动的数据
            state: {},
            // 每个state的属性描述信息
            paramStateMap: {},
            target: '',
            fastSync: '',
            stateKey: '',
            name: undefined
          }]
        }
      });
    },
    handleDeleteEvent(index) {
      const linkMsgList = [...this.linkMsgList];
      linkMsgList.splice(index, 1);
      this.updateNodeOtherOptions({
        options: {
          linkMsgList
        }
      });
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
