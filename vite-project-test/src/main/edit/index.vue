<template>
  <div class="puzzle-edit">
    <div class="puzzle-edit__header">
      <div class="left-nav">
        <div class="page-title">
          项目名：
          <el-tag :disable-transitions="true" effect="dark" size="medium">
            {{ templateName || event.event_name }}
          </el-tag>
        </div>
      </div>
      <div class="ft-actions">
        <div class="keyboard" @click="dialogShortCutVisible = true">
        </div>
        <el-cascader
          v-if="compareVersion('gt','2.7.21')&&event.mi18n_key&&event.is_mi18n"
          v-model="mi18nMsg"
          :options="bizSelectOptions"
          size="mini"
          clearable
          placeholder="请选择预览语言"
          :props="{ expandTrigger: 'hover' }"
        ></el-cascader>
        <el-dropdown v-mihoyo-auth="{authKey: 'module'}" @command="handleDevCommand">
          <el-button size="small" type="primary">
            开发者选项<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="handleOpenCodeMode">
              自定义页面配置
            </el-dropdown-item>
            <el-dropdown-item command="copy">
              复制页面配置
            </el-dropdown-item>
            <el-dropdown-item command="updatePage">
              一键升级页面
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-if="!inMerlin"
          size="small"
          type="primary"
          @click="saveAsTemplate"
        >
          {{ isEditingTpl ? '更新模板' : '保存为模板' }}
        </el-button>

        <el-button
          v-if="!isEditingTpl"
          size="small"
          type="primary"
          @click="updateEventConfig"
        >
          保存
        </el-button>

        <el-button
          v-if="event.is_mi18n"
          size="small"
          type="primary"
          @click="handleUpdateMi18n"
        >
          更新多语言字段
        </el-button>
        <el-button
          v-if="event.is_mi18n"
          size="small"
          type="primary"
          @click="showDownloadMi18n = true"
        >
          批量导出多语言多媒体资源
        </el-button>
        <el-dialog
          v-if="event.is_mi18n"
          append-to-body
          title="多语言内容导出"
          top="8vh"
          :visible.sync="showDownloadMi18n"
        >
          <el-button type="primary" size="small" @click="downloadMi18n('image')">
            导出图片
          </el-button>
          <el-button type="primary" size="small" @click="downloadMi18n('video')">
            导出视频
          </el-button>
          <el-button type="primary" size="small" @click="downloadMi18n('audio')">
            导出音频
          </el-button>
          <el-button type="primary" size="small" @click="downloadMi18n('')">
            全部导出
          </el-button>
        </el-dialog>
        <el-dropdown v-if="!isEditingTpl && !inMerlin" @command="handleCommand">
          <el-button type="primary" size="small" :loading="publishing">
            <span v-if="!publishing">
              发布<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <span v-else>发布中</span>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="{env: 1}">
              发布测试
            </el-dropdown-item>
            <el-dropdown-item :command="{env: 2}">
              发布预发布
            </el-dropdown-item>
            <el-dropdown-item :command="{env: 3}">
              发布正式
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button
          v-if="!isEditingTpl" type="primary" size="small"
          @click="handleViewPage"
        >
          查看页面
        </el-button>
      </div>
    </div>

    <div class="puzzle-edit__container row-1">
      <div v-if="!isPageCompType||(isPageCompType&&inMerlin)" class="pane-lf-container">
        <el-tabs
          v-model="activeTab" type="border-card"
          class="pane-lf"
        >
          <template v-if="!isPageCompType">
            <el-tab-pane
              v-if="!lang" key="component" name="component"
              label="功能库"
            >
              <compLibrary />
            </el-tab-pane>
            <el-tab-pane key="node" name="node" label="页面节点">
              <el-collapse v-model="treeActiveName" accordion>
                <el-collapse-item title="页面节点" name="nodes">
                  <nodeTree :all-nodes="nodes" :search-nodes-list="dfsNodes" />
                </el-collapse-item>
                <el-collapse-item title="弹窗列表" name="dialog">
                  <el-checkbox v-model="showAllDialog">
                    显示所有弹窗
                  </el-checkbox>
                  <nodeTree category="dialog" :all-nodes="dialogNodes" :search-nodes-list="dfsDialogNodes" />
                </el-collapse-item>
              <!-- <el-collapse-item v-if="pageCompNodes.length" title="页面模版" name="pageComp">
                <el-tag>{{ pageCompNodes[0].alias }}</el-tag>
                <el-tabs class="puzzle-edit__pagecomp-tabs" tab-position="left">
                  <el-tab-pane label="loading页">
                  </el-tab-pane>
                  <el-tab-pane label="召回页">
                  </el-tab-pane>
                  <el-tab-pane label="回归页">
                  </el-tab-pane>
                </el-tabs>
              </el-collapse-item> -->
              </el-collapse>
            </el-tab-pane>
          </template>
          <el-tab-pane v-else-if="inMerlin" label="后端模块" name="be">
            <FuncModule />
          </el-tab-pane>
        </el-tabs>
        <div v-show="modeType === 'preview'&&!isPageCompType" class="pane-mask"></div>
      </div>
      <template v-if="initFinish">
        <preview
          ref="preview"
          @changePlatform="changePlatform"
        />

        <inspector :event-name="event.event_name" :template-name="templateName" />
      </template>
      <el-dialog
        title="快捷键"
        :visible.sync="dialogShortCutVisible"
        width="30%"
      >
        <div v-for="item in shortCutsDescMap" :key="item.key" class="dialogshortcut-body">
          <div class="dialogshortcut-item">
            <div class="dialogshortcut-item-left">
              {{ item.key }}
            </div>
            <div class="dialogshortcut-item-right">
              <span v-html="item.button[0]">
              </span>
              <i class="dialogshortcut-plus">+</i>
              <span v-html="item.button[1]">

              </span>
              <div v-if="item.button[2]">
                <i class="dialogshortcut-plus">+</i>
                <span>{{ item.button[2] }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>

    <template-add-modal
      :show="tempAddShow"
      :loading="tempLoading"
      title="新建模板"
      @close="tempAddShow = false"
      @submit="handleTempAdd"
    />

    <diff
      v-model="showDiffDialog"
      :old-str="oldStr"
      :new-str="newStr"
      @confirm="handleConfirmSaveConfig"
    />
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
        value="{}"
        @change="val=>codeModeVal = val"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="codeModeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmChangePageConfig">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions
} from 'vuex';
import lodash from 'lodash';
import hotkeys from 'hotkeys-js';
import { QS } from '@me/utils';
import { environment } from 'appConfig';
import clipboard from 'mihoyo-clipboard';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import FileSaver from 'file-saver';
import { MI18N_RES_TYPE } from '@/types';
import constants, { templayeKeys } from '@/constants';
import { PAGE_ICON_MAP, DEFAULT_LANG_MAP, STAT_MAP } from '@/constants/gameBizConfig';
import * as utils from '@/utils';
import history from '@/utils/historyRecord';
import openDialog from '@/utils/openDialog';
import { compareVersion } from '@/utils/';
import { debounce } from '@/utils/tools';
import eventModel from '@/models/event';
// import compModel from '@/models/component';
import templateModel from '@/models/template';
import urlDialog from '@/components/urlDialog';
import diff from '@/components/diff.vue';
import compLibrary from './docks/compLibrary';
import FuncModule from './docks/funcModule';
import nodeTree from './docks/nodeTree';
import preview from './docks/preview';
import inspector from './docks/inspector';
import { shortCutsDescMap } from '@/constants/shortcutKey';
import './index.scss';

export default {
  name: 'EditMain',
  components: {
    compLibrary,
    nodeTree,
    preview,
    inspector,
    diff,
    codeMode: () => import(/* webpackChunkName: "codeMode" */ '@/components/codeMode'),
    FuncModule
  },
  data() {
    return {
      inMerlin: !!QS.inMerlin,
      stopWatch: () => {},
      lockHistory: false, // 来自undo,redo产生的变化时锁住不push
      publishing: false,
      initFinish: false,
      templateName: '',
      event: {
        event_name: '',
        is_mi18n: false, // 是否支持多语言
        biz_list: [],
        game_biz: '',
        publish_key: '',
        mi18n_key: '',
      },
      // 显示哪个树
      treeActiveName: 'nodes',
      mode: {},
      tempLoading: false, // 增加模板请求
      tempAddShow: false,
      // diff 相关
      showDiffDialog: false,
      codeModeInited: false,
      codeModeDialogVisible: false,
      showDownloadMi18n: false,
      codeModeVal: '',
      oldStr: '',
      newStr: '',
      activeTab: 'component',
      dialogShortCutVisible: false,
      shortCutsDescMap,
      // 快捷键相关
      copyNode: null,
      merlinDomainList: undefined
    };
  },
  computed: {
    ...mapState([
      'platform',
      'baseInfo',
      'platMsg',
      'nodes',
      'activeNodeId',
      'activeScreenNodeId',
      'gameBiz',
      'lang',
      'modeType',
      'prePageConfig',
      'compList',
      'canvasTransformData',
      'funcModules'
    ]),
    // only dev comp
    ...mapState('dev', ['devCompType', '_interceptingComps']),
    // only dev comp
    ...mapState('dev', {
      devEnabled: 'enabled'
    }),
    ...mapGetters([
      'viewport',
      'allComps',
      'pageConfig',
      'activeNode',
      'fullpageNodes',
      'dialogNodes',
      'pageCompNode',
      'normalNodes',
      'dfsDialogNodes',
      'dfsNodes',
      'activeScreenNode',
      'activeNode',
      'mapNodes',
      'mapProNodes',
      'isPageCompType',
      'pageCompNode',
      'pageComp',
      'activeNodePro',
      'allMi18nMsgList',
      'mi18nCreateMsgList'
    ]),
    eventId() {
      return Number(this.$route.params.eventId || this.$route.query.eventId);
    },
    // 模板Id，模板编辑页下不为空
    templateId() {
      return this.$route.params.templateId;
    },
    isEditingTpl() {
      return !!this.templateId;
    },
    // 显示所有弹窗
    showAllDialog: {
      set(newVal) {
        if (newVal) {
          this.dialogNodes.forEach(node => {
            this.updateNodeInNewScreen({
              type: 'add',
              id: node.id
            });
          });
        } else {
          [...this.activeScreenNodeId].forEach(id => {
            if (this.mapNodes[id].nodeCategory === 'dialog') {
              this.updateNodeInNewScreen({
                type: 'remove',
                id
              });
            }
          });
        }
      },
      get() {
        return this.activeScreenNode.filter(node => node.type === 'dialog').length === this.dialogNodes.length;
      }
    },
    mi18nMsg: {
      get() {
        return (!this.gameBiz || !this.lang) ? [undefined] : [this.gameBiz, this.lang];
      },
      set(newVal = []) {
        this.setMi18nData({ gameBiz: newVal[0], lang: newVal[1], id: this.eventId });
      }
    },
    // 多语言渠道选择
    bizSelectOptions() {
      if (!this.baseInfo.langMap) {
        return [];
      }
      const options = Object.keys(this.baseInfo.langMap).map((gameBiz) => ({
        value: gameBiz,
        label: gameBiz,
        children: this.baseInfo.langMap[gameBiz].map(lang => ({
          label: lang,
          value: lang
        }))
      }));
      return options;
    },
    // 保存/更新 模板操作时的baseInfo参数
    tplBaseInfo() {
      return lodash.pick(this.pageConfig.baseInfo, templayeKeys);
    },
    // only dev comp
    invalidDevPageComp() {
      return this.devEnabled && this.devCompType === 'page' && Object.keys(this._interceptingComps)?.length !== 1;
    },
    // only dev comp
    validDevPageComp() {
      return this.devEnabled && this.devCompType === 'page' && Object.keys(this._interceptingComps)?.length === 1;
    }
  },
  watch: {
    activeNodeId(newVal) {
      if (!newVal) return;
      const nodePro = this.mapProNodes[newVal];
      this.treeActiveName = nodePro.rootNode.nodeCategory === 'dialog' ? 'dialog' : 'nodes';
    },
    eventId() {
      window.location.reload();
    },
    'viewport.width': function () {
      this.setRemUnit();
    },
    lang(newVal) {
      if (newVal) {
        this.activeTab = 'node';
      }
    },
    // only dev comp
    devCompType() {
      if (this.invalidDevPageComp) this.showTipsDevComp();
      if (this.validDevPageComp || this.devCompType === 'component') window.location.reload();
    },
    // only dev comp
    _interceptingComps() {
      if (this.invalidDevPageComp) this.showTipsDevComp();
      if (this.validDevPageComp) window.location.reload();
    },
  },
  async mounted() {
    await this.init();
    this.recordHistory();
    this.bindShortCut();
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  methods: {
    ...mapMutations([
      'updateNodes',
      'updatePageConfig',
      'initPlatMsg',
      'updatePlatform',
      'updateCompList',
      'changeCustomCanvas',
      'changeModeType',
      'updateActiveNodeId',
      'setCustomBaseInfo'
    ]),
    ...mapActions([
      'addFullScreenRootNode',
      'updateNodeInNewScreen',
      'checkMi18nStatus',
      'setMi18nData',
      'updateResources',
      'addPageComp',
      'fetchCompModule',
      'getEventFuncModuleList',
      'getFeFuncModuleList',
      'handleZoomIn',
      'handleZoomOut',
      'searchDep',
      'searchDepPlat'
    ]),
    // 改变pc或者移动端渠道
    async changePlatform(newV) {
      // 搜集当前的资源
      this.updateResources();
      this.searchDepPlat();
      // 将已有的内容保存
      this.updatePageConfig(this.pageConfig);
      // 更新渠道信息
      this.updatePlatform(newV);
      const platMsg = { ...(this.prePageConfig[this.platform] || {}) };
      const nodes = platMsg.nodes || [];
      delete platMsg.nodes;
      await this.initPlatConfig({ nodes, platMsg });
      // 清空编辑记录
      history.clear();
    },
    recordHistory() {
      const state2watch = ({
        nodes
      }) => JSON.stringify({
        nodes
      });
      const watchCallback = (newVal) => {
        if (this.lockHistory) {
          this.lockHistory = false;
          return;
        }
        history.push(newVal, { force: true });
        this.lockHistory = false;
      };

      const watchOptions = {
        immediate: true,
        deep: false
      };
      this.stopWatch = this.$store.watch(state2watch, debounce(watchCallback, 150), watchOptions);
    },
    clearHistoryRecord() {
      this.stopWatch?.();
      history.clear();
    },
    handleDevCommand(command) {
      this[command]();
    },
    bindShortCut() {
      const deleteNode = async () => {
        console.log('deleteNode triggered');
        if (!this.activeNodeId) {
          return;
        }
        try {
          await this.$confirm(`确认删除组件：“${this.activeNode.alias}” ?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
          this.$store.dispatch('removeNode', { id: this.activeNodeId });
        } catch (err) {
          // this.activated = true;
        }
      };

      const undo = () => {
        console.log('undo');
        const newVal = history.undo();
        if (newVal !== null) {
          // console.log('lock');
          this.lockHistory = true;
          this.$store.commit('updateHistory', JSON.parse(newVal));
        }
      };
      const redo = () => {
        console.log('redo');
        const newVal = history.redo();
        if (newVal !== null) {
          // console.log('lock');
          this.lockHistory = true;
          this.$store.commit('updateHistory', JSON.parse(newVal));
        }
      };

      const zoomIn = this.handleZoomIn;
      const zoomOut = this.handleZoomOut;
      const copy = () => {
        if (!this.activeNode) {
          return;
        }
        const { nodeCategory } = this.activeNode;
        const { editOptions } = this.activeNodePro;
        if (editOptions.noDrag) {
          this.$message({
            message: '当前节点不可快捷键复制',
            type: 'warning'
          });
          this.copyNode = null;
          return;
        }
        const whiteList = ['text'];
        if (nodeCategory && !whiteList.includes(nodeCategory)) {
          this.$message({
            message: '当前节点暂时不可快捷键复制',
            type: 'warning'
          });
          this.copyNode = null;
          return;
        }
        this.copyNode = JSON.parse(JSON.stringify(this.activeNode));
        this.$message({
          message: '节点复制成功',
          type: 'success',
          duration: 1000
        });
      };
      const paste = async () => {
        if (!this.copyNode) {
          this.$message({
            message: '请先复制节点',
            type: 'warning'
          });
          return;
        }
        const id = await this.$store.dispatch('pasteNode', { node: this.copyNode });
        if (id) {
          this.updateActiveNodeId(id);
          this.copyNode = this.activeNode;
        }
      };

      const shortCutsMap = {
        backspace: deleteNode,
        'ctrl+z': undo,
        'cmd+z': undo,
        'ctrl+shift+z': redo,
        'cmd+shift+z': redo,
        'cmd+=': zoomOut,
        'cmd+-': zoomIn,
        'ctrl+=': zoomOut,
        'ctrl+-': zoomIn,
        'cmd+c': copy,
        'ctrl+c': copy,
        'cmd+v': paste,
        'ctrl+v': paste,
        // 'ctrl+r': reset,
        // 'cmd+r': reset
      };

      const hotkeysScope = Object.keys(shortCutsMap).join(',');
      hotkeys(hotkeysScope, (event, handler) => {
        event.preventDefault();
        const fn = shortCutsMap[handler.key];
        fn.call(this);
      });
      hotkeys.filter = function (event) {
        const target = event.target;
        const tagName = target.tagName;
        return !(target.isContentEditable || window.getSelection().toString().length || (tagName === 'INPUT' && !['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit'].includes(target.type)) || tagName === 'SELECT' || tagName === 'TEXTAREA');
      };
      this.$gon('undo', undo);
      this.$gon('redo', redo);
    },
    unbindShortCut() {
      this.$goff('undo');
      this.$goff('redo');
      hotkeys.unbind();
    },

    handleBeforeUnload(event) {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = '';
    },
    async init() {
      this.setRemUnit();
      // await this.getEventModuleList();

      if (this.templateId) {
        await this.getTemplateInfo();
        return;
      }
      await this.getEventInfoConfig();
    },
    handleOpenCodeMode() {
      this.codeModeInited = true;
      this.codeModeDialogVisible = true;
    },
    async confirmChangePageConfig() {
      await this.$confirm('确认更新页面配置?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      await this.handleUpdateEventConfig(this.codeModeVal);
      window.location.reload();
    },
    setRemUnit() {
      const designWidth = this.platMsg.body.width;
      utils.setRemUnit(this.viewport.width, designWidth);
    },
    async getFuncModuleList() {
      const { eventId } = this;
      let eventKey = '';
      // todo后续改成有非纯前端项目才请求接口，因为inMerlin不一定是有后端的
      if (this.inMerlin) {
        try {
          const res = await this.getEventFuncModuleList({ eventId });
          eventKey = res.eventKey;
          this.merlinDomainList = res.domain_list;
        // eslint-disable-next-line no-empty
        } catch (e) {
          console.error(e);
        }
      }
      this.event.eventKey = eventKey;
      await this.getFeFuncModuleList({ eventId, eventType: this.event.event_type });
    },
    async getEventModuleList() {
      const [h5Comps, pcComps] = await Promise.all([
        eventModel.getEventModuleList({
          id: this.eventId,
          device_mode: 2,
        }),
        eventModel.getEventModuleList({
          id: this.eventId,
          device_mode: 1,
        }),
      ]);
      const allComps = {
        ...pcComps,
        ...h5Comps
      };

      this.$store.commit('updateCompList', allComps);
    },
    // 获取模板配置信息
    async getTemplateInfo() {
      const resp = await templateModel.getTemplateInfo({ id: this.templateId });
      const config_str = resp.config_str || '{}';
      delete resp.config_str;
      this.oldStr = config_str;
      this.event = resp;
      await this.getFuncModuleList();
      const pageConfig = JSON.parse(config_str);
      console.log('getTemplateInfo: ', {
        ...resp,
        config_str: pageConfig
      });
      this.templateName = resp.template_name;
      this.initEventConfig(pageConfig);
    },
    // 获取活动配置信息
    async getEventInfoConfig() {
      const resp = await eventModel.getEventInfo({
        id: this.eventId
      });
      const config_str = resp.config_str || '{}';
      delete resp.config_str;
      const pageConfig = JSON.parse(config_str);
      this.oldStr = config_str;
      this.event = resp;
      await this.getFuncModuleList();
      if (this.event.is_mi18n && this.event.mi18n_key) {
        this.event.langMap = await this.getMi18nMsg(this.event.mi18n_key);
      }
      this.mode = {
        pc: resp.pc_page_mode,
        h5: resp.mobile_page_mode
      };
      await this.initEventConfig(pageConfig);
    },
    async initPlatConfig({
      nodes, platMsg, isCompPage
    }) {
      const platInitMsg = {
        platform: this.platform,
        pageMode: this.mode[this.platform],
        platMsg,
      };
      // 添加原有节点
      this.updateNodes({ newNodes: nodes });
      // 如果是页面级别组件就添加页面级别组件进入
      if (isCompPage) {
        // 如果该组件没初始化过，则请求一下组件资源，并设置自定义页面内容
        if (!nodes.length) {
          /**
           * 到时候纯前端的页面级组件就从其他命名空间拿
           */
          const funcModule = this.funcModules[0];
          const { flow_id_list, fe_list, version_list } = funcModule ?? {};
          const { module_name } = fe_list?.[0] ?? {};
          const compConfig = {
            name: module_name,
          };

          // only dev comp
          // 页面级组件调试，指定替换为本地组件
          if (this.validDevPageComp) {
            compConfig.name = Object.keys(this._interceptingComps)?.[0];
          }

          // 后端的页面级组件
          if (this.inMerlin) {
            compConfig.beData = {
              flowList: flow_id_list,
              versionList: version_list
            };
          }
          await this.addPageComp(compConfig);
          // 设置自定义baseInfo，比如是否开启cookieTip是否关闭游戏内音乐等
          this.setCustomBaseInfo(this.compList[this.nodes[0].name].main.declarations.customBaseInfo);
        }
        const { editEnv, flexibleOptions } = this.compList[this.nodes[0].name].main.declarations;
        const { canvasWidth, canvasHeight } = editEnv;
        this.changeCustomCanvas({
          width: canvasWidth,
          height: canvasHeight
        });
        // 设置为预览模式
        this.changeModeType('preview');
        this.initPlatMsg({ ...platInitMsg, flexibleOptions });
        // 激活
        this.updateActiveNodeId(this.pageCompNode.id);
        return;
      }
      this.initPlatMsg(platInitMsg);
      // 如果是滚屏，则自动添加第一个页面
      if (this.platMsg.body.fullScreen && this.fullpageNodes.length === 0) {
        await this.addFullScreenRootNode();
      }
    },
    async loadAllComps(eventConfig) {
      const compLoaders = {};
      const allNodes = [...eventConfig.pc?.nodes || [], ...eventConfig.h5?.nodes || []];
      utils.dfsNodes(allNodes, (node) => {
        if (compLoaders[node.name]) return;
        const compLoader = this.$store.dispatch('fetchCompModule', {
          compName: node.name,
          version: node.version
        });
        compLoaders[node.name] = compLoader;
      });
      await Promise.all(Object.values(compLoaders));
      utils.dfsNodes(allNodes, (node) => {
        node.version = this.compList[node.name].version;
      });
    },
    // 根据原始配置信息 初始化store.baseInfo和store.nodes
    async initEventConfig(eventConfig) {
      // 复制或者从模版生成等情况下publish_key不相同，使用替换过了的publishKey
      if (eventConfig.baseInfo?.publish_key && this.event.publish_key && eventConfig.baseInfo?.publish_key !== this.event.publish_key) {
        // 格式化通过复制生成的配置
        eventConfig = JSON.parse(this.fmtConfig(this.event.publish_key, eventConfig));
      }
      const isCompPage = this.validDevPageComp ? true : this.event?.func_module?.length;
      const biz = this.event.game_biz.replace(/_[\w\W]*/, '');

      // 不是长页面就是滚屏
      const isFullscreen = this.mode.h5 !== constants.pageMode.scrollPage;
      const landscapeTipDefault = eventConfig.baseInfo?.landscapeTip ?? (!isCompPage ? isFullscreen : false);

      const baseInfo = {
        ...(eventConfig.baseInfo || {}),
        id: this.eventId,
        game_biz: this.event.game_biz,
        eventKey: this.event.eventKey,
        statKey: STAT_MAP[biz] || '',
        // 模版下不存在bizList所以按照配置数据为准
        bizList: this.event.biz_list || eventConfig.baseInfo?.bizList,
        // 模版的情况下，不存在event.publish_key
        publish_key: this.event.publish_key || eventConfig.baseInfo?.publish_key,
        lang: this.event.lang || '',
        langMap: this.event.langMap,
        previewPlatList: eventConfig.baseInfo?.previewPlatList || [],
        head: {
          icon: PAGE_ICON_MAP[biz]?.cn || PAGE_ICON_MAP.default.cn,
          ...(eventConfig.baseInfo?.head || {})
        },
        seaHead: {
          icon: PAGE_ICON_MAP[biz]?.sea || PAGE_ICON_MAP.default.sea,
          ...(eventConfig.baseInfo?.seaHead || {})
        },
        mi18n: {
          enable: this.event.is_mi18n,
          key: this.event.mi18n_key,
        },
        isDevop: environment !== 'production',
        /** 横竖屏提示，非页面级组件为true */
        landscapeTip: landscapeTipDefault,
        commonDomainList: this.event.domain_list,
        domainList: this.merlinDomainList
      };
      if (!baseInfo.buildVer) {
        // baseInfo.buildVer = await compModel.getRenderTemplateLatestVersion();
        baseInfo.buildVer = constants.latestBuilderVer;
      }
      try {
        // 加载所有组件的信息
        await this.loadAllComps(eventConfig);
      } catch (e) {
        this.$notify({
          title: '组件初始化错误',
          message: '组件初始化失败！请刷新页面重试！',
          type: 'error'
        });
      }
      // 更新baseInfo，更新当前渠道信息
      this.$store.commit('updateBaseInfo', baseInfo);
      if (!eventConfig[this.platform]?.enable && eventConfig.h5?.enable) {
        this.updatePlatform('h5');
      }
      let platMsg = { ...(eventConfig[this.platform] || {}) };
      let nodes = platMsg.nodes || [];
      // 页面级别组件情况下默认将plat设置为h5
      if (isCompPage) {
        this.updatePlatform('h5');
        platMsg = { ...(eventConfig[this.platform] || {}) };
        nodes = platMsg.nodes || [];
        this.activeTab = 'be';
      }

      delete platMsg.nodes;
      // todo
      await this.initPlatConfig({
        nodes,
        platMsg,
        isCompPage
      });
      this.updatePageConfig(eventConfig);
      this.initFinish = true;
    },
    // 格式化配置
    fmtConfig(publish_key, pageConfig = this.pageConfig) {
      const oldPublishKey = pageConfig.baseInfo.publish_key;
      const newPublishKey = publish_key || utils.newEventId();
      pageConfig.baseInfo.publish_key = newPublishKey;
      // ['h5', 'pc'].forEach(key => {
      //   if (!pageConfig[key]) return;
      //   const newPlatConfig = { ...pageConfig[key] };
      //   const platNodes = newPlatConfig?.nodes;
      //   if (platNodes) {
      //     const newNode = utils.getDefNodes(platNodes, (node) => {
      //       const id = utils.newId();
      //       idMap[node.id] = id;
      //       node.id = id;
      //       return node;
      //     });
      //     newPlatConfig.nodes = newNode;
      //   }
      //   newConfig[key] = newPlatConfig;
      // });
      return JSON.stringify(pageConfig, (key, value) => {
        if (key?.startsWith('pzmi18n')) {
          return undefined;
        }
        // 复制项目的时候，所有多语言多状态相关的都去掉
        if (value === oldPublishKey) {
          return newPublishKey;
        }
        return value;
      });
    },
    // 复制页面配置
    copy() {
      const newConfig = JSON.stringify(this.pageConfig);
      clipboard({
        text: newConfig,
        onSuccess: () => {
          this.$message({
            type: 'success',
            message: '保存成功'
          });
        }
      });
    },

    // 保存 更新页面配置
    async updateEventConfig() {
      // 将当前页面的资源搜集一下
      this.updateResources();
      this.searchDepPlat();
      // 搜集相关依赖，做动态处理
      this.searchDep();
      // 更新pageConfig
      const config_str = JSON.stringify(this.pageConfig);
      if (config_str === this.oldStr) {
        this.$notify({
          title: '无需保存',
          message: '没有更改，无需保存',
          type: 'warning'
        });
        return;
      }
      this.startDiff(config_str);
    },

    async handleConfirmSaveConfig() {
      await this.handleUpdateEventConfig(this.newStr);
      this.resetDiff();
      this.$message({
        type: 'success',
        message: '保存成功'
      });
    },
    async handleUpdateEventConfig(str) {
      this.ensureNoDevConfigSaved();
      await eventModel.updateEventConfig({
        id: this.eventId,
        config_str: str,
        version: this.event.version
      });
      this.event.version += 1;
      this.resetDiff();
    },
    langListSort(gameBiz, langList = []) {
      if (!langList.length) return [];
      if (!DEFAULT_LANG_MAP[gameBiz]) return langList;
      const sortLangList = [];
      DEFAULT_LANG_MAP[gameBiz].forEach(lang => {
        if (langList.includes(lang)) {
          sortLangList.push(lang);
        }
      });
      return sortLangList;
    },
    // 拿到多语言需要的信息
    async getMi18nMsg(mi18nKey) {
      const [err, data] = await this.$async(eventModel.getMi18nInfo({
        app_key: mi18nKey,
        id: this.eventId
      }));
      if (err) return;
      const { id, lang_order = [] } = data?.biz?.[0] || {};
      const url = `https://${environment === 'production' ? '' : 'dev'}op.mihoyo.com/static/new-i18n-admin/index.html#/application/translation/${id}?langs=${lang_order?.join(',')}`;
      this.$store.commit('updateMi18nAdminUrl', url);
      const langMap = {};
      data?.biz?.forEach(item => {
        langMap[item.biz_type] = this.langListSort(item.biz_type, item.lang_order);
      });
      return langMap;
    },
    async handleUpdateMi18n() {
      await this.$confirm('确定更新到多语言?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });

      const [err] = await this.$async(this.updateMi18n());

      if (err !== null) {
        this.$message({
          type: 'error',
          message: '多语言更新失败'
        });
        throw new Error(err);
      }
      this.$message({
        type: 'success',
        message: '多语言字段更新成功'
      });
    },
    async updateMi18n() {
      const mi18nKeys = this.mi18nCreateMsgList;
      // 收集mi18nKeys完成，调用接口更新mi18n，创建单子（若无）并更新字段
      const [mi18nErr] = await this.$async(eventModel.updateMi18n({
        id: this.eventId,
        list: mi18nKeys,
      }));
      if (mi18nErr) {
        this.$message({
          type: 'error',
          message: '多语言更新失败'
        });
        return Promise.reject();
      }
      return Promise.resolve();
    },
    getFile(url) {
      return new Promise((resolve, reject) => {
        JSZipUtils.getBinaryContent(url, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    },
    // 获取图片的格式
    getFileEx(imgUrl) {
      const arrName = imgUrl.split('.');
      return arrName[arrName.length - 1];
    },
    setMi18nDataByType({
      type, allMi18nList, zip, promises
    }) {
      const mi18nList = allMi18nList.filter(item => item.type === type);
      const labelMap = {
        image: '图片',
        video: '视频',
        audio: '音频'
      };
      const dirName = `多语言${labelMap[type] || ''}资源`;
      zip.folder(dirName);
      mi18nList.forEach((item) => {
        const promise = this.getFile(item.value).then((data) => {
          const imgUrl = item.value;
          const fileName = `${item.mi18nKEY}.${this.getFileEx(imgUrl)}`;
          zip.file(`${dirName}/${fileName}`, data, {
            binary: true
          }); // 逐个添加文件
        });
        promises.push(promise);
      });
      return promises;
    },
    downloadMi18n(type) {
      this.showDownloadMi18n = false;
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading'
      });
      const mi18nList = this.allMi18nMsgList.filter(item => item.value);

      const zip = new JSZip();
      const promises = [];
      if (type) {
        this.setMi18nDataByType({
          type, allMi18nList: mi18nList, zip, promises
        });
      } else {
        const labelList = [MI18N_RES_TYPE.IMAGE, MI18N_RES_TYPE.VIDEO, MI18N_RES_TYPE.AUDIO];
        labelList.forEach((item) => {
          this.setMi18nDataByType({
            type: item, allMi18nList: mi18nList, zip, promises
          });
        });
      }
      Promise.all(promises).then(() => {
        zip
          .generateAsync({
            type: 'blob'
          })
          .then((content) => {
            // 生成二进制流
            FileSaver.saveAs(content, `${this.event.event_name}多语言资源.zip`); // 利用file-saver保存文件
            this.$alert('资源下载成功', '成功', {
              type: 'success',
            });
          }).catch(() => {
            this.$alert('资源下载失败', '失败', {
              type: 'error',
            });
          }).finally(() => {
            loading.close();
          });
      });
    },
    compareVersion(c, v) {
      if (!this.baseInfo.buildVer) return false;
      return compareVersion(this.baseInfo.buildVer, c, v);
    },
    // 发布
    async handleCommand(item) {
      try {
        await this.$confirm(`确认发布到${constants.envMap[item.env].name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 发布非测试环境需要校验mi18n发布状态
        await this.checkMi18nStatus({
          env: item.env,
          is_mi18n: this.event.is_mi18n,
          eventId: this.eventId,
        });
        const { id } = await this.publishEvent(item.env);
        let timer = setInterval(async () => {
          const { status } = await this.getEventPublishInfo(id);
          if (status === 'PublishStatusOK' || status === 'PublishStatusFail') {
            const isOk = status === 'PublishStatusOK';
            this.$notify({
              title: '发布结果',
              message: isOk ? '发布成功' : '发布失败',
              type: isOk ? 'success' : 'error'
            });
            clearInterval(timer);
            timer = null;
            this.publishing = false;
          }
        }, 3000);
      } catch (error) {
        this.publishing = false;
      }
    },
    updatePage() {
      const newConfig = JSON.parse(JSON.stringify(this.prePageConfig));
      newConfig.baseInfo.buildVer = '';
      const allNodes = [...newConfig.pc?.nodes || [], ...newConfig.h5?.nodes || []];
      utils.dfsNodes(allNodes, (node) => {
        node.version = '';
      });
      this.handleUpdateEventConfig(JSON.stringify(newConfig));
      window.location.reload();
    },
    async publishEvent(env) {
      try {
        this.publishing = true;
        const resp = await eventModel.publishEvent({
          env,
          id: this.eventId
        });
        console.log('publish resp: ', resp);
        return resp;
      } catch (err) {
        this.publishing = false;
        console.warn('publish err: ', err);
      }
    },

    async getEventPublishInfo(id) {
      try {
        const params = { id, loading: false };
        const res = await eventModel.getEventPublishInfo(params);
        return res;
      } catch (error) {
        console.log(error);
      }
    },

    getCurPageMode(platform) {
      return constants.pageModeMap.find(item => platform.mode === item.mode && platform.body.fullScreen === item.fullScreen)?.value || 1;
    },
    // 保存为模板
    async handleTempAdd(form) {
      this.tempLoading = true;
      try {
        await templateModel.addTemplate({
          cover: form.cover,
          template_name: form.template_name,
          event_id: this.eventId,
          mobile_page_mode: this.event.mobile_page_mode,
          pc_page_mode: this.event.pc_page_mode,
          config_str: JSON.stringify({
            ...this.pageConfig,
            baseInfo: this.tplBaseInfo,
          })
        });

        this.tempLoading = false;
        this.$message.success('模板创建成功');
        this.tempAddShow = false;
      } catch (err) {
        this.tempLoading = false;
        console.error(err);
      }
    },

    async saveAsTemplate() {
      this.ensureNoDevConfigSaved();

      if (this.isEditingTpl) { // 更新模板
        const [cancel] = await this.$async(this.$confirm('确认更新模板?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }));
        if (cancel) {
          return;
        }
        templateModel.updateTemplateConfig({
          id: this.templateId,
          config_str: JSON.stringify({
            ...this.pageConfig,
            baseInfo: this.tplBaseInfo,
          })
        });
      } else { // 保存为模板
        this.tempLoading = false;
        this.tempAddShow = true;
      }
    },

    handleViewPage() {
      this.$async(openDialog(urlDialog, {
        props: {
          event: this.event,
          eventKey: this.baseInfo.eventKey,
          hasOpenButton: true
        },
      }));
    },

    startDiff(str) {
      this.newStr = str;
      this.showDiffDialog = true;
    },

    resetDiff() {
      this.showDiffDialog = false;
      this.oldStr = this.newStr;
    },

    ensureNoDevConfigSaved() {
      // 列表中没有本地开发组件，跳过检查
      if (this.$store.getters['dev/compListArray'].length === 0) return;

      try {
        console.log(this.pageConfig);
        const { pc = { nodes: [] }, h5 = { nodes: [] } } = this.pageConfig;
        const nodes = [...pc.nodes, ...h5.nodes];
        while (nodes.length > 0) {
          const node = nodes.shift();
          if (node.__dev__) {
            throw new Error('配置中包含本地调试信息，无法保存');
          }
          if (Array.isArray(node.children)) {
            nodes.push(...node.children);
          }
        }
      } catch (e) {
        this.$message({
          type: 'error',
          message: (e && e.message) || 'Unknown Error'
        });
        throw e;
      }
    },
    // only dev comp
    showTipsDevComp() {
      this.$message.error('请勾选要调试的页面级组件，必须勾选单个');
    }
  }
};
</script>
