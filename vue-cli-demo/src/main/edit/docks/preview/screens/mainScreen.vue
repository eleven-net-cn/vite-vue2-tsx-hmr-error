<template>
  <PuzzleScreen
    v-if="editNodes"
    name="主界面" :index="0" class="main-screen"
    :root-node-id="rootNodeId"
    :button-list="buttonList"
    :is-main="true"
    :can-destory="false"
    :class="[{'fullpage-container': platMsg.body.fullScreen}]"
  >
    <EditMode
      v-if="!isPageCompType"
      :style="containerStyle"
      :root-node-id="rootNodeId"
      :nodes="editNodes"
    />
    <PreviewIframe
      v-if="modeType === 'preview'"
      ref="previewIframe"
      bridge-name="preview"
    />
  </PuzzleScreen>
</template>

<script>
import {
  mapState, mapGetters
} from 'vuex';
import { backgroundParse } from '@puzzle/utils';
import constants from '@/constants/';
import PuzzleScreen from '../screen';
import EditMode from '../editMode';
import PreviewIframe from '../previewIframe';

export default {
  components: {
    EditMode,
    PreviewIframe,
    PuzzleScreen,
  },
  provide() {
    return {
      screenCategory: constants.screenCategory.MAIN
    };
  },
  props: {
    activePage: {
      type: Object,
      default() {
        return undefined;
      }
    }
  },
  computed: {
    ...mapState([
      'modeType',
      'baseInfo',
      'platMsg',
      'nodes'
    ]),
    ...mapGetters(['viewport', 'isFullScreen', 'isPageCompType']),
    containerStyle() {
      const {
        backgroundImage,
        backgroundPosition,
        backgroundSize,
        custombackgroundSizeHeight,
        custombackgroundSizeWidth,
        backgroundRepeat,
        backgroundAttachment,
        backgroundClip,
        backgroundOrigin,
        backgroundListConfig = [],
        backgroundColor
      } = this.platMsg.body;

      const firstBg = {
        backgroundImage,
        backgroundPosition,
        backgroundSize,
        custombackgroundSizeHeight,
        custombackgroundSizeWidth,
        backgroundRepeat,
        backgroundAttachment,
        backgroundClip,
        backgroundOrigin
      };

      if (firstBg?.backgroundAttachment && backgroundAttachment === 'fixed') {
        firstBg.backgroundAttachment = 'scroll';
      }

      // 接入公共库处理函数
      return {
        background: backgroundParse([firstBg, ...backgroundListConfig], backgroundColor)
      };
    },
    buttonList() {
      return this.modeType === 'preview' ? [
        {
          text: '刷新预览页',
          handler: () => {
            this.$refs.previewIframe.refresh();
          }
        }
      ] : undefined;
    },
    editNodes() {
      if (!this.nodes) return [];
      if (this.isFullScreen) {
        // 展示的是当前fullpage元素
        return this.nodes.filter((node) => node.nodeCategory !== 'fullpageContainer' || (node.nodeCategory === 'fullpageContainer' && node === this.activePage));
      }
      return this.nodes;
    },
    rootNodeId() {
      return this.isFullScreen ? this.activePage?.id : '';
    },
  }
};
</script>
<style lang="scss" scoped>
.main-screen {
  .edit-mode {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scroll-behavior: smooth;
    z-index: 0;
  }
  .iframe-preview-container {
    position: absolute;
    left: 0;
    top: 0;
  }
  &.fullpage-container {
    .edit-mode {
      overflow: hidden;
    }
  }
  .dialog-container {
    overflow: hidden;
  }
}
</style>
