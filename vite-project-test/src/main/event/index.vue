<template>
  <div class="puzzle-event">
    <div class="puzzle-event__query">
      <el-card>
        <div slot="header" class="clearfix">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>活动管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-form
          label-position="left"
          label-width="80px"
          :model="queryForm"
        >
          <el-row>
            <el-col :span="6">
              <el-form-item label="活动标识">
                <el-input v-model="queryForm.search" placeholder="请输入活动名或活动标识" @keyup.enter.native="onSearchSubmit"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" @click="onSearchSubmit">
                  查询
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <div class="puzzle-event__list">
      <el-card>
        <div slot="header" class="flex-right">
          <el-button v-mihoyo-auth="{authKey: 'puzzle'}" type="primary" @click="handleAdd">
            新建活动
          </el-button>
        </div>
        <el-table
          :data="eventList"
          border
          style="width: 100%;"
          @expand-change="handleExpand"
        >
          <el-table-column type="expand">
            <template slot-scope="scope">
              <div class="expand-container">
                <el-card class="box-card">
                  <div slot="header" class="clearfix">
                    <div class="expand-list">
                      <div class="expand-list__item">
                        创建人：
                        <span>{{ scope.row.creator }}</span>
                      </div>
                      <div class="expand-list__item">
                        创建时间：
                        <span>{{ scope.row.ctime }}</span>
                      </div>
                    </div>
                  </div>
                  <el-table
                    v-if="scope.row.publishList"
                    :data="scope.row.publishList"
                    border
                    style="width: 80%;"
                    max-height="250"
                  >
                    <el-table-column
                      prop="env"
                      label="发布环境"
                    >
                      <template slot-scope="scope2">
                        <el-tag :disable-transitions="true" :type="scope2.row.env | releaseStatus">
                          {{ scope2.row.env | releaseLabel }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="发布状态"
                    >
                      <template slot-scope="scope2">
                        <el-tag :disable-transitions="true" :type="scope2.row.status | publishStatus">
                          {{ scope2.row.status | publishLabel }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="version"
                      label="配置版本"
                    >
                    </el-table-column>
                    <el-table-column
                      prop="mtime"
                      label="发布时间"
                    >
                    </el-table-column>
                    <el-table-column
                      prop="opt_user"
                      label="操作人"
                    >
                    </el-table-column>
                    <el-table-column
                      label="发布操作"
                      width="240"
                    >
                      <template slot-scope="scope2">
                        <el-button
                          v-if="scope2.row.env === 'ReleaseEnvProd' && scope2.row.status === 'PublishStatusOK'"
                          v-mihoyo-auth="{authKey: 'release'}"
                          type="text"
                          size="small"
                          @click="rollbackEventPublish(scope2.row)"
                        >
                          <i class="el-icon-refresh-left"></i>回滚文件
                        </el-button>

                        <el-button
                          v-if="scope2.row.status !== 'PublishStatusOK' && scope2.row.status !== 'PublishStatusFail'"
                          type="text"
                          size="small"
                          @click="handleRefreshStatus(scope2.row)"
                        >
                          <i class="el-icon-edit"></i>刷新结果
                        </el-button>

                        <el-button
                          v-if="scope2.row.status === 'PublishStatusFail'"
                          type="text"
                          size="small"
                          @click="handleErrorLog(scope2.row)"
                        >
                          <i class="el-icon-info"></i>失败原因
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="id"
            label="活动id"
            width="80"
          >
          </el-table-column>
          <el-table-column
            prop="event_key"
            label="活动标识"
            min-width="150"
          >
          </el-table-column>
          <el-table-column
            prop="event_name"
            label="活动名称"
            min-width="200"
          >
          </el-table-column>

          <el-table-column
            label="活动业务"
            width="120"
          >
            <template slot-scope="{ row }">
              <el-tag
                v-for="biz in row.biz_list" :key="biz" :disable-transitions="true"
                style="margin-bottom: 2px;"
              >
                {{ bizMap[biz] }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="多语言"
            width="100"
          >
            <template slot-scope="{ row }">
              <el-tag :disable-transitions="true" :type="row.is_mi18n ? 'success' : 'info'">
                {{ row.is_mi18n ? '支持' : '不支持' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="发布环境"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag :disable-transitions="true" :type="scope.row.release_status | releaseStatus">
                {{ scope.row.release_status | releaseLabel }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="状态"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag :disable-transitions="true" :type="scope.row.update_status | updateStatus">
                {{ scope.row.update_status | updateLabel }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="creator"
            label="创建人"
            min-width="100"
          >
          </el-table-column>
          <el-table-column
            prop="ctime"
            label="创建时间"
            width="160"
          >
          </el-table-column>
          <el-table-column
            prop="mtime"
            label="最后修改时间"
            width="160"
          >
          </el-table-column>

          <el-table-column
            label="操作"
            width="300"
          >
            <template slot-scope="scope">
              <div class="table-actions">
                <el-button
                  v-mihoyo-auth="{authKey: 'puzzle'}" type="text"
                  size="small" @click="handleEdit(scope.row)"
                >
                  <i class="el-icon-edit"></i>配置页面
                </el-button>
                <el-button
                  v-mihoyo-auth="{authKey: 'puzzle'}" type="text"
                  size="small" @click="handleUpdate(scope.row)"
                >
                  <i class="el-icon-edit"></i>编辑信息
                </el-button>
                <el-dropdown
                  @command="handleCommand"
                >
                  <span class="el-dropdown-link">
                    <i class="el-icon-upload"></i>发布
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-mihoyo-auth="{authKey: 'puzzle'}"
                      :command="{row: scope.row, env: 1}"
                    >
                      发布测试
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-mihoyo-auth="{authKey: 'puzzle'}"
                      :command="{row: scope.row, env: 2}"
                    >
                      发布预发布
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-mihoyo-auth="{authKey: 'release'}"
                      :command="{row: scope.row, env: 3}"
                    >
                      发布正式
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button
                  type="text"
                  size="small"
                  @click="handleView(scope.row)"
                >
                  <i class="el-icon-notebook-2"></i>查看
                </el-button>
                <!-- <el-button
                  type="text"
                  size="small"
                  @click="copyEvent(scope.row)"
                >
                  复制活动
                </el-button> -->
                <el-button
                  v-mihoyo-auth="{authKey: 'puzzle'}"
                  class="btn-danger"
                  type="text"
                  size="small"
                  @click="handleDeleteEvent(scope.row)"
                >
                  <i class="el-icon-delete"></i>删除
                </el-button>
                <el-button
                  v-if="scope.row.release_status === 'ReleaseEnvProd'"
                  v-mihoyo-auth="{authKey: 'release'}"
                  class="btn-danger"
                  type="text"
                  size="small"
                  @click="handleOffline(scope.row)"
                >
                  <i class="el-icon-download"></i>下线
                </el-button>
                <el-dropdown placement="bottom" trigger="click" @command="handlerPublishRes($event,scope.row)">
                  <span class="el-dropdown-link">
                    手动重发资源<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="ReleaseEnvPre">
                      预发
                    </el-dropdown-item>
                    <el-dropdown-item command="ReleaseEnvProd">
                      生产
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="total > limit"
          background
          :current-page="page"
          layout="prev, pager, next"
          :total="total"
          @current-change="onPageChange"
        >
        </el-pagination>
      </el-card>
    </div>

    <el-dialog
      :title="isDialogUpdateEvent ? '更新活动' : '新建活动'"
      top="12vh"
      :visible.sync="dialogFormVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="clearEventFormValidate"
    >
      <el-form
        ref="eventForm"
        :model="eventForm"
        :rules="eventFormRules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="event_name">
          <el-input v-model="eventForm.event_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="活动标识" prop="event_key">
          <el-input v-model="eventForm.event_key" :disabled="isDialogUpdateEvent" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="pc页模式" prop="event_mode">
          <el-radio-group
            v-model="eventForm.pc_page_mode" :disabled="isDialogUpdateEvent || !!tempInfo"
            size="small"
          >
            <el-radio-button
              v-for="(item, key) in pageModeMap.filter(item=>item.pcInitState)"
              :key="key"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="移动页模式" prop="event_mode">
          <el-radio-group
            v-model="eventForm.mobile_page_mode" :disabled="isDialogUpdateEvent || !!tempInfo"
            size="small"
          >
            <el-radio-button
              v-for="(item, key) in pageModeMap.filter(item=>item.h5InitState)"
              :key="key"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="多语言">
          <el-switch
            v-model="is_mi18n"
            :disabled="isDialogUpdateEvent"
            active-text="需要"
            inactive-text="不需要"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="活动时间" prop="eventTimeRange">
          <el-date-picker
            v-model="eventForm.eventTimeRange"
            :default-time="['00:00:00', '23:59:59']"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item v-if="!isDialogUpdateEvent" label="页面模板">
          <el-button v-if="!tempInfo" type="text" @click="tempModalVisible = true">
            选择模板
          </el-button>
          <div v-else class="puzzle-event__temp">
            <div class="puzzle-event__mask">
              <el-button type="primary" size="small" @click="tempModalVisible = true">
                更换模板
              </el-button>
              <el-button type="warning" size="small" @click="clearTemplate">
                清除模板
              </el-button>
            </div>
            <template-card
              :extra-style="{marginLeft: 0, marginBottom: 0}"
              :item="tempInfo"
              size="small"
            />
          </div>
        </el-form-item>

        <el-form-item prop="biz_list">
          <el-tooltip slot="label" content="可关联同一游戏下的多个区服" placement="top">
            <span>关联业务 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-cascader
            ref="cascader"
            v-model="biz_list"
            :disabled="isDialogUpdateEvent"
            :options="curGameCascaderList"
            :props="{
              multiple: true,
              expandTrigger: 'hover',
              emitPath: false,
            }"
            size="medium"
            :show-all-levels="false"
            filterable
            clearable
            placeholder="请选择要关联的业务"
          ></el-cascader>
        </el-form-item>
        <template v-if="eventForm.lang_config">
          <el-row>
            区服对应语言列表
          </el-row>
          <el-form-item
            v-for="(item,index) in eventForm.lang_config" :key="item.game_biz" :prop="`lang_config.${index}.lang.0`"
            :label="item.game_biz"
            :rules="{
              required: true, message: '语言不能为空', trigger: 'blur'
            }"
          >
            <el-select
              :value="item.lang"
              multiple
              filterable
              allow-create
              clearable
              default-first-option
              placeholder="请选择所需的语言"
              @change="(langList)=>{langListChange(langList,index)}"
            >
              <el-option
                v-for="lang in allLangList"
                :key="lang.value"
                :label="lang.value"
                :value="lang.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item
          v-if="!eventForm.is_mi18n"
          prop="lang" :rules="{
            required: true, message: '语言不能为空', trigger: 'blur'
          }" label="页面语言"
        >
          <el-select
            v-model="eventForm.lang" filterable
            placeholder="请选择页面语言类型"
          >
            <el-option
              v-for="(item) in allLangList"
              :key="item.value"
              :label="item.value"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="授权用户">
          <mihoyo-staff-selector
            v-model="eventForm.user_list"
            :placeholder="'搜索域账号'"
            :multiple="true"
          >
          </mihoyo-staff-selector>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="isSubmitting" @click="handleSubmit">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="失败原因"
      :visible.sync="errorLogVisible"
      width="500px"
    >
      <span style="white-space: pre-wrap;">
        {{ errorLog }}
      </span>
    </el-dialog>

    <template-dialog
      :show="tempModalVisible"
      :cur-item="tempInfo"
      @close="tempModalVisible = false"
      @select="setTempInfo"
    />

    <el-dialog
      :visible.sync="copyModalShow"
      title="复制活动"
      :close-on-click-modal="false"
      width="600px"
    >
      <el-form
        ref="copyForm"
        :model="copyForm"
        :rules="eventFormRules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="event_name">
          <el-input v-model="copyForm.event_name" />
        </el-form-item>

        <el-form-item label="活动标识" prop="event_key">
          <el-input v-model="copyForm.event_key" />
        </el-form-item>

        <el-form-item label="活动时间" prop="eventTimeRange">
          <el-date-picker
            v-model="copyForm.eventTimeRange"
            :default-time="['00:00:00', '23:59:59']"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="copyModalShow = false">
          取 消
        </el-button>
        <el-button type="primary" :loading="isCopying" @click="handleCopySubmit">
          提 交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import groupBy from 'lodash/groupBy';
import { DEFAULT_LANG_MAP } from '@/constants/gameBizConfig';
import constants from '@/constants';
import * as utils from '@/utils';
import openDialog from '@/utils/openDialog';
import eventModel from '@/models/event';
import tplModel from '@/models/template';
import urlDialog from '@/components/urlDialog';
import templateDialog from './templateDialog';

const createInitEventData = () => ({
  id: 0,
  event_name: '',
  event_key: utils.newEventId(),
  mobile_page_mode: 1,
  pc_page_mode: 1,
  is_mi18n: false,
  eventTimeRange: '',
  event_type: 'EventTypeRelease', // 1开发活动，2正式活动
  user_list: [],
  biz_list: [],
  lang_config: undefined,
  lang: undefined,
});

export default {

  components: {
    templateDialog
  },
  data() {
    return {
      errorLogVisible: false,

      errorLog: '',

      queryForm: {
        search: '',
        type: '',
      },

      eventForm: createInitEventData(),
      isSubmitting: false,
      dialogFormVisible: false,
      isDialogUpdateEvent: false,
      eventList: [],
      total: 0,
      page: 1,
      limit: 10,
      eventFormRules: {
        event_name: [
          { required: true, message: '请填写活动名称', trigger: 'blur' }
        ],
        event_key: [
          { required: true, message: '请填写活动标识', trigger: 'blur' },
          {
            min: 3,
            max: 50,
            message: '英文标识长度在 3 到 50 个字符',
            trigger: 'blur'
          },
          {
            validator(rule, value, callback) {
              const errors = [];
              if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
                errors.push(new Error('活动标识只能由字母、数字和下划线组成，且以字母开头'));
              }
              callback(errors);
            },
            trigger: 'blur'
          }
        ],
        eventTimeRange: [
          { required: true, message: '请填写活动时间', trigger: 'blur' }
        ],
        biz_list: [
          { required: true, message: '请选择关联业务', trigger: 'blur' }
        ],
      },
      defaultLangMap: {},
      eventTypeMap: constants.eventTypeMap,
      pageModeMap: constants.pageModeMap,
      allLangList: constants.langList,
      // 页面模板相关
      tempModalVisible: false,
      tempInfo: null,

      // 复制活动相关
      copyModalShow: false,
      copyForm: {
        event_name: '',
        event_key: '',
        eventTimeRange: '',
        event_id: 0
      },
      isCopying: false,
    };
  },

  computed: {
    ...mapState([
      'bizList',
    ]),
    ...mapGetters([
      'bizMap'
    ]),
    bizCascaderList() {
      return Object.values(groupBy(this.bizList, 'game')).map(gameBizs => ({
        value: gameBizs[0].game,
        label: gameBizs[0].game_name,
        children: gameBizs.map(item => ({
          value: item.biz_type,
          label: item.biz_type,
        }))
      }));
    },
    curGameCascaderList() {
      const firstBiz = this.eventForm?.biz_list?.[0];
      if (!firstBiz) {
        return this.bizCascaderList;
      }
      const firstBizGame = firstBiz.split('_').shift();
      return this.bizCascaderList.filter(item => firstBizGame === item.value);
    },
    pageUrls() {
      return this.getPageUrls(this.currentItem);
    },
    biz_list: {
      get() {
        return this.eventForm.biz_list;
      },
      set(newVal) {
        this.eventForm.biz_list = newVal;
        this.setLangConfig();
      }
    },
    is_mi18n: {
      get() {
        return this.eventForm.is_mi18n;
      },
      set(newVal) {
        this.eventForm.is_mi18n = newVal;
        if (newVal) {
          this.eventForm.lang = undefined;
        }
        this.setLangConfig();
      }
    },
    curGame() {
      const gameBiz = this.eventForm?.biz_list?.[0];
      if (!gameBiz) return undefined;
      return gameBiz.split('_').shift();
    }
  },

  watch: {
    page(newV, oldV) {
      console.log('page change: ', newV, oldV);
      this.getEventList();
    }
  },

  created() {
    this.getEventList();
  },

  methods: {
    ...mapActions([
      'checkMi18nStatus',
    ]),
    async setLangConfig() {
      if (!this.is_mi18n || !this.curGame) {
        this.eventForm.lang_config = undefined;
        return;
      }
      const setLangConfig = () => {
        const langConfig = this.eventForm.biz_list.map(gameBiz => ({
          game_biz: gameBiz,
          lang: DEFAULT_LANG_MAP[gameBiz] || this.defaultLangMap[this.curGame][gameBiz] || []
        }));
        this.$set(this.eventForm, 'lang_config', langConfig);
      };
      if (this.defaultLangMap[this.curGame]) {
        setLangConfig();
        return;
      }
      try {
        this.defaultLangMap[this.curGame] = await eventModel.getDefaultMi18nLangMapByGame({ game: this.curGame });
        setLangConfig();
      } catch (e) {
        this.$message.success('业务默认对应语言列表拿取失败');
      }
    },
    langListChange(langList, index) {
      this.$set(this.eventForm.lang_config[index], 'lang', langList);
    },
    getPageUrls(event = {}) {
      return utils.getPageUrls(event);
    },

    onSearchSubmit() {
      this.page = 1;
      this.getEventList();
    },

    async rollbackEventPublish(publishData) {
      const [err] = await this.$async(this.$confirm(
        `确定回滚文件到该发布（配置版本：${publishData.version}）吗?`,
        '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ));
      if (err) return;
      const [modelErr] = await this.$async(eventModel.rollbackEventPublish({
        id: publishData.event_id,
        version: publishData.version,
      }));
      if (modelErr) return;
      this.$message.success('回滚成功');
    },

    handleRefreshStatus(row) {
      this.getEventPublishInfo(row.id)
        .then(res => {
          row.status = res.status;
        });
    },

    async handleErrorLog({ id }) {
      try {
        const { package_info } = await this.getEventPublishInfo(id);
        this.errorLog = package_info;
        this.errorLogVisible = true;
      } catch (error) {
        console.log(error);
      }
    },

    handleExpand(row, expandRow) {
      console.log(row, expandRow, 'www');
      const { id } = row;
      if (expandRow.find(x => x.id === id)) {
        console.log('展开', row);
        this.getEventPublishList(id)
          .then(res => {
            row.publishList = res.list;
          });
      }
    },

    handleCopy() {
      this.$message.success('复制成功');
    },

    async handleCommand({ row, env }) {
      const params = { id: row.id, env };
      try {
        await this.checkMi18nStatus({
          env,
          is_mi18n: row.is_mi18n,
          eventId: row.id,
        });
        await this.publishEvent(params);
        const { list } = await this.getEventPublishList(row.id);
        row.publishList = list;
      } catch (error) {
        console.log(error);
      }
    },

    handleView(item) {
      console.log('查看：', item);
      this.$async(openDialog(urlDialog, {
        props: {
          event: item,
          hasOpenButton: true,
        },
      }));
    },

    clearEventFormValidate() {
      this.$refs.eventForm.clearValidate();
    },
    handleUpdate(item) {
      console.log('handleUpdate: ', item);
      this.eventForm = item;
      if (this.$refs.cascader?.$refs?.panel?.activePath?.length > 0) {
        this.$refs.cascader.$refs.panel.activePath = []; // cascader bug hack
      }
      this.isDialogUpdateEvent = true;
      this.dialogFormVisible = true;
    },

    handleEdit(item) {
      window.open(this.$router.resolve({ name: 'eventEdit', params: { eventId: item.id } }).href);
    },

    handleAdd() {
      if (this.eventForm.id) {
        this.eventForm = createInitEventData();
      }
      this.isDialogUpdateEvent = false;
      this.dialogFormVisible = true;
    },

    handleSubmit() {
      if (this.isSubmitting) return;
      this.$refs.eventForm.validate(async (valid) => {
        if (!valid) {
          return;
        }
        try {
          this.isSubmitting = true;
          if (this.isDialogUpdateEvent) {
            await this.updateEvent();
          } else {
            const res = await this.addEvent();
            this.$message.success('新建成功');
            setTimeout(() => {
              this.handleEdit(res);
            }, 1500);
          }
          this.isSubmitting = false;
          this.dialogFormVisible = false;
          this.getEventList();
        } catch (err) {
          console.warn(err);
          this.isSubmitting = false;
        }
      });
    },
    // 重新发布资源
    async handlerPublishRes(command, data) {
      try {
        await this.$confirm('确定发布资源？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
      } catch (e) {
        return;
      }

      const { id } = data;
      try {
        await eventModel.publishEventResource({ id, env: command });
        this.$message({
          message: '操作成功',
          type: 'success'
        });
      } catch (error) {
        console.log(error);
      }
    },
    async getEventPublishInfo(id) {
      try {
        const res = await eventModel.getEventPublishInfo({ id });
        return res;
      } catch (error) {
        console.log(error);
      }
    },

    async publishEvent(params = {}) {
      await eventModel.publishEvent(params);
    },

    async getEventPublishList(id) {
      try {
        const params = {
          id,
          page: 1,
          limit: 30
        };
        const res = await eventModel.getEventPublishList(params);
        console.log(res);
        return res;
      } catch (error) {
        console.log(error);
      }
    },

    async addEvent() {
      const params = { ...this.eventForm };
      delete params.id;
      if (this.tempInfo) {
        const resp = await tplModel.getTemplateInfo({ id: this.tempInfo.id });
        params.config_str = resp.config_str;
      }
      const res = await eventModel.addEvent(params);
      return res;
    },

    async updateEvent() {
      await eventModel.updateEvent(this.eventForm);
    },

    onPageChange(newPage) {
      this.page = newPage;
    },

    async getEventList() {
      try {
        const params = {
          // loading: false,
          page: this.page,
          limit: this.limit,
          search: this.queryForm.search,
          type: this.queryForm.type,
        };
        const res = await eventModel.getEventList(params);
        this.eventList = res.list.map(x => {
          const item = {
            ...x,
            publishList: [],
          };
          return item;
        });
        this.total = res.count;
      } catch (error) {
        console.log(error);
      }
    },

    setTempInfo(tempInfo) {
      this.tempInfo = tempInfo;
      this.eventForm.pc_page_mode = this.tempInfo.pc_page_mode || constants.pageMode.scrollPage;
      this.eventForm.mobile_page_mode = this.tempInfo.mobile_page_mode || constants.pageMode.scrollPage;
    },

    clearTemplate() {
      this.tempInfo = null;
    },

    // 复制活动
    copyEvent(item) {
      const {
        eventTimeRange,
        event_name,
        event_key,
        id
      } = item;

      this.copyForm = {
        eventTimeRange,
        event_name: `${event_name}_副本`,
        event_key: `${event_key}_copy`,
        event_id: id
      };

      this.copyModalShow = true;
    },

    async handleCopySubmit() {
      if (this.isCopying) return;
      this.$refs.copyForm.validate(async (valid) => {
        if (valid) {
          this.isCopying = true;
          try {
            await this.postCopyEvent();
            this.isCopying = false;
            this.copyModalShow = false;
            this.getEventList();
          } catch (err) {
            this.isCopying = false;
          }
        } else {
          console.log('error submit!!');
        }
      });
    },

    async postCopyEvent() {
      return eventModel.copyEvent(this.copyForm);
    },

    async handleDeleteEvent(event) {
      console.log('handleDeleteEvent', event);
      if (event.release_status === 'ReleaseEnvProd') {
        return this.$message({
          message: '不能删除已上线的活动',
          type: 'warning'
        });
      }
      const [err] = await this.$async(this.$confirm(`确定删除活动 “${event.event_name}” 吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }));
      if (err) return;
      const [modelErr] = await this.$async(eventModel.deleteEvent({ id: event.id }));
      if (modelErr) return;
      this.getEventList();
    },
    async handleOffline(event) {
      console.log('handleOffline', event);
      const [err] = await this.$async(this.$confirm(`确定下线活动 “${event.event_name}” 吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }));
      if (err) return;
      const [modelErr] = await this.$async(eventModel.offlineEvent({ id: event.id }));
      if (modelErr) return;
      this.getEventList();
    },
  }
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
