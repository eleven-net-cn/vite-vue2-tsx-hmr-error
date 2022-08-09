<template>
  <div class="puzzle-tools">
    <div class="puzzle-coms">
      <el-tabs v-model="activetab">
        <el-tab-pane label="前端组件" name="fe">
          <div class="puzzle-base">
            <el-button
              type="primary" size="mini" icon="el-icon-plus"
              @click="createDialog"
            >
              添加弹窗
            </el-button>
          </div>
          <div
            class="puzzle-tools-group"
          >
            <div
              v-for="comp in feCompList"
              :key="comp.name"
              draggable="true"
              drag-type="comp"
              :comp-name="comp.name"
              class="puzzle-comp"
              :class="{'puzzle-comp--disable': comp.pageType === 'PageTypePage' && isPageCompType}"
            >
              <i :class="comp.__dev__ ? getDevCompIcon(comp) : comp.icon"></i>
              {{ comp.label }} {{ comp.nodeCategory }}
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="inMerlin" label="后端模块" name="be">
          <func-module></func-module>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import {
  mapActions, mapGetters
} from 'vuex';
import { QS } from '@me/utils';
import funcModule from './funcModule';

export default {
  name: 'CompList',

  components: {
    funcModule
  },

  data() {
    return {
      inMerlin: !!QS.inMerlin,
      activetab: 'fe',
      blackList: ['@puzzle/dialog']
    };
  },
  computed: {
    ...mapGetters([
      'compListArray',
      'pageCompNode',
      'isPageCompType'
    ]),
    feCompList() {
      return this.compListArray.filter(item => item.type === 'FEModuleTypeFE' && !this.blackList.includes(item.name));
    },
  },
  methods: {
    ...mapActions(['addDialogRootNode', 'updateNodeInNewScreen']),
    createDialog() {
      this.addDialogRootNode();
    },
    getDevCompIcon(comp) {
      const { __dev__: { state } = {} } = comp;
      switch (state) {
      case 'compiling':
        return 'el-icon-loading';
      case 'done':
        return 'el-icon-finished';
      case 'error':
        return 'el-icon-warning';
      default:
        return 'el-icon-question';
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.puzzle-tools {
  display: flex;
  flex-direction: column;
  .puzzle-base {
    flex: 1;
    margin-bottom: 20px;
  }
  .puzzle-coms {
    flex: auto;
  }

  .puzzle-comp {
    &--disable {
      pointer-events: none;
      cursor: not-allowed !important;
      color: #aaa;
    }
  }

  .puzzle-local {
    margin-top: 10px;

    &-error {
      margin-top: 10px;
      color: red;
      font-size: 18px;
    }
  }

  .puzzle-tools-local {
    margin-top: 10px;

    .puzzle-comp {
      padding-top: 10px;
      justify-content: flex-start;
    }
  }
}
</style>
