<template>
  <div class="resource-list-dialog" @dragover.prevent="preventDragDefault">
    <div class="search-bar">
      组件名称：<el-input
        v-model="searchCompenontAlias" placeholder="请输入资源用到的组件名" size="mini"
        @input="searcnChange"
      ></el-input>
      资源链接：<el-input
        v-model="searchUrl" placeholder="请输入资源链接" size="mini"
        @input="searcnChange"
      ></el-input>
      <!-- <div class="resource-preload-num-box">
        自动预加载前<el-input-number
          size="mini"
          :value="preloadNum" controls-position="right" :min="0"
          @change="changePreloadNum"
        ></el-input-number>个
      </div> -->
    </div>
    <div class="resource-list-main">
      <el-tabs v-model="tabName" tab-position="left">
        <el-tab-pane
          v-for="(typeList,type) in filterResources"
          :key="type" :name="type"
          :label="RES_TYPE_LIST[type].label"
        >
          <el-table
            :ref="`table${type}`"
            highlight-current-row
            :data="typeList"
            style="width: 100%"
            :row-class-name="getrowClassName"
            max-height="600"
            :row-key="(row)=>row.src"
          >
            <el-table-column
              label="资源"
              header-align="center"
              width="180"
            >
              <template slot-scope="scope">
                <Media
                  :type="type" :src="scope.row.src"
                  :extension="scope.row.extension"
                />
              </template>
            </el-table-column>
            <el-table-column
              header-align="center"
              align="center"
            >
              <template slot="header">
                关联组件
                <el-tooltip
                  effect="dark"
                  content="若想取消一个组件与其他组件关联同一张图片的情况，需在单个组件节点单独替换。"
                  placement="top"
                >
                  <i class="el-icon-info" />
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.compList" :key="index" :disable-transitions="true">
                  {{ item.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              header-align="center"
              width="300"
            >
              <template slot="header">
                资源替换<span v-if="type !== RES_TYPE.IMAGE">（只支持相同格式）</span>
              </template>
              <template slot-scope="scope">
                <Upload
                  :is-blob-url="isBlobUrl"
                  :type="type"
                  :extension="scope.row.extension"
                  :revoke-object-u-r-l="revokeObjectURL"
                  :file-msg="scope.row.fileMsg" :accept="getCanUploadResType(type,scope.row.extension)"
                />
              </template>
            </el-table-column>
            <el-table-column
              v-if="![RES_TYPE.VIDEO,RES_TYPE.AUDIO].includes(type)"
              header-align="center"
              sortable
              :sort-method="sortMethod"
              :sort-orders="[ 'descending', null]"
              align="center"
              width="150"
            >
              <template slot="header" slot-scope="scope">
                开启预加载
                <el-tooltip
                  effect="dark"
                  content="默认前5个资源默认预加载，且不能取消。"
                  placement="top"
                >
                  <i class="el-icon-info" />
                </el-tooltip>
                <!-- <el-switch
                  :value="typeListPreloadState[type].allIsPreload" :disabled="!typeListPreloadState[type].oneCanPreload" @click.native.stop
                  @change="setAllPreload(type)"
                /> -->
              </template>
              <template slot-scope="scope">
                <el-switch :value="scope.row.preload||scope.row.autoPreload" :disabled="scope.row.noPreload||scope.row.autoPreload" @change="preloadChange($event,scope.row)" />
              </template>
            </el-table-column>
            <el-table-column
              header-align="center"
              align="center"
              width="260"
            >
              <template slot="header">
                资源类型
                <el-tooltip
                  effect="dark"
                  :content="type === RES_TYPE.IMAGE?'暂只支持：JPG，JPEG。PNG，GIF格式':'只允许上传对应类型资源'"
                  placement="top"
                >
                  <i class="el-icon-info" />
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-tag :disable-transitions="true">
                  {{ scope.row.extension }}
                </el-tag>
                <template v-if="curUploadLists.replaceUrlList[scope.row.src]&&curUploadLists.replaceUrlList[scope.row.src].extension&&scope.row.extension !== curUploadLists.replaceUrlList[scope.row.src].extension">
                  替换成
                  <el-tag type="success" :disable-transitions="true">
                    {{ curUploadLists.replaceUrlList[scope.row.src].extension }}
                  </el-tag>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="resource-list-footer">
      <div class="resource-list-foote-tip">
        <el-tag
          v-show="curUploadLists.startUploadList.length" size="mini" :disable-transitions="true"
          @click="goToView('upload')"
        >
          <span>正在上传 <span style="color:blue;">{{ curUploadLists.startUploadList.length }}</span> 个资源</span>
        </el-tag>
        <el-tag
          v-show="curUploadLists.uploadErrorList.length" size="mini" :disable-transitions="true"
          @click="goToView('error')"
        >
          <span>有 <span style="color:red;">{{ curUploadLists.uploadErrorList.length }}</span> 个资源上传失败</span>
        </el-tag>
      </div>
      <el-button @click="closeHandler">
        取 消
      </el-button>
      <el-button type="primary" @click="save">
        保 存
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import { RES_TYPE_LIST, TYPE_RES_MAP, RES_TYPE } from '@/constants/resource';
import { getResMsgByUrl } from '@/utils/resources';
import Media from './media.vue';
import Upload from './upload.vue';

export default {
  components: {
    Media,
    Upload
  },
  props: {
    value: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tabName: 'image',
      searchCompenontAlias: '',
      searchUrl: '',
      RES_TYPE_LIST,
      RES_TYPE,
      allResources: {},
      typeResources: {},
      preloadNum: 0,
      preloadIsChange: false
    };
  },
  computed: {
    ...mapState(['baseInfo', 'platMsg', 'nodes']),
    ...mapGetters(['platResources', 'dfsNodes']),
    curUploadLists() {
      const startUploadList = [];
      const uploadErrorList = [];
      const replaceUrlList = {};
      Object.values(this.allResources).forEach(resItem => {
        const { src } = resItem;
        if (resItem.fileMsg.startUpload) {
          startUploadList.push(src);
        }
        if (resItem.fileMsg.uploadError) {
          uploadErrorList.push(src);
        }
        if (resItem.fileMsg.url && !this.isBlobUrl(resItem.fileMsg.url)) {
          replaceUrlList[src] = { url: resItem.fileMsg.url, extension: getResMsgByUrl(resItem.fileMsg.url)?.[0].extension };
        }
      });
      return {
        startUploadList,
        uploadErrorList,
        replaceUrlList
      };
    },

    // typeListPreloadState() {
    //   const typeListPreloadState = {};
    //   Object.keys(this.filterResources).forEach(type => {
    //     const curTypeList = this.filterResources[type];
    //     let preloadLength = 0;
    //     let canPreloadLendth = 0;
    //     curTypeList.forEach(item => {
    //       if (!item.noPreload && item.preload && !item.autoPreload) {
    //         // 已被激活的选项
    //         preloadLength += 1;
    //       }
    //       if (!item.noPreload && !item.autoPreload) {
    //         canPreloadLendth += 1;
    //       }
    //     });
    //     typeListPreloadState[type] = {
    //       allIsPreload: Boolean(preloadLength) && preloadLength === canPreloadLendth,
    //       oneCanPreload: Boolean(canPreloadLendth),
    //     };
    //   });
    //   return typeListPreloadState;
    // },
    filterResources() {
      const urlFilter = this.searchUrl.toLowerCase();
      const aliasFIlter = this.searchCompenontAlias.toLowerCase();
      if (!urlFilter && !aliasFIlter) {
        return this.typeResources;
      }
      const filterResources = { ...this.typeResources };
      Object.keys(filterResources).forEach(type => {
        filterResources[type] = filterResources[type].filter(item => item.src.toLowerCase().includes(urlFilter) && item.compList.find(comp => comp.name.toLowerCase().includes(aliasFIlter)));
      });
      return filterResources;
    }
  },
  created() {
    this.init();
  },
  beforeDestroy() {
    this.revokeAllObjectURL();
  },
  methods: {
    ...mapMutations(['updateBaseInfo', 'initPlatMsg', 'updateNodes']),
    init() {
      this.preloadNum = this.platMsg.preloadNum;
      this.allResources = JSON.parse(JSON.stringify(this.platResources));
      const typeResources = {};
      Object.values(RES_TYPE).forEach(type => {
        typeResources[type] = [];
      });
      Object.keys(this.allResources).forEach((url, index) => {
        const item = this.allResources[url];
        this.$set(item, 'preload', item.preload || undefined);
        this.$set(item, 'fileMsg', {
          url: '',
          file: undefined,
          name: '',
          startUpload: false,
          uploadId: 0,
          progerss: 0,
          uploadError: false
        });
        this.$set(item, 'index', index);
        typeResources[item.type].push(item);
      });
      this.typeResources = typeResources;
    },
    preventDragDefault(e) {
      e.dataTransfer.dropEffect = 'none';
    },
    getCanUploadResType(type, extension) {
      if (type !== RES_TYPE.IMAGE) {
        return `.${extension}`;
      }
      return TYPE_RES_MAP[type].map(resType => `.${resType}`).join(',');
    },
    // setAllPreload(type) {
    //   const listPreloadState = this.typeListPreloadState[type];
    //   if (!listPreloadState.oneCanPreload) return;
    //   this.filterResources[type].forEach(item => {
    //     if (item.noPreload || item.autoPreload) return;
    //     this.$set(item, 'preload', !listPreloadState.allIsPreload);
    //   });
    // },
    isBlobUrl(url = '') {
      return url.indexOf('blob:') === 0;
    },
    revokeAllObjectURL() {
      Object.values(this.allResources).forEach(resItem => {
        this.revokeObjectURL(resItem.fileMsg.src);
      });
    },
    revokeObjectURL(url) {
      if (this.isBlobUrl(url)) {
        URL.revokeObjectURL(url);
      }
    },
    sortMethod(a, b) {
      const indexA = a.index;
      const indexB = b.index;
      a = Number(a.preload || a.autoPreload) || 0;
      b = Number(b.preload || b.autoPreload) || 0;
      if ((a - b) === 0) {
        return indexB - indexA;
      }
      return a - b;
    },
    getrowClassName({ row, rowIndex }) {
      return `puzzle-res-${row.type}-${rowIndex}`;
    },
    // 滚动到某个资源区域
    goToView(type) {
      // eslint-disable-next-line no-multi-assign
      this.searchCompenontAlias = this.searchUrl = '';
      const url = type === 'upload' ? this.curUploadLists.startUploadList[0] : this.curUploadLists.uploadErrorList[0];
      // 查看某个资源
      this.tabName = this.allResources[url].type;
      this.$nextTick(() => {
        const rowIndex = this.typeResources[this.tabName].findIndex(item => item.src === url);
        document.querySelector(`.${this.getrowClassName({ row: { type: this.tabName }, rowIndex },)}`).scrollIntoView({
          block: 'center'
        });
        this.$refs[`table${this.tabName}`][0].setCurrentRow(this.allResources[url]);
      });
    },
    searcnChange() {
      if (this.filterResources[this.tabName].length) return;
      Object.keys(this.filterResources).some(type => {
        const item = this.filterResources[type];
        if (item.length) {
          this.tabName = type;
          return true;
        }
      });
    },
    preloadChange(newVal, row) {
      row.preload = newVal;
      this.preloadIsChange = true;
    },
    changePreloadNum(num) {
      this.preloadNum = num;
      Object.values(this.allResources).forEach((item) => {
        const { noPreload, type } = item;
        if (!noPreload && type === 'image' && num > 0) {
          num -= 1;
          this.$set(item, 'autoPreload', true);
        } else {
          this.$set(item, 'autoPreload', undefined);
        }
      });
    },
    checkUpload() {
      if (this.curUploadLists.startUploadList.length) {
        this.goToView('upload');
        this.$alert('请等待资源上传完毕后再进行保存', '提示', {
          type: 'warning',
        });
        return false;
      }
      if (this.curUploadLists.uploadErrorList.length) {
        this.goToView('error');
        this.$alert('有资源上传失败，请调整后再进行保存', '提示', {
          type: 'error',
        });
        return false;
      }
      return true;
    },
    checkChanged() {
      // 后续要加上自动预加载的数量变更判断
      const { startUploadList, uploadErrorList, replaceUrlList } = this.curUploadLists;
      return startUploadList.length || uploadErrorList.length || Object.keys(replaceUrlList).length || this.preloadIsChange;
    },
    save() {
      if (!this.checkUpload()) return;
      if (!this.checkChanged()) {
        this.$emit('close');
        return;
      }
      const newResources = {};
      // 更换每个链接对应的是否预加载
      Object.values(this.allResources).forEach(resItem => {
        newResources[resItem.src] = {
          type: resItem.type,
          preload: resItem.preload || undefined
        };
      });
      // 更换所有链接
      let pageConfig = JSON.stringify({
        baseInfo: this.baseInfo,
        platMsg: {
          ...this.platMsg,
          resources: newResources,
          preloadNum: this.preloadNum
        },
        nodes: this.nodes,
      });
      Object.keys(this.curUploadLists.replaceUrlList).forEach(preUrl => {
        const newUrl = this.curUploadLists.replaceUrlList[preUrl].url;
        pageConfig = pageConfig.replaceAll(preUrl, newUrl);
      });
      pageConfig = JSON.parse(pageConfig);
      const loadingInstance = this.$loading({
        text: '保存中'
      });
      this.$emit('close');
      setTimeout(() => {
        this.updateBaseInfo(pageConfig.baseInfo);
        this.initPlatMsg({ platMsg: pageConfig.platMsg });
        this.updateNodes({ newNodes: pageConfig.nodes });
        loadingInstance.close();
      }, 200);
    },
    async closeHandler() {
      if (this.checkChanged()) {
        try {
          await this.$confirm('您的操作将不会被保存，确定要关闭吗？', '提示', {
            type: 'warning',
          });
          this.$emit('close');
          // eslint-disable-next-line no-empty
        } catch (e) {}
        return;
      }
      this.$emit('close');
    }
  }
};
</script>
<style lang="scss" scoped>
.resource-list-dialog {
  .search-bar {
    position: relative;
    display: flex;
    align-items: center;
    white-space: nowrap;
    margin-bottom: 20px;
    margin-left: 50px;
    & > .el-input {
      width: 200px;
      margin-right: 40px;
    }
    .resource-preload-num-box {
      position: absolute;
      right: 0;
    }
  }
  .resource-list-main {
    .el-tabs {
      height: 600px;
    }
  }
  .resource-list-footer {
    padding-top: 10px;
    margin-top: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
    .el-button {
      margin-left: 30px;
    }
    // border-top: 1px solid #eee;
    .resource-list-foote-tip {
      position: absolute;
      top: -20px;
      right: 0;
      color: #aaa;
      cursor: pointer;
    }
  }
}
</style>
