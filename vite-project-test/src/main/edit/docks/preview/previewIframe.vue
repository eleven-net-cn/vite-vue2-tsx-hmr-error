<template>
  <!-- 目前先写死game_biz与lang，后面动态拿 -->
  <iframe
    ref="preview"
    :key="src"
    class="iframe-preview-container"
    :src="src"
  />
  <!-- <iframe
    ref="preview"
    :key="key"
    class="iframe-preview-container"
    :src="`https://yuhui.mihoyo.com:8096/?bridge_name=${bridgeName}&plat=${platform}&game_biz=${baseInfo.game_biz}&lang=zh-cn&is_mobile=${platform === 'h5'?'true':''}`"
  /> -->
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { environment } from 'appConfig';
import {
  maxVersion, setBridge, deleteBridge, sendDataToIframe
} from '@/utils/';
// import { Emitter } from 'monaco-editor';

export default {
  props: {
    bridgeName: {
      type: String,
      default: 'preview'
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      changeTimer: null,
      firstToPreview: false,
      key: 0,
      preId: undefined,
      // 是否改变了状态
      iframeChange: false,
    };
  },
  computed: {
    ...mapState([
      'platform',
      'baseInfo',
      'modeType',
      'mi18nData',
      'gameBiz',
      'lang',
      'previewExtraParams',
      'pageModule',
      'pageStatus',
      'previewZone',
      'previewTime',
    ]),
    ...mapState('dev', ['lastModified']),
    ...mapGetters(['pageConfig', 'isPageCompType', 'curBiz']),
    // 预览页version
    previewVersion() {
      return maxVersion('2.1.2', this.baseInfo.buildVer);
    },
    moduleMsg() {
      return {
        module: this.pageModule,
        status: this.pageStatus
      };
    },
    src() {
      // let baseLink = 'https://puzzle.mihoyo.com:8096/?';
      const gameBiz = this.gameBiz || this.baseInfo.bizList?.find?.(biz => biz.endsWith('_cn')) || this.baseInfo.bizList?.[0] || this.baseInfo.game_biz;
      const isSea = !gameBiz.endsWith('_cn');
      // 海外则为hoyoverse
      let baseLink = `https://webstatic-test.mihoyo.com/puzzle/event/preview_template${this.previewVersion}/index.html?`;
      const params = {
        bridge_name: this.bridgeName,
        plat: this.platform,
        game_biz: gameBiz,
        lang: this.lang || this.baseInfo.lang || (isSea ? 'en-us' : 'zh-cn'),
        is_mobile: this.platform === 'h5' || '',
        pz_is_sea: isSea || '',
        pz_is_test: ['test', 'development'].includes(environment) || '',
        pz_time_zone: this.previewZone,
        pz_time: this.getRealPreviewTime(),
        has_mi18n: this.lang ? 'true' : '',
        pz_mi18n_key: this.lang ? this.baseInfo.mi18n.key : '',
        authkey_ver: '1',
        sign_type: '2',
        auth_appid: this.baseInfo.eventKey,
        pz_fullscreen: this.fullscreen || '',
        key: this.key,
        pz_publish_key: this.baseInfo.publish_key,
        pz_game_biz_dir: this.curBiz,
      };
      this.previewExtraParams.forEach(item => {
        params[item.key] = item.val;
      });
      Object.keys(params).forEach(key => {
        if (!params[key]) return;
        baseLink += `${key}=${params[key]}&`;
      });
      baseLink = baseLink.slice(0, -1);
      // eslint-disable-next-line max-len
      return baseLink;
    },
  },
  watch: {
    lastModified() {
      this.refresh();
    }
  },
  beforeDestroy() {
    deleteBridge(this.bridgeName);
  },
  created() {
    setBridge(this.bridgeName, {
      getPreviewData: async () => {
        await this.$nextTick();
        return {
          data: this.pageConfig,
          iframe: this.$refs.preview
        };
      },
      getPageModule: async () => {
        await this.$nextTick();
        // 响应式返回
        return {
          data: this.moduleMsg,
          iframe: this.$refs.preview
        };
      },
      // 页面组件通信
      statusChange: (data) => {
        if (data.module !== undefined && data.module !== this.module && data.status === undefined) {
          // 先清空状态
          data.status = '';
        }

        // 不为空 && 和当前的模块不一样
        if (data.module !== undefined && data.module !== this.module) {
          this.iframeChange = true;
          this.updatePageModule(data.module);
        }

        if (data.status !== undefined && data.status !== this.status) {
          this.iframeChange = true;
          this.updatePageStatus(data.status);
        }
      },
      getMetaOrCtrlKeyEvent: ({ keyType, ...keyList }) => {
        const e = new Event(keyType);
        Object.keys(keyList).forEach(key => {
          e[key] = keyList[key];
        });
        document.body.dispatchEvent(e);
      },
      onLoad: () => {
        this.$emit('onLoad');
      },
      getMi18n: async () => {
        await this.$nextTick();
        return {
          data: this.mi18nData,
          iframe: this.$refs.preview
        };
      }
    });
    if (this.isPageCompType) {
      this.$watch('pageConfig', async (newVal) => {
        this.sendDataToIframe('dataChange', newVal);
      }, { deep: true });

      this.$watch('moduleMsg', async (newVal, preVal) => {
        // 如果来自组件内部的emit，就不执行
        if (this.iframeChange) {
          this.iframeChange = false;
          return;
        }
        const curChange = this.getModuleMsgCurChange(newVal, preVal);
        this.sendDataToIframe('statusChange', { ...newVal, curChange });
      });
    }
  },
  methods: {
    // 根据watch的值返回改变的类型
    // module、status、all
    getModuleMsgCurChange(newVal, preVal) {
      // 2个同时改变
      if (newVal.module !== preVal.module && newVal.status !== preVal.status) {
        return 'all';
      }
      if (newVal.module !== preVal.module) {
        return 'module';
      }
      return 'status';
    },
    refresh() {
      this.key += 1;
    },
    getRealPreviewTime() {
      if (this.previewTime) {
      // 零时区的时间变为当前时区的当前时间
      // 比如零时区的0点，为东八区的为8点，那东八区为0点的话就要将时间戳减去时区
        return this.previewTime - this.previewZone * 60 * 60 * 1000;
      }
      // 比如当前为零时区的0点，为东八区的为8点，那东八区为0点的话
      const curZone = -(new Date().getTimezoneOffset()) / 60;
      return Date.now() - (this.previewZone - curZone) * 60 * 60 * 1000;
    },
    async sendDataToIframe(name, data) {
      await this.$nextTick();
      sendDataToIframe({
        bridgeName: this.bridgeName,
        iframe: this.$refs.preview,
        data,
        actionName: name
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.iframe-preview-container {
  width: 100%;
  height: 100%;
  border: none;
  box-shadow: 0 0 20px rgb(0 0 0 / 10%);
  background-color: white;
}
</style>
