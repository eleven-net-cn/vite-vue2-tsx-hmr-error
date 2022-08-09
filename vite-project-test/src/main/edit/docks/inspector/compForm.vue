<template>
  <div class="comp-form">
    <el-form
      ref="compForm"
      :model="compForm"
      size="mini"
      label-position="left"
      label-width="80px"
      @submit.native.prevent
    >
      <ConfigFormItem name="showEditOptions" />
      <ConfigFormItem name="fixAspectRatio" />
      <el-form-item v-if="canSelectshowPage" label="展示屏幕">
        <el-select
          v-model="showPageList"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择指定展示的屏幕"
        >
          <el-option
            v-for="(item,index) in fullpageNodes"
            :key="item.id"
            :label="`第${index+1}页 ${item.alias}`"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <template v-if="showStyleForm">
        <el-divider content-position="left">
          属性设置
        </el-divider>
        <styleForm />
      </template>
      <el-divider content-position="left">
        组件设置
      </el-divider>
      <CompOptionsForm />
      <CompMi18n />
      <CustomStateForm />
      <MutiState />
      <el-divider content-position="left">
        其他设置
      </el-divider>
      <!-- 直接v-if取消掉 -->
      <ConfigFormItem name="disabled" />
      <!-- v-show -->
      <ConfigFormItem name="enabled" />
      <template v-if="showStyleForm">
        <el-form-item v-if="!isFullScreen&&boxStyle.position !== 'relative'&&platform === 'pc'" label="左右吸附">
          <el-switch v-model="attachSlides">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="(isSlidePage&&activeNode.otherOptions&&activeNode.nodeCategory ==='fullpageContainer'&&platMsg.body.fixToBody)||platMsg.body.pcCover" label="自定义容器">
          <el-switch v-model="fixToBody">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="isFullScreen&&boxStyle.position === 'fixed'" label="防止刘海遮挡">
          <el-switch v-model="paddingBangs">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="boxStyle.position !== 'relative'" label="强制左右居中">
          <el-switch v-model="forceCenter">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="boxStyle.position !== 'relative'" label="强制上下居中">
          <el-switch v-model="forceMiddle">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="canSetPadding" label="最小屏幕距离">
          <el-input v-model="minPadding" size="mini"></el-input>
        </el-form-item>
        <el-button
          v-if="isFullScreen&&activeNodePro.parentNode" size="mini" type="primary"
          @click="moveOuter"
        >
          在所有页面使用
        </el-button>
      </template>
      <el-form-item label="组件版本">
        <el-input v-model="activeNode.version"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapActions
} from 'vuex';
import { getCssValAndUnit } from '@/utils';
import MutiState from './mutiState.vue';
import styleForm from './styleForm';
import ConfigFormItem from './configForms/index';
import CompMi18n from './compMi18n';
import CompOptionsForm from './compOptionsForm.vue';
import CustomStateForm from './customStateForm';

export default {
  components: {
    styleForm,
    ConfigFormItem,
    MutiState,
    CompMi18n,
    CompOptionsForm,
    CustomStateForm
  },
  props: {
    methods: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      compForm: {
        position: 'relative'
      },
    };
  },
  computed: {
    ...mapState([
      'nodes',
      'platform',
      'platMsg'
    ]),

    ...mapGetters([
      'activeNode',
      'fullpageNodes',
      'mapProNodes',
      'activeNodePro',
      'isFullScreen'
    ]),
    boxStyle() {
      return this.activeNode.boxStyle;
    },
    canSetPadding() {
      const { fixToBody, pcCover } = this.platMsg.body;
      const { position } = this.boxStyle;
      // 非吸附于body或者pc填充的时候才可以用
      const fixedEnable = (!fixToBody || pcCover) && position === 'fixed';
      // 非吸附body布局，或者是cover布局，或者是absolute元素，可以设置吸附距离
      return this.isFullScreen && (fixedEnable || position === 'absolute');
    },
    fixToBody: {
      get() {
        return this.activeNode.otherOptions?.fixToBody;
      },
      set(newVal) {
        if (newVal) {
          this.updateNodeOtherOptions({
            options: {
              fixToBody: true,
            }
          });
          // 可以设置宽高
          this.updateNodesEditOptions({
            options: {
              noResize: false
            },
          });
          // 将宽高设置为默认自动
          this.updateNodeBoxStyle({
            options: {
              height: 'auto'
            },
          });
        } else {
          this.updateNodeOtherOptions({
            options: {
              fixToBody: false,
            }
          });
          this.updateNodesEditOptions({
            options: {
              noResize: true
            },
          });
          this.updateNodeBoxStyle({
            options: {
              height: '100%'
            },
          });
        }
      }
    },
    attachSlides: {
      get() {
        return this.activeNode.otherOptions.attachSlides;
      },
      set(newVal) {
        this.updateNodeOtherOptions({
          options: {
            attachSlides: newVal
          }
        });
      }
    },
    paddingBangs: {
      get() {
        return this.activeNode.otherOptions.paddingBangs;
      },
      set(newVal) {
        this.updateNodeOtherOptions({
          options: {
            paddingBangs: newVal
          }
        });
      }
    },
    // 最小padding layout距离
    minPadding: {
      get() {
        const minPadding = this.activeNode.otherOptions.minPadding;
        return minPadding ? Math.round(minPadding * 100).toString() : '';
      },
      set(val) {
        // 值不为空字符串，并且值不为有效number的情况下禁止设置
        // eslint-disable-next-line no-self-compare
        const canSet = Number(val) === Number(val);
        if (!canSet) return;
        this.updateNodeOtherOptions({
          options: {
            // 值为空字符串的情况下设置为undefined
            minPadding: val ? (Math.round(val) / 100).toString() : undefined
          }
        });
      }
    },
    forceCenter: {
      get() {
        return this.activeNode.otherOptions.forceCenter;
      },
      set(newVal) {
        const { updateNodeBoxStyle } = this;
        const { boxStyle } = this;
        if (newVal) {
          const formatVal = getCssValAndUnit(boxStyle.width);
          updateNodeBoxStyle({
            options: {
              left: `calc(50% - ${formatVal.val / 2}${formatVal.unit})`,
              right: undefined,
            }
          });
        }
        this.updateNodeOtherOptions({
          options: {
            forceCenter: newVal
          }
        });
      }
    },
    forceMiddle: {
      get() {
        return this.activeNode.otherOptions.forceMiddle;
      },
      set(newVal) {
        if (newVal) {
          const { updateNodeBoxStyle } = this;
          const { boxStyle } = this;
          const formatVal = getCssValAndUnit(boxStyle.height);
          updateNodeBoxStyle({
            options: {
              top: `calc(50% - ${formatVal.val / 2}${formatVal.unit})`,
              bottom: undefined,
            }
          });
        }
        this.updateNodeOtherOptions({
          options: {
            forceMiddle: newVal
          }
        });
      }
    },
    isSlidePage() {
      return this.platMsg.mode === 'slidepage';
    },
    canSelectshowPage() {
      // eslint-disable-next-line max-len
      return this.activeNode.enabled && this.isFullScreen && this.activeNode.otherOptions && this.mapProNodes[this.activeNode.id].rootNode.nodeCategory !== 'fullpageContainer';
    },
    showPageList: {
      get() {
        return this.activeNode.otherOptions.showPageList;
      },
      set(val) {
        this.updateNodeOtherOptions({
          options: {
            showPageList: val
          }
        });
      },
    },
    showStyleForm() {
      return this.activeNodePro?.editOptions && !this.activeNodePro.editOptions.noEditStyle;
    },
  },
  methods: {
    ...mapActions(['removeNode', 'addNode', 'updateActiveNodeId', 'updateNodesEditOptions', 'updateNodeBoxStyle', 'updateNodeOtherOptions']),
    moveOuter() {
      const curNode = this.activeNode;
      const { id } = curNode;
      this.removeNode({ id });
      this.addNode({ config: curNode, index: this.nodes.length });
      this.$nextTick(() => {
        this.updateActiveNodeId(id);
      });
    },
  }
};
</script>

<style lang="scss" scoped>
.comp-form {
  padding-bottom: 20px;
}

.events-btn {
  margin-bottom: 20px;
}
</style>
<style lang="scss">
.puzzle-edit
  .comp-form
  .comp-form-options
  .el-form
  .el-form-item
  .el-input-number--mini {
  width: 130px;
}

.comp-form-options {
  .el-form-item__label {
    width: 80px !important;
  }

  .el-form-item__content {
    margin-left: 80px !important;
  }
}
</style>
