<template>
  <div class="state-form">
    <el-divider content-position="left">
      状态设置
    </el-divider>
    <el-tag
      v-for="item in stateList"
      :key="item.stateKey"
      :disable-transitions="true"
      class="state-tag"
      closable
      :type="activeNodeStateKey === item.stateKey?'success':''"
      size="small"
      @click="checkoutState(item.stateKey)"
      @close="handleDelete($event,item.stateKey)"
    >
      {{ item.stateName }}
      <i class="el-icon-edit" @click.stop="editStateDialog(item.stateKey)"></i>
    </el-tag>
    <el-button
      v-if="!mi18nStateKey" icon="el-icon-plus" size="mini"
      type="primary"
      @click="openCreateStateDialog"
    >
      添加状态
    </el-button>

    <el-dialog :visible.sync="showStateForm">
      <el-form ref="form" :model="options" label-width="120px">
        <el-form-item label="状态名称">
          <el-input v-model="currentDialogStateMsg.stateName" placeholder="请填写状态名称"></el-input>
        </el-form-item>
        <el-form-item label="hover状态自动使用">
          <el-switch v-model="currentDialogStateMsg.hover"></el-switch>
        </el-form-item>
        <el-form-item label="状态变更动效">
          <el-switch :value="transition" @change="newVal=>transition = newVal"></el-switch>
        </el-form-item>
        <template v-if="transition">
          <el-form-item label="过渡时间(ms)">
            <el-input-number
              :value="duration"
              style="width:100%"
              :min="0"
              :step="50"
              size="mini"
              placeholder="请输入过渡时间(ms)" @change="num => duration = num"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="贝塞尔曲线">
            <el-select
              v-model="timingFunction" filterable size="mini"
              placeholder="请选择符合规格的贝塞尔曲线"
              allow-create
              default-first-option
            >
              <el-option
                v-for="(item) in timingFunctionList" :key="item.label" :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="createState">
            {{ isUpdateState?'更新':'立即创建' }}
          </el-button>
          <el-button @click="showStateForm = false">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions
} from 'vuex';

export default {
  data() {
    return {
      showStateForm: false,
      // 目前可以多状态的配置
      stateKeyNameList: ['boxStyle', 'options', 'config'],
      currentDialogStateMsg: {
        stateName: '',
        stateKey: '',
        // 在hover的时候自动使用
        hover: false
      },
      isUpdateState: false,
      timingFunctionList: [
        {
          label: '默认',
          value: 'ease-in-out'
        },
        {
          label: '缓入',
          value: 'ease-in'
        },
        {
          label: '缓出',
          value: 'ease-out'
        }
      ]
    };
  },
  computed: {
    ...mapState([
      'activeNodeStateKey'
    ]),
    ...mapGetters(['activeNode', 'activeNodeState', 'mi18nStateKey']),
    boxStyle() {
      return this.activeNode.boxStyle;
    },
    options() {
      return this.activeNode.options;
    },
    config() {
      return this.activeNode;
    },
    stateList() {
      // { stateKey,stateName }
      return this.activeNode.otherOptions.stateList || [];
    },
    transition: {
      get() {
        return Boolean(this.currentDialogStateMsg.transition);
      },
      set(newVal) {
        if (newVal) {
          this.$set(this.currentDialogStateMsg, 'transition', {
            duration: '300',
            timingFunction: 'ease-in-out'
          });
          return;
        }
        this.$set(this.currentDialogStateMsg, 'transition', undefined);
      }
    },
    duration: {
      get() {
        return Number(this.currentDialogStateMsg.transition.duration) || 300;
      },
      set(newVal) {
        this.$set(this.currentDialogStateMsg.transition, 'duration', String(newVal));
      }
    },
    timingFunction: {
      get() {
        return this.currentDialogStateMsg.transition.timingFunction || '';
      },
      set(newVal) {
        this.$set(this.currentDialogStateMsg.transition, 'timingFunction', newVal || 'ease-in-out');
      }
    },

  },
  methods: {
    ...mapMutations(['updateActiveNodeStateKey']),
    ...mapActions(['updateNodeBoxStyle', 'updateNodeModId', 'updateNodeConfig', 'updateNodeOtherOptions', 'updateNodeOptions']),
    // 打开创建的弹窗
    openCreateStateDialog() {
      const modId = this.activeNode.modId;
      this.currentDialogStateMsg = { stateKey: `pzstate${modId}-`, stateName: `state${modId}`, hover: false };
      this.showStateForm = true;
      this.isUpdateState = false;
    },
    // 打开编辑名称的弹窗
    editStateDialog(key) {
      this.currentDialogStateMsg = { ...this.activeNode.otherOptions.stateList.find(item => item.stateKey === key) };
      this.showStateForm = true;
      this.isUpdateState = true;
    },
    //
    checkoutState(key) {
      if (key === this.activeNodeStateKey) {
        key = '';
      }
      this.updateActiveNodeStateKey(key);
    },
    createState() {
      const curStateList = this.activeNode.otherOptions.stateList || [];
      let newList;
      if (this.isUpdateState) {
        const index = curStateList.findIndex(item => item.stateKey === this.currentDialogStateMsg.stateKey);
        newList = [...curStateList];
        newList[index] = { ...this.currentDialogStateMsg };
      } else {
        newList = [...curStateList, { ...this.currentDialogStateMsg }];
      }
      this.updateNodeOtherOptions({
        options: {
          stateList: newList
        }
      });
      this.updateNodeModId();
      this.showStateForm = false;
    },
    // 删除该状态的所有option
    handleDelete(e, stateKey) {
      e.stopPropagation();
      this.stateKeyNameList.forEach((namespace) => {
        // 更新对应options
        const updateMethods = `updateNode${namespace.toUpperCase().slice(0, 1) + namespace.slice(1)}`;
        if (namespace === 'config') {
          const delKeyList = [];
          Object.keys(this[namespace]).forEach(key => {
            if (key.includes(stateKey)) {
              delKeyList.push(key);
            }
            this[updateMethods]({
              del: true,
              keys: delKeyList
            });
          });
        } else {
          const newConfig = {
            ...this[namespace],
          };
          Object.keys(this[namespace]).forEach(key => {
            if (key.includes(stateKey)) {
              delete newConfig[key];
            }
          });
          this[updateMethods]({
            options: newConfig,
            reset: true
          });
        }
      });
      // 如果当前正激活，则取消激活
      if (stateKey === this.activeNodeStateKey) {
        this.updateActiveNodeStateKey('');
      }
      const curStateList = [...this.activeNode.otherOptions.stateList];
      const index = curStateList.findIndex(item => item.stateKey === stateKey);
      curStateList.splice(index, 1);
      this.updateNodeOtherOptions({
        options: {
          stateList: curStateList
        }
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.state-form {
  .state-tag {
    margin-right: 20px;
    margin-bottom: 10px;
    i {
      cursor: pointer;
    }
  }
}
</style>
