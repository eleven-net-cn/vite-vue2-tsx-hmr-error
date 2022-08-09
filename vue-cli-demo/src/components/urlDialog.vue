<template>
  <el-dialog
    title="查看地址"
    width="600px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :visible.sync="visible"
    @closed="onClosed"
  >
    <div class="page-url">
      <el-row class="addr-filter">
        <el-col :span="12">
          <div class="biz-selector">
            <span>选择业务：</span>
            <el-select v-model="curBiz" placeholder="请选择">
              <el-option
                v-for="biz in event.biz_list"
                :key="biz"
                :label="bizMap[biz]"
                :value="biz"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="type-selector">
            <span>选择类型：</span>
            <el-select v-model="curType" :disabled="typeOptions.length === 1" placeholder="请选择">
              <el-option
                v-for="type in typeOptions"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <ul class="page-url__list">
        <li v-for="env in envMap" :key="env.name">
          <el-tag :type="env.tagType" :disable-transitions="true">
            {{ env.label }}
          </el-tag>
          <div class="page-url__list-qrcode">
            <img :src="pageQrcode[env.name]" alt="">
          </div>
          <div>
            <el-button
              slot="append"
              v-clipboard:copy="pageUrls[env.name]"
              v-clipboard:success="handleCopy"
              size="mini"
              icon="el-icon-copy-document"
            >
              复制
            </el-button>
            <el-button
              v-if="hasOpenButton"
              slot="append"
              type="primary"
              size="mini"
              plain
              icon="el-icon-position"
              @click="openUrl(pageUrls[env.name])"
            >
              打开
            </el-button>
          </div>
        </li>
      </ul>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import QRCode from 'qrcode';
import { getAllUrl } from '@/utils/event/bh3preview';
import { getPageHref } from '@/utils/urlHandler';

export default {
  props: {
    // visible: {
    //   type: Boolean,
    //   default: false
    // },
    event: {
      type: Object,
      default: () => ({})
    },
    eventKey: {
      type: String,
      default: ''
    },
    hasOpenButton: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const norOption = {
      label: '普通体验地址',
      value: 'normal',
    };
    let curType = 'gameWebview';
    let typeOptions = [{
      label: '游戏公告地址',
      value: 'gameWebview',
    }, norOption];
    if (!this.eventKey) {
      typeOptions = [norOption];
      curType = 'normal';
    }
    return {
      visible: true,
      curBiz: '',
      curType,
      typeOptions,
      envMap: [
        {
          name: 'test',
          tagType: 'warning',
          label: '测试环境'
        },
        {
          name: 'pre',
          tagType: '',
          label: '预发布环境'
        },
        {
          name: 'prod',
          tagType: 'success',
          label: '正式环境'
        },
      ],
      pageUrls: {},
      pageQrcode: {},
    };
  },
  computed: {
    ...mapGetters([
      'bizMap',
      'pageCompNode'
    ]),
    isCn() {
      return /_cn/.test(this.curBiz);
    },
    typeBiz() {
      return {
        curType: this.curType,
        curBiz: this.curBiz,
      };
    },
  },
  watch: {
    event: {
      handler(newVal) {
        this.curBiz = newVal.biz_list?.[0];
      },
      immediate: true,
    },
    typeBiz: {
      async handler() {
        this.initLink();
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.pageCompNode?.name === '@puzzle/bh3-preview-template') {
      getAllUrl({ eventKey: this.eventKey, publishKey: this.event.publish_key, isSea: !this.isCn });
    }
  },
  methods: {
    openUrl(url) {
      window.open(url);
    },
    initLink() {
      this.pageUrls = this.getPageUrls(this.event);
      this.getPageQrcodes(this.pageUrls);
    },
    getPageUrls(event = {}) {
      const { publish_key } = event;
      const { curBiz, eventKey } = this;
      const getEnvUrl = (env, isSea = false) => getPageHref({
        env, isSea, curBiz, publishKey: publish_key, type: this.curType, eventKey
      });
      return {
        test: getEnvUrl('test', !this.isCn),
        pre: getEnvUrl('pre', !this.isCn),
        prod: getEnvUrl('prod', !this.isCn),
      };
    },

    async getPageQrcodes(pageUrls) {
      const opts = {
        margin: 1
      };
      const res = await Promise.all([
        QRCode.toDataURL(pageUrls.test, opts),
        QRCode.toDataURL(pageUrls.pre, opts),
        QRCode.toDataURL(pageUrls.prod, opts),
      ]);
      this.pageQrcode = {
        test: res[0],
        pre: res[1],
        prod: res[2],
      };
    },

    handleCopy() {
      this.$message.success('复制成功');
    },

    onClosed() {
      this.$emit('resolve');
    },
  },
};
</script>

<style lang="scss" scoped>
.page-url {
  .addr-filter {
    display: flex;
    margin-bottom: 30px;
  }

  .type-selector,
  .biz-selector {
    display: flex;
    align-items: center;
  }

  .type-selector {
    margin-left: 10px;
  }

  &__list {
    display: flex;
    justify-content: space-between;

    li {
    }

    &-qrcode {
      width: 165px;
      height: 165px;
      margin: 5px 0;

      img {
        display: block;
        width: 100%;
        margin: 0 auto;
      }
    }

    .el-tag {
      margin: 0 auto;
      display: block;
    }
  }
}
</style>
