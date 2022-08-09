<template>
  <el-form
    size="mini"
    label-position="left"
    label-width="80px"
    @submit.native.prevent
  >
    <el-form-item label="联动组件">
      <el-select
        v-model="target" filterable
        placeholder="请选择联动组件"
      >
        <el-option
          v-for="(item,key) in canLinkList"
          :key="key"
          :label="item.node.alias"
          :value="key"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <template v-if="target">
      <template v-for="(item,key) in targetStateDeclarations">
        <!-- 组件自己的 组件联动选项 -->
        <el-form-item v-if="!item.noLink" :key="key" :label="item.label">
          <!-- 根据不同类型处理输入值 -->
          <el-select
            v-if="item.type === 'string'"
            :value="linkMsg.state[key]" filterable
            @change="handleChange($event,{type:item.type, key:key})"
          >
            <el-option
              v-for="val in item.options"
              :key="val.value"
              :label="val.label"
              :value="val.value"
            >
            </el-option>
          </el-select>
          <el-input-number
            v-else-if="item.type === 'number'" :min="item.rule&&item.rule.min" :value="linkMsg.state[key]"
            controls-position="right"
            @change="handleChange($event,{type:item.type, key:key})"
          ></el-input-number>
          <el-select
            v-else-if="item.type === 'boolean'"
            no-data-text="忽略"
            :value="linkMsg.state[key]" size="mini"
            @change="handleChange($event,{type:item.type, key:key})"
          >
            <el-option
              v-for="val in booleanList" :key="val.label" :label="val.label"
              :value="val.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </template>
    </template>
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
    <el-form-item v-if="curFastSyncMsg" label="快捷同步">
      <el-select
        v-model="linkMsg.fastSync" filterable
        placeholder="请选择"
      >
        <el-option
          v-for="item in sourceDeclarationsEmitters"
          :key="item.name"
          :label="item.label"
          :value="item.name"
        >
        </el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import LINKTYPE from '@/constants/linkType';

export default {
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
  data() {
    return {
      booleanList: [
        {
          label: 'yes',
          value: true
        },
        {
          label: 'no',
          value: false
        },
        {
          label: '忽略',
          value: null
        }
      ]
    };
  },
  computed: {
    ...mapState(['baseInfo', 'compList']),
    ...mapGetters(['mapNodes', 'activeNode']),
    target: {
      get() {
        return this.linkMsg.target;
      },
      set(newVal) {
        if (newVal === this.linkMsg.target) return;
        this.$set(this.linkMsg, 'target', newVal);
        this.$set(this.linkMsg, 'state', {});
        this.$set(this.linkMsg, 'paramStateMap', this.paramStateMap);
        this.$set(this.linkMsg, 'fastSync', '');
        // 重新设置联动组件快捷联动名
        this.$set(this.linkMsg, 'name', this.curFastSyncMsg?.name);
      }
    },
    // 描述每个state的属性
    paramStateMap() {
      const paramStateMap = {};
      Object.keys(this.targetStateDeclarations).forEach((state) => {
        paramStateMap[state] = {
          // 添加不同属性
          linkType: this.targetStateDeclarations[state].linkType || LINKTYPE.DEFAULT
        };
      });
      return paramStateMap;
    },
    // 当前的联动目标组件的相关快捷同步信息
    curFastSyncMsg() {
      return this.canLinkList[this.target]?.fastSync;
    },
    state: {
      get() {
        return this.linkMsg.stateKey;
      },
      set(newVal) {
        this.$set(this.linkMsg, 'stateKey', newVal);
      }
    },
    stateItemList() {
      // { stateKey,stateName }
      return this.activeNode.otherOptions.stateList || [];
    },
    // 目标组件 or 页面的自定义联动面板
    targetStateDeclarations() {
      if (!this.target) return {};
      return this.canLinkList[this.target].linkStateMsg;
    },
    sourceDeclarationsEmitters() {
      const sourceNode = this.mapNodes[this.activeNode.id];
      if (!sourceNode) return [];
      const emmitersList = this.compList[sourceNode.name].main.declarations?.event?.emitters || [];
      return [{ label: '无', name: '' }, ...emmitersList];
    },
    stateList() {
      if (!this.target) return;
      return Object.keys(this.linkMsg.state).map(key => ({ key, val: this.linkMsg.state[key] }));
    }
  },
  methods: {
    // 改变联动状态
    handleChange(val, { type, key }) {
      if (type === 'number') {
        val = Number(val);
        // 类型为number的情况下，如果值为NAN，则设置为undefined
        // eslint-disable-next-line no-self-compare
        if (val !== val) {
          val = undefined;
        }
      }
      this.$set(this.linkMsg.state, key, val);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
