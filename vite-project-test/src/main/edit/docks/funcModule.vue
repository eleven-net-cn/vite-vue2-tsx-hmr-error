<template>
  <div class="puzzle-func-module">
    <div class="puzzle-base">
      <el-button
        type="primary" size="mini" icon="el-icon-plus"
        @click="createModule"
      >
        添加功能模块
      </el-button>

      <div class="puzzle-func-module__content">
        <el-collapse v-model="activeNames" accordion>
          <el-collapse-item
            v-for="item in funcModules"
            :key="item.id"
            :disabled="isPageCompType"
          >
            <template slot="title">
              <div class="puzzle-func-module-actions">
                <el-tooltip effect="dark" :content="item.func_name" placement="top-start">
                  <el-tag :disable-transitions="true">
                    {{ item.func_name }}{{ item.func_name }}{{ item.func_name }}
                  </el-tag>
                </el-tooltip>
                <el-dropdown trigger="click" :hide-on-click="false">
                  <el-button
                    size="mini"
                    type="text"
                    @click.stop
                  >
                    模块配置<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="app in item.space_list[0].modules" :key="app.act_id"
                    >
                      <el-dropdown v-if="app.biz_module_info.filter(item => item.menu.config.url).length" trigger="click">
                        <el-button
                          size="mini"
                          type="primary"
                          @click.stop
                        >
                          {{ app.module_info.module_name }}<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item
                            v-for="biz in app.biz_module_info.filter(item => item.menu.config.url)" :key="biz.game_biz"
                            @click.stop.native="handleEditModule(biz)"
                          >
                            {{ bizMap[biz.game_biz] }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>

                <el-button
                  type="text" size="mini"
                  @click.stop="handleConst(item)"
                >
                  参数配置
                </el-button>
                <el-button
                  type="text" size="mini"
                  @click.stop="handleDelete(item)"
                >
                  删除
                </el-button>
              </div>
            </template>
            <div
              class="puzzle-tools-group"
            >
              <div
                v-for="comp in item.feComps"
                :key="comp.name"
                draggable="true"
                drag-type="comp"
                :comp-name="comp.name"
                :be-data="JSON.stringify(comp.beData)"
                class="puzzle-comp"
                :class="{'puzzle-comp--disable': comp.pageType === 'PageTypePage' && isPageCompType}"
              >
                <i :class="comp.icon"></i>
                {{ comp.label }}
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <el-dialog
      append-to-body
      width="800px" title="功能模块列表" :visible.sync="dialogAvailableVisible"
      class="available-dialog"
    >
      <el-form :inline="true" size="mini" :model="availableSearchForm">
        <el-form-item label="关键词">
          <el-input v-model="availableSearchForm.keyword" clearable placeholder="输入关键词"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-checkbox v-model="availableSearchForm.is_dev">
            开发模式
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAvailableList">
            查询
          </el-button>
        </el-form-item>
      </el-form>
      <el-table :data="availableList">
        <el-table-column property="id" label="id"></el-table-column>
        <el-table-column property="func_name" label="名称"></el-table-column>
        <el-table-column property="version" label="版本"></el-table-column>
        <el-table-column property="creator" label="创建人"></el-table-column>
        <el-table-column width="160" property="mtime" label="修改时间"></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleAddAvailable(scope.row)">
              添加
            </el-button>
            <!-- <el-button @click="handleDeleteConst(scope.row)" type="text" size="small">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="availableSearchForm.total > availableSearchForm.page_size "
        :current-page.sync="availableSearchForm.page"
        :page-size.sync="availableSearchForm.page_size"
        :total="availableSearchForm.total"
        layout="total, pager, prev, next"
        @current-change="handleAvailableChange"
      />
    </el-dialog>

    <el-dialog
      append-to-body
      width="600px" title="参数列表" :visible.sync="dialogConstVisible"
      class="const-dialog"
    >
      <div class="constdialog-actions">
        <el-button
          size="small"
          type="primary" @click="handleNewConst"
        >
          添 加
        </el-button>
      </div>
      <el-table :data="constList">
        <el-table-column property="name" label="名称"></el-table-column>
        <el-table-column property="key" label="key"></el-table-column>
        <el-table-column property="value_type" label="类型">
          <template slot-scope="{ row }">
            {{ options.find(x => x.value === row.value_type).label }}
          </template>
        </el-table-column>
        <el-table-column property="value" label="值"></el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEditConst(scope.row)">
              编辑
            </el-button>
            <!-- <el-button @click="handleDeleteConst(scope.row)" type="text" size="small">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog
      width="600px" :title="isEditConst ? '参数编辑' : '新增参数'"
      append-to-body
      :visible.sync="dialogConstFormVisible"
    >
      <el-form ref="constForm" :model="constForm" :rules="constRules">
        <el-form-item label="名称" label-width="60px" prop="name">
          <el-input v-model="constForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="key" label-width="60px" prop="key">
          <el-input v-model="constForm.key" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型" label-width="60px" prop="value_type">
          <el-select v-model="constForm.value_type" :disabled="isEditConst" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="值" label-width="60px" prop="value">
          <el-input v-model="constForm.value" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogConstFormVisible = false">
          取 消
        </el-button>
        <el-button size="mini" type="primary" @click="handleSubmitConst">
          提 交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  mapState,
  // mapMutations,
  mapGetters,
  mapActions
} from 'vuex';
import * as utils from '@/utils';
import merlinModel from '@/models/merlin';
import ConfigModule from '@/components/configModule';

export default {
  data() {
    return {
      activeNames: '',
      constList: [],
      currentItem: {},
      currentConst: {},
      constForm: {
        value_type: 'ValueInt',
        key: '',
        name: '',
        value: ''
      },
      options: [{
        value: 'ValueInt',
        label: '数字'
      }, {
        value: 'ValueString',
        label: '字符串'
      }],
      constRules: {
        value_type: [{ required: true, message: '请选择类型' }],
        name: [{ required: true, message: '请输入名称' }],
        key: [{ required: true, message: '请输入key' }],
        value: [{ required: true, message: '请输入值' }],
      },
      isEditConst: false,
      dialogConstVisible: false,
      dialogConstFormVisible: false,
      dialogAvailableVisible: false,
      availableList: [],
      availableSearchForm: {
        page: 1,
        total: 0,
        page_size: 10,
        is_dev: false,
        keyword: ''
      }
    };
  },

  watch: {
    'availableSearchForm.is_dev': function () {
      this.handleAvailableList();
    }
  },

  computed: {
    ...mapState([
      'funcModules',
    ]),
    ...mapGetters([
      'bizMap',
      'pageCompNode',
      'isPageCompType'
    ]),

    puzzleId() {
      return this.$route.params.eventId;
    }
  },

  methods: {
    ...mapActions(['getEventFuncModuleList']),

    handleEditModule(biz) {
      utils.openDialog(ConfigModule, {
        props: {
          url: biz.menu.config.url,
          bizName: this.bizMap[biz.game_biz]
        }
      });
    },

    handleNewConst() {
      this.isEditConst = false;
      this.constForm = {
        value_type: 'ValueInt',
        key: '',
        name: '',
        value: ''
      };
      this.dialogConstFormVisible = true;
    },

    handleEditConst(item) {
      this.isEditConst = true;
      this.currentConst = item;
      this.constForm = {
        value_type: item.value_type,
        key: item.key,
        name: item.name,
        value: item.value,
      };
      this.dialogConstFormVisible = true;
    },

    async handleSubmitConst() {
      await this.$refs.constForm.validate();
      if (this.isEditConst) {
        await merlinModel.editConst({
          id: this.currentConst.id,
          ...this.constForm
        });
      } else {
        await merlinModel.createConst({
          space_id: this.currentItem.space_id,
          event_id: this.currentItem.event_id,
          ...this.constForm
        });
      }

      this.getConstList();
      this.dialogConstFormVisible = false;
    },

    handleConst(item) {
      this.currentItem = item;
      this.dialogConstVisible = true;
      this.getConstList();
    },

    async getConstList() {
      ({ list: this.constList } = await merlinModel.constList({
        space_id: this.currentItem.space_id,
        event_id: this.currentItem.event_id
      }));
    },

    createModule() {
      this.dialogAvailableVisible = true;
      this.getAvailableEventFuncModuleList();
    },

    handleAvailableChange(v) {
      this.availableSearchForm.page = v;
      this.getAvailableEventFuncModuleList();
    },

    handleAddAvailable(item) {
      this.$confirm('确认添加功能模块？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const params = {
          func_id: item.id,
          is_dev: this.availableSearchForm.is_dev ? 1 : undefined,
          puzzle_id: this.puzzleId
        };
        await merlinModel.importFuncModule(params);
        this.dialogAvailableVisible = false;
        this.getEventFuncModuleList({ eventId: this.puzzleId });
        this.$message({
          type: 'success',
          message: '添加成功!'
        });
      }).catch(() => {});
    },

    handleAvailableList() {
      this.availableSearchForm.page = 1;
      this.getAvailableEventFuncModuleList();
    },

    async getAvailableEventFuncModuleList() {
      ({ list: this.availableList } = await merlinModel.getAvailableEventFuncModuleList({
        ...this.availableSearchForm,
        is_dev: this.availableSearchForm.is_dev ? 1 : undefined,
        puzzle_id: this.puzzleId
      }));
    },

    async handleDelete(item) {
      this.$confirm(`确认删除「${item.func_name}」?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const params = {
          id: item.id
        };
        await merlinModel.deleteEventFuncModule(params);
        this.$message.success('操作成功');
        this.getEventFuncModuleList({ eventId: this.puzzleId });
      }).catch(() => {});
    },
  }
};
</script>

<style lang="scss">
.puzzle-func-module {
  .puzzle-base {
    margin-bottom: 15px;
  }

  &__content {
    padding: 15px 0;
  }

  &-actions {
    display: flex;
    align-items: center;

    .el-tag {
      max-width: 90px;
      margin-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis; //文本溢出显示省略号
      white-space: nowrap;
    }
  }

  .puzzle-tools-group {
    .puzzle-comp {
      width: 60px !important;

      &--disable {
        pointer-events: none;
        cursor: not-allowed !important;
        color: #aaa;
      }
    }
  }
}
</style>
