<template>
  <el-collapse v-if="canLinkList" :value="['env']">
    <el-collapse-item title="环境联动" name="env">
      <div v-for="(item,index) in envStateList" :key="index">
        <div>
          <el-tag size="small" :disable-transitions="true">
            联动{{ index + 1 }}
          </el-tag>
          <el-popconfirm
            title="确定删除当前联动？"
            @confirm="handleResetEvent(index)"
          >
            <i slot="reference" class="el-icon-delete"></i>
          </el-popconfirm>
        </div>
        <EnvLinkFormItem
          :link-msg="item"
          :can-link-list="canLinkList"
          @resetLinkMsg="handleResetEvent(index,true)"
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
import EnvLinkFormItem from './envLinkFormItem.vue';
import canLinkList from './canLinkList';

export default {
  components: {
    EnvLinkFormItem
  },
  data() {
    return {
      canLinkList
    };
  },
  computed: {
    ...mapState(['compList', 'baseInfo']),
    ...mapGetters(['activeNode', 'dfsNodes']),
    envStateList() {
      return this.activeNode.otherOptions.envStateList || [];
    }
  },
  methods: {
    ...mapActions(['updateNodeOtherOptions']),
    getDefaultData() {
      return {
        stateKey: '',
        type: undefined
      };
    },
    pushEventConfig() {
      this.updateNodeOtherOptions({
        options: {
          envStateList: [...this.envStateList, this.getDefaultData()]
        }
      });
    },
    handleResetEvent(index, reset = false) {
      const envStateList = [...this.envStateList];
      if (reset) {
        const { stateKey, type } = envStateList[index];
        envStateList.splice(index, 1, {
          stateKey,
          type
        });
      } else {
        envStateList.splice(index, 1);
      }
      this.updateNodeOtherOptions({
        options: {
          envStateList
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
