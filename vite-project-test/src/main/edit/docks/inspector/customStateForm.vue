<template>
  <div v-if="canSetCustomState">
    <el-divider content-position="left">
      自定义数据来源
    </el-divider>
    <CompCustomStateFormItem
      v-for="(item) in mi18nList" :key="item.optionName" :label="item.optionLabel"
      :type="item.type"
      :value="getItemMsg(item.optionName)" style="marginBottom:20px"
      @update="itemChange($event,item.optionName)"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { compareVersion } from '@/utils/';
import CompCustomStateFormItem from './compCustomStateFormItem';

export default {
  components: {
    CompCustomStateFormItem
  },
  data() {
    return {
      visible: false,
      formData: {
        mi18nKeys: [],
      }
    };
  },
  computed: {
    ...mapState(['baseInfo']),
    ...mapGetters(['activeNodePro', 'activeNode', 'allMi18nMsgList', 'isPageCompType']),
    declarations() {
      return this.activeNodePro.declarations;
    },
    // 全局状态的设置就不多起一个字段了，直接跟着多语言来
    mi18nList() {
      return this.declarations.mi18n || [];
    },
    canSetCustomState() {
      return this.mi18nList?.length && this.compareVersion('ge', '2.7.52');
    },
    compCustomStateMsg() {
      return this.activeNode.otherOptions.customState || {};
    },
  },
  methods: {
    ...mapActions(['updateNodeCustomState']),
    getItemMsg(name) {
      return this.compCustomStateMsg[name];
    },
    itemChange(options, name) {
      this.updateNodeCustomState({
        options,
        name,
      });
    },
    compareVersion(c, v) {
      return compareVersion(this.baseInfo.buildVer, c, v);
    },
  }
};
</script>
<style lang="scss" scoped>
.comp-mi18n {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .left-item {
    display: flex;
    align-items: center;
  }
}
</style>
