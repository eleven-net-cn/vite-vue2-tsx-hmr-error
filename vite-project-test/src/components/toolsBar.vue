<template>
  <div class="puzzle-toolsbar">
    <div class="puzzle-toolsbar__actions">
      <el-tooltip
        v-if="mi18nAdminUrl"
        class="puzzle-toolsbar__action"
        effect="dark"
        content="前往多语言翻译页"
        :enterable="false"
        placement="left"
      >
        <el-link :href="mi18nAdminUrl" target="_blank">
          <i class="el-icon-link" />
        </el-link>
      </el-tooltip>

      <el-tooltip
        class="puzzle-toolsbar__action"
        effect="dark"
        content="撤销"
        :enterable="false"
        placement="left"
      >
        <i class="iconfont icon-revocation" @click="handleUndo" />
      </el-tooltip>
      <el-tooltip
        class="puzzle-toolsbar__action"
        effect="dark"
        content="重做"
        :enterable="false"
        placement="left"
      >
        <i class="iconfont icon-forward" @click="handleRedo" />
      </el-tooltip>

      <el-popover
        v-if="!templateId"
        placement="right"
        trigger="click"
        @show="handleEditList"
      >
        <el-table
          :data="editList"
          max-height="250"
        >
          <el-table-column
            width="60"
            property="version"
            label="版本"
          >
          </el-table-column>
          <el-table-column
            width="150"
            property="ctime"
            label="保存时间"
          >
          </el-table-column>
          <el-table-column
            width="120"
            property="user"
            label="操作人"
          >
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            align="center"
          >
            <template slot-scope="scope">
              <el-popconfirm
                title="确认使用当前配置覆盖吗？"
                @confirm="handleConfirm(scope.row)"
              >
                <el-button
                  v-if="scope.$index"
                  slot="reference"
                  v-mihoyo-auth="{authKey: 'puzzle'}"
                  type="text"
                  size="small"
                >
                  回滚配置
                </el-button>
                <span v-else slot="reference">/</span>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-tooltip
          slot="reference"
          class="puzzle-toolsbar__action"
          effect="dark"
          content="历史编辑记录"
          :enterable="false"
          placement="left"
        >
          <i class="el-icon-notebook-2"></i>
        </el-tooltip>
      </el-popover>

      <el-tooltip
        class="puzzle-toolsbar__action"
        effect="dark"
        content="放大"
        :enterable="false"
        placement="left"
      >
        <i
          class="el-icon-circle-plus-outline"
          @click="handleZoomOut"
        >
        </i>
      </el-tooltip>

      <el-tooltip
        class="puzzle-toolsbar__action"
        effect="dark"
        content="缩小"
        :enterable="false"
        placement="left"
      >
        <i
          class="el-icon-remove-outline"
          @click="handleZoomIn"
        >
        </i>
      </el-tooltip>

      <el-tooltip
        class="puzzle-toolsbar__action"
        effect="dark"
        content="适应屏幕大小"
        :enterable="false"
        placement="left"
      >
        <i class="el-icon-aim" @click="$emit('initCanvasTransform')"></i>
      </el-tooltip>

      <el-tooltip
        v-mihoyo-auth="{authKey: 'admin'}"
        class="puzzle-toolsbar__action"
        effect="dark"
        content="打开代码模式配置"
        :enterable="false"
        placement="left"
      >
        <i class="el-icon-document" @click="handleOpenCodeMode"></i>
      </el-tooltip>
      <el-tooltip
        class="puzzle-toolsbar__action"
        effect="dark"
        content="多媒体资源管理"
        :enterable="false"
        placement="left"
      >
        <i class="el-icon-folder" @click="handleOpenResource"></i>
      </el-tooltip>
      <el-tooltip
        class="puzzle-toolsbar__action"
        effect="dark"
        content="全屏预览"
        :enterable="false"
        placement="left"
      >
        <i class="el-icon-full-screen" @click="openFullScreen"></i>
      </el-tooltip>
    </div>

    <el-dialog
      v-if="codeModeInited"
      append-to-body
      class="code-mode-dialog"
      title="页面配置"
      top="8vh"
      :visible.sync="codeModeDialogVisible"
    >
      <component
        :is="'codeMode'"
        class="page-config-code-mode"
        lang="json"
        :value="pageConfig"
        @change="onCodeChange"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="codeModeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmChangePageConfig">
          {{ !dirty ? '确定' : '更新' }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog
      append-to-body
      title="多媒体资源管理"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="30px"
      width="1200px"
      :show-close="false"
      :visible="resourceListDialogVisible"
    >
      <ResourceDialog v-if="resourceListDialogVisible" @close="resourceListDialogVisible = false" />
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import eventModel from '@/models/event';
import PcPreviewFullScreen from '@/main/edit/docks/preview/previewTools/pcPreviewFullScreen.vue';
import ResourceDialog from '@/main/edit/docks/mediaList/index.vue';

export default {
  components: {
    codeMode: () => import(/* webpackChunkName: "codeMode" */ '@/components/codeMode'),
    ResourceDialog
  },
  data() {
    return {
      codeModeInited: false,
      codeModeDialogVisible: false,
      resourceListDialogVisible: false,
      codeModeVal: '',
      editList: []
    };
  },

  computed: {
    ...mapState([
      'baseInfo',
      'nodes',
      'platMsg',
      'mi18nAdminUrl',
      'canvasTransformData'
    ]),
    inited() {
      return !!this.baseInfo.id;
    },
    pageConfig() {
      return JSON.stringify({
        baseInfo: this.baseInfo,
        platMsg: this.platMsg,
        nodes: this.nodes,
      }, null, 2);
    },
    dirty() {
      return this.codeModeVal && this.pageConfig !== this.codeModeVal;
    },
    eventId() {
      return this.$route.params.eventId;
    },
    // 模板Id，模板编辑页下不为空
    templateId() {
      return this.$route.params.templateId;
    },
  },

  methods: {
    ...mapMutations(['updateNodes']),
    ...mapActions(['handleZoomIn', 'handleZoomOut']),
    handleEditList() {
      this.getEventVersionList();
    },

    // 撤销
    handleUndo() {
      this.$gemit('undo');
    },

    // 重做
    handleRedo() {
      this.$gemit('redo');
    },
    handleOpenCodeMode() {
      this.codeModeInited = true;
      this.codeModeDialogVisible = true;
    },

    async confirmChangePageConfig() {
      if (!this.dirty) {
        this.codeModeDialogVisible = false;
        return;
      }
      const [err] = await this.$async(this.$confirm('确认更新页面配置?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }));
      if (err) return;
      const newPageConfig = JSON.parse(this.codeModeVal);
      this.$store.commit('updateBaseInfo', newPageConfig.baseInfo);
      this.$store.commit('initPlatMsg', { platMsg: newPageConfig.platMsg });
      this.updateNodes({ newNodes: newPageConfig.nodes });
      this.codeModeDialogVisible = false;
    },
    handleOpenResource() {
      this.resourceListDialogVisible = true;
    },
    onCodeChange(val) {
      this.codeModeVal = val;
    },

    async handleConfirm(row) {
      await this.rollbackEventVersion(row.version);
      window.location.reload();
      // await this.getEventVersionList();
    },

    async rollbackEventVersion(version) {
      try {
        const params = {
          id: this.eventId,
          version
        };
        const { list } = await eventModel.rollbackEventVersion(params);
        this.editList = list;
      } catch (error) {
        console.error(error);
      }
    },
    openFullScreen() {
      const instance = this.$commonModal(PcPreviewFullScreen, {
        transitionType: 'scale',
        hasContainer: false,
        closeCb: () => {
          document.exitFullscreen();
        }
      });
      instance.el.requestFullscreen();
    },
    async getEventVersionList() {
      try {
        const params = {
          id: this.eventId,
          page: 1,
          limit: 30
        };
        const { list } = await eventModel.getEventVersionList(params);
        this.editList = list;
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.puzzle-toolsbar {
  width: 40px;

  &__actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &__action {
    margin: 10px 0;
  }

  i {
    font-size: 24px;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }

    &:active {
      color: #3a8ee6;
      outline: 1px solid #3a8ee6;
    }
  }
}

.code-mode-dialog {
  ::v-deep .el-dialog__body {
    padding: 0 20px;
  }
}

.page-config-code-mode {
  min-height: 600px;
}
</style>
