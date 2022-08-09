<template>
  <el-form
    size="mini"
    label-position="left"
    label-width="80px"
    @submit.native.prevent
  >
    <el-form-item label="联动环境">
      <el-select
        v-model="type" filterable
        placeholder="请选择"
      >
        <el-option
          v-for="(item,key) in canLinkList"
          :key="key"
          :label="item.label"
          :value="key"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <StateItem :declarations="declarations" :link-msg="linkMsg" />
    <el-form-item label="联动状态">
      <el-select
        v-model="state" filterable
        placeholder="请选择"
      >
        <el-option
          v-for="item in stateItemList"
          :key="item.stateKey"
          :label="item.stateName"
          :value="item.stateKey"
        >
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import StateItem from './stateItem';
import { getDefaultZone } from './utils';

export default {
  components: {
    StateItem
  },
  props: {
    linkMsg: {
      type: Object,
      default() {
        return {};
      }
    },
    canLinkList: {
      type: Object,
      default() {
        return {};
      },
    }
  },
  computed: {
    ...mapState(['baseInfo', 'compList']),
    ...mapGetters(['mapNodes', 'activeNode']),
    type: {
      get() {
        return this.linkMsg.type;
      },
      set(newVal) {
        if (newVal === this.linkMsg.type) return;
        this.$set(this.linkMsg, 'type', newVal);
        const curFormType = this.formType;
        this.typeChangeHandler(curFormType);
      }
    },
    state: {
      get() {
        return this.linkMsg.stateKey;
      },
      set(newVal) {
        this.$set(this.linkMsg, 'stateKey', newVal);
      }
    },
    declarations() {
      return this.canLinkList[this.type];
    },
    formType() {
      return this.declarations?.formType;
    },
    stateItemList() {
      // { stateKey,stateName }
      return this.activeNode.otherOptions.stateList || [];
    },
  },
  methods: {
    typeChangeHandler(curFormType) {
      this.$emit('handleResetEvent');
      const resetMap = {
        time: {
          timeType: 'normal',
          startTime: null,
          endTime: null,
          timeZone: (this.baseInfo.bizList.length === 1 ? getDefaultZone(this.baseInfo.bizList[0]) : undefined) ?? 8,
          timeMap: {}
        },
        // search中没有val就代表任意
        default: {
          val: null,
          key: null,
          equal: true
        }
      };
      const resetMsg = resetMap[curFormType] || resetMap.default;
      Object.keys(resetMsg).forEach(key => {
        this.$set(this.linkMsg, key, resetMsg[key]);
      });
    },
  }
};
</script>
