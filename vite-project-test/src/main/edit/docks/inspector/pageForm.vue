<template>
  <div>
    <el-form
      ref="pageForm"
      :model="baseInfo"
      size="mini"
      label-position="left"
      label-width="90px"
      @submit.native.prevent
    >
      <el-divider content-position="left">
        <el-tooltip content="页面级配置，平台统一" placement="top">
          <span>页面基础配置 <i class="el-icon-info" /></span>
        </el-tooltip>
      </el-divider>
      <el-form-item label="页面标题">
        <el-input v-model="baseInfo.head.title" placeholder="页面标题"></el-input>
      </el-form-item>
      <el-form-item v-if="!isPageCompType">
        <el-tooltip slot="label" content="设计稿的宽度" placement="top">
          <span>设计宽度 <i class="el-icon-info" /></span>
        </el-tooltip>
        <el-input-number v-model="platMsg.body.width" size="small">
        </el-input-number>
        <span> px</span>
      </el-form-item>
      <el-form-item v-if="!isPageCompType">
        <el-tooltip slot="label" content="设计稿的高度" placement="top">
          <span>设计高度 <i class="el-icon-info" /></span>
        </el-tooltip>
        <el-input-number v-model="platMsg.body.height" size="small"></el-input-number>
        <span> px</span>
      </el-form-item>
      <template v-if="!platMsg.body.fullScreen&&platform === 'pc'">
        <el-form-item>
          <el-tooltip slot="label" content="小于此宽度时左右裁剪" placement="top">
            <span>最小宽度 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-input-number v-model="minWidth" size="small"></el-input-number>
          <span> px</span>
        </el-form-item>
        <el-form-item>
          <el-tooltip slot="label" content="大于此宽度时两侧留白" placement="top">
            <span>最大宽度 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-input-number v-model="platMsg.body.maxWidth" size="small"></el-input-number>
          <span> px</span>
        </el-form-item>
      </template>
      <el-form-item v-if="platMsg.body.fullScreen === 'colClip'">
        <el-tooltip slot="label" content="屏幕小于此高度左右留白" placement="top">
          <span>最小高度 <i class="el-icon-info" /></span>
        </el-tooltip>
        <el-input-number v-model="h5MinHeight" size="small"></el-input-number>
        <span> px</span>
      </el-form-item>
      <template v-if="platMsg.body.fullScreen === 'rawClip'">
        <el-form-item v-if="platform === 'pc'" label="布局填充">
          <el-switch v-model="pcCover">
          </el-switch>
        </el-form-item>
        <el-form-item v-if="!pcCover">
          <el-tooltip
            slot="label" content="屏幕小于此宽度左右裁剪"
            placement="top"
          >
            <span>最小宽度 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-input-number v-model="h5MinWidth" size="small"></el-input-number>
          <span> px</span>
        </el-form-item>
        <el-form-item v-if="platform === 'pc'">
          <el-tooltip
            slot="label" content="屏幕小于此宽度左右滚动"
            placement="top"
          >
            <span>最小宽度滚动 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-input-number v-model="minScrollRatio" size="small"></el-input-number>
          <span> px</span>
        </el-form-item>
        <el-form-item v-if="platform === 'pc'">
          <el-tooltip
            slot="label" content="屏幕小于此高度上下滚动"
            placement="top"
          >
            <span>最小高度滚动 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-input-number v-model="maxScrollRatio" size="small"></el-input-number>
          <span> px</span>
        </el-form-item>
      </template>

      <el-form-item v-if="platform === 'pc'" label="最小长度滚动">
        <el-input-number v-model="minScrollWidth" size="small"></el-input-number>
        <span> px</span>
      </el-form-item>
      <el-form-item v-if="platMsg.body.fullScreen === 'colClip'" label="页面对齐">
        <el-select v-model="clipType" size="mini" placeholder="请选择页面对齐类型">
          <el-option
            v-for="item in pageAlignMap" :key="item.label" :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="platMsg.body.fullScreen&&!pcCover" label="取消容器约束">
        <el-switch v-model="fixToBody">
        </el-switch>
      </el-form-item>

      <template v-if="hasCnBiz">
        <el-divider content-position="left">
          seo配置
        </el-divider>
        <el-form-item label="描述">
          <el-input v-model="baseInfo.head.desc" placeholder="页面描述"></el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="baseInfo.head.keywords" placeholder="页面关键词"></el-input>
        </el-form-item>
        <el-divider content-position="left">
          分享配置
        </el-divider>
        <el-form-item>
          <el-tooltip slot="label" content="设置微信、QQ、米游社APP内的分享" placement="top">
            <span>开启分享 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-switch v-model="baseInfo.share.enable"></el-switch>
        </el-form-item>
        <div v-if="baseInfo.share.enable">
          <el-form-item label="分享标题">
            <el-input v-model="baseInfo.share.title" placeholder="分享标题"></el-input>
          </el-form-item>
          <el-form-item label="分享描述">
            <el-input v-model="baseInfo.share.desc" placeholder="分享描述"></el-input>
          </el-form-item>
          <el-form-item label="分享缩略图">
            <puzzle-upload
              v-model="baseInfo.share.img"
              accept=".png,.jpeg,.jpg,.gif"
            >
            </puzzle-upload>
          </el-form-item>
        </div>
      </template>
      <template v-if="hasSeaBiz">
        <el-divider content-position="left">
          seo配置(海外)
        </el-divider>
        <el-form-item label="描述">
          <el-input v-model="baseInfo.seaHead.desc" placeholder="页面描述"></el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="baseInfo.seaHead.keywords" placeholder="页面关键词"></el-input>
        </el-form-item>
        <el-form-item label="分享标题">
          <el-input v-model="baseInfo.seaHead.shareTitle" placeholder="分享标题"></el-input>
        </el-form-item>
        <el-form-item label="分享描述">
          <el-input v-model="baseInfo.seaHead.shareDesc" placeholder="分享描述"></el-input>
        </el-form-item>
        <el-form-item label="分享图片">
          <puzzle-upload
            v-model="baseInfo.seaHead.shareImage"
            accept=".png,.jpeg,.jpg"
          >
          </puzzle-upload>
        </el-form-item>
      </template>
      <el-divider content-position="left">
        统计配置
      </el-divider>
      <el-form-item label="cnzz siteId">
        <el-input v-model="baseInfo.cnzzSiteId" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="mia appId">
        <el-input v-model="baseInfo.miaAppId" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="ga appId">
        <el-input v-model="baseInfo.gaId" placeholder=""></el-input>
      </el-form-item>
      <!-- 背景图表单区域 -->
      <pz-background-form
        :value="platMsg.body" @update-mutil="handleUpdateMutilBg"
        @update-single="handleUpdateSingleBg"
      ></pz-background-form>
      <template v-if="baseInfo.cookieTip !== undefined&&hasSeaBiz">
        <el-divider content-position="left">
          海外cookie提示
        </el-divider>
        <el-form-item>
          <el-tooltip slot="label" content="海外cookie提示" placement="top">
            <span>开启提示 <i class="el-icon-info" /></span>
          </el-tooltip>
          <el-switch v-model="cookieTip"></el-switch>
        </el-form-item>
      </template>
      <el-divider content-position="left">
        横竖屏提示
      </el-divider>
      <el-form-item label="是否开启">
        <el-switch v-model="landscapeTip"></el-switch>
      </el-form-item>
      <el-collapse>
        <el-collapse-item title="高级选项">
          <el-divider content-position="left">
            <el-tooltip content="平台独立配置" placement="top">
              <span>平台配置 <i class="el-icon-info" /></span>
            </el-tooltip>
          </el-divider>
          <el-form-item>
            <el-tooltip slot="label" content="激活本平台" placement="top">
              <span>激活 <i class="el-icon-info" /></span>
            </el-tooltip>
            <el-switch v-model="platMsg.enable"></el-switch>
          </el-form-item>
          <el-form-item>
            <el-tooltip slot="label" content="开启图片默认上传压缩" placement="top">
              <span>图片压缩 <i class="el-icon-info" /></span>
            </el-tooltip>
            <el-switch v-model="uploadImgDefaultCompress">
            </el-switch>
          </el-form-item>
          <el-form-item>
            <el-tooltip slot="label" content="双端互跳链接（为空时不跳转）" placement="top">
              <span>{{ isPC ? 'm端地址' : 'pc端地址' }} <i class="el-icon-info" /></span>
            </el-tooltip>
            <el-input v-model="platMsg.jumpUrl"></el-input>
          </el-form-item>
          <el-form-item label="关闭游戏内音乐">
            <el-switch :value="!baseInfo.hasGameBgm" @input="(val)=>{baseInfo.hasGameBgm = !val}">
            </el-switch>
          </el-form-item>
          <el-form-item label="使用服务器时间">
            <el-switch :value="baseInfo.useSeverTime" @input="(val)=>{baseInfo.useSeverTime = val}">
            </el-switch>
          </el-form-item>
          <el-form-item v-mihoyo-auth="{authKey: 'module'}">
            <el-tooltip slot="label" content="渲染模板版本" placement="top">
              <span>buildVer <i class="el-icon-info" /></span>
            </el-tooltip>
            <el-input v-model="baseInfo.buildVer"></el-input>
          </el-form-item>
          <!-- <el-divider content-position="left">
            插入脚本
          </el-divider>
          <el-form-item label="开启脚本">
            <el-switch v-model="baseInfo.script.enable"></el-switch>
          </el-form-item>
          <el-form-item
            v-for="(src, index) in baseInfo.script.srcs"
            :key="index"
            :label="`脚本${index + 1}链接`"
          >
            <el-input
              v-model="baseInfo.script.srcs[index]"
            >
            </el-input>
            <i class="el-icon-delete" @click="deleteScript(index)"></i>
          </el-form-item>
          <el-button size="mini" @click="addScript">
            添加脚本
          </el-button> -->
          <!-- <el-divider content-position="left">
            publicPath
          </el-divider>
          <el-form-item label="构建启用publicPath">
            <el-switch v-model="baseInfo.publicPath"></el-switch>
          </el-form-item> -->
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { setGlobalCompress } from '@puzzle-admin/upload';

export default {
  data() {
    return {
      pageAlignMap: [
        { label: '居上对齐', value: 'bottom' }, { label: '居中对齐', value: 'center' }, { label: '局下对齐', value: 'top' }
      ]
    };
  },
  computed: {
    ...mapState([
      'baseInfo',
      'platform',
      'platMsg'
    ]),
    ...mapGetters([
      'hasCnBiz',
      'hasSeaBiz',
      'isPageCompType'
    ]),
    h5MinHeight: {
      get() {
        if (this.platMsg.body.maxRatio === false) {
          return 0;
        }
        return this.platMsg.body.width / this.platMsg.body.maxRatio;
      },
      set(val) {
        if (val === 0) {
          this.platMsg.body.maxRatio = false;
          return;
        }
        this.platMsg.body.maxRatio = this.platMsg.body.width / val;
      },
    },
    h5MinWidth: {
      get() {
        return this.platMsg.body.height * this.platMsg.body.minRatio;
      },
      set(val) {
        this.platMsg.body.minRatio = val / this.platMsg.body.height;
      },
    },
    minScrollRatio: {
      get() {
        const ratio = this.platMsg.body.minScrollRatio;
        return ratio ? this.platMsg.body.height * ratio : undefined;
      },
      set(val) {
        if (val < 0) return;
        this.$set(this.platMsg.body, 'minScrollRatio', val ? val / this.platMsg.body.height : undefined);
      },
    },
    maxScrollRatio: {
      get() {
        const ratio = this.platMsg.body.maxScrollRatio;
        return ratio ? this.platMsg.body.width / ratio : undefined;
      },
      set(val) {
        if (val < 0) return;
        this.$set(this.platMsg.body, 'maxScrollRatio', val ? this.platMsg.body.width / val : undefined);
      },
    },
    uploadImgDefaultCompress: {
      get() {
        return this.baseInfo.uploadCompress;
      },
      set(newVal) {
        this.baseInfo.uploadCompress = newVal;
        setGlobalCompress(newVal);
      }
    },
    minWidth: {
      get() {
        return this.platMsg.body.minWidth;
      },
      set(val) {
        if (val) {
          this.$set(this.platMsg.body, 'minWidth', val);
        } else {
          this.$set(this.platMsg.body, 'minWidth', undefined);
        }
      }
    },
    pcCover: {
      get() {
        return this.platMsg.body.pcCover;
      },
      set(val) {
        if (val) {
          this.$set(this.platMsg.body, 'minWidth', undefined);
          this.$set(this.platMsg.body, 'minScrollWidth', undefined);
          this.$set(this.platMsg.body, 'fixToBody', true);
        } else {
          this.$set(this.platMsg.body, 'fixToBody', false);
        }
        this.$set(this.platMsg.body, 'pcCover', val);
      }
    },
    cookieTip: {
      get() {
        const { cookieTip } = this.baseInfo;
        return typeof cookieTip === 'boolean' ? cookieTip : Boolean(cookieTip?.enable);
      },
      set(newVal) {
        if (typeof this.baseInfo.cookieTip === 'boolean') {
          this.baseInfo.cookieTip = newVal;
          return;
        }
        if (!this.baseInfo.cookieTip) return;

        this.baseInfo.cookieTip.enable = newVal;
      }
    },
    fixToBody: {
      get() {
        // 默认为undefined是有容器约束的
        return this.platMsg.body.fixToBody;
      },
      set(val) {
        this.$set(this.platMsg.body, 'fixToBody', val);
      }
    },
    clipType: {
      get() {
        return this.platMsg.body.clipType || 'center';
      },
      set(val) {
        this.$set(this.platMsg.body, 'clipType', val);
      }
    },
    minScrollWidth: {
      get() {
        return this.platMsg.body.minScrollWidth;
      },
      set(val) {
        if (val) {
          this.$set(this.platMsg.body, 'minScrollWidth', val);
        } else {
          this.$set(this.platMsg.body, 'minScrollWidth', undefined);
        }
      }
    },
    isPC() {
      return this.platform === 'pc';
    },
    landscapeTip: {
      get() {
        return this.baseInfo.landscapeTip;
      },
      set(val) {
        this.baseInfo.landscapeTip = val;
      }
    }
  },
  methods: {
    addScript() {
      if (this.baseInfo.script?.srcs) {
        this.baseInfo.script.srcs.push('');
      } else {
        this.baseInfo.script.srcs = [''];
      }
    },
    deleteScript(index) {
      this.baseInfo.script.srcs.splice(index, 1);
    },
    // !更新公共背景图表单（单图）传入的数据到 platMsg
    handleUpdateSingleBg(key, val) {
      this.$set(this.platMsg.body, key, val);
    },
    // !更新公共背景图表单（多图）传入的数据到 platMsg
    handleUpdateMutilBg(val) {
      this.$set(this.platMsg.body, 'backgroundListConfig', val);
    }
  }
};
</script>

<style lang="scss" scoped>
.el-icon-delete {
  position: absolute;
  right: -20px;
  top: 8px;
  cursor: pointer;
}
</style>
