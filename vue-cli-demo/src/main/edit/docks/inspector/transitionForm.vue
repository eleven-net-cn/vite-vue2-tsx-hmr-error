<template>
  <div class="transition-form">
    <el-divider content-position="left">
      过渡效果
    </el-divider>
    <el-tag
      v-for="(item,key) in transitions"
      :key="key"
      class="transition-tag"
      closable
      size="small"
      :disable-transitions="true"
      @click.stop="editTransitionDialog(key)"
      @close="handleDelete($event,key)"
    >
      {{ item.aliasName||item.name }}
      <i class="el-icon-edit"></i>
    </el-tag>
    <el-button
      icon="el-icon-plus" size="mini"
      type="primary"
      @click="openCreateTransitionDialog"
    >
      添加过渡效果
    </el-button>
    <el-dialog :visible.sync="showTransitionForm">
      <el-form ref="form" label-width="120px" label-position="left">
        <transitionForm
          :value="currentDialogTransitionMsg" @updateStyles="updateStyles"
          @initConfig="initConfig"
          @updateConfig="updateConfig"
        />
        <el-form-item label="过渡效果名称">
          <el-input v-model="aliasName" size="mini" placeholder="请填写过渡效果名称"></el-input>
        </el-form-item>
        <el-form-item label="hover状态自动使用">
          <el-switch v-model="currentDialogTransitionMsg.hover"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createTransition">
            {{ isUpdateTransition?'更新':'立即创建' }}
          </el-button>
          <el-button @click="showTransitionForm = false">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  mapGetters, mapActions
} from 'vuex';

import transitionForm from './transitionForms/transitionForm.vue';

export default {
  components: {
    transitionForm
  },
  data() {
    return {
      showTransitionForm: false,
      currentDialogTransitionMsg: {},
      isUpdateTransition: false,
      editKey: ''
    };
  },
  computed: {
    ...mapGetters([
      'activeNode',
    ]),
    otherOptions() {
      return this.activeNode.otherOptions || {};
    },
    transitions() {
      return this.activeNode.otherOptions.transitions;
    },
    aliasName: {
      get() {
        return this.currentDialogTransitionMsg.aliasName || this.currentDialogTransitionMsg.name || '';
      },
      set(newVal) {
        this.currentDialogTransitionMsg.aliasName = newVal;
      }
    },
  },
  methods: {
    ...mapActions(['updateNodeOtherOptions', 'updateNodeModId']),
    openCreateTransitionDialog() {
      this.currentDialogTransitionMsg = {
        aliasName: '', hover: false, duration: '300', timingFunction: 'ease-in-out'
      };
      this.showTransitionForm = true;
      this.isUpdateTransition = false;
    },
    // 打开编辑名称的弹窗
    editTransitionDialog(key) {
      this.currentDialogTransitionMsg = { ...this.transitions[key] };
      this.editKey = key;
      this.showTransitionForm = true;
      this.isUpdateTransition = true;
    },
    createTransition() {
      if (this.isUpdateTransition) {
        this.updateNodeOtherOptions({
          options: {
            transitions: {
              ...this.otherOptions.transitions,
              [this.editKey]: {
                ...this.currentDialogTransitionMsg,
                aliasName: this.aliasName
              }
            }
          }
        });
        this.showTransitionForm = false;
        return;
      }
      const modId = this.activeNode.modId;
      this.updateNodeOtherOptions({
        options: {
          transitions: {
            ...this.otherOptions.transitions,
            [`transition${modId}`]: {
              ...this.currentDialogTransitionMsg,
              aliasName: this.aliasName
            }
          }
        }
      });
      this.updateNodeModId();
      this.showTransitionForm = false;
    },
    handleDelete(e, key) {
      e.preventDefault();
      const newTransitions = {
        ...this.transitions
      };
      delete newTransitions[key];
      this.updateNodeOtherOptions({
        options: {
          transitions: newTransitions
        }
      });
    },
    updateStyles(styles = {}) {
      this.currentDialogTransitionMsg = {
        ...this.currentDialogTransitionMsg,
        styles: {
          ...(this.currentDialogTransitionMsg.styles || {}),
          ...styles
        }
      };
    },
    updateConfig(config = {}) {
      this.currentDialogTransitionMsg = {
        ...this.currentDialogTransitionMsg,
        ...config
      };
    },
    initConfig(config) {
      const { aliasName, hover } = this.currentDialogTransitionMsg;
      this.currentDialogTransitionMsg = {
        ...config,
        aliasName,
        hover
      };
    },
  }
};
</script>
<style lang="scss" scoped>
.transition-form {
  .transition-tag {
    margin-right: 20px;
    margin-bottom: 10px;
    cursor: pointer;
  }
}
</style>
