<template>
  <div class="media-box">
    <div v-if="type === RES_TYPE.IMAGE" class="media-box-container">
      <el-image
        class="media-box-main"
        :src="src"
        fit="contain"
        :preview-src-list="[src]"
      />
    </div>
    <div v-else-if="type === RES_TYPE.VIDEO" class="media-box-container" @click="openVideoDialog">
      <VideoPreview
        v-if="isBlob"
        key="1"
        class="media-box-main"
        :autoplay="true"
        :is-blob="true"
        :loop="true"
        :type="extension === 'ts'?'ts':'normal'"
        :src="src"
      />
      <VideoPreview
        v-else-if="extension === 'ts'"
        key="2"
        class="media-box-main"
        :type="extension === 'ts'?'ts':'normal'"
        :src="src"
      />
      <img v-else class="media-box-main" :src="src+'?x-oss-process=video/snapshot,t_70000,f_jpg,m_fast'">

      <MihoyoModal v-model="showVideoDialog" mask-close :z-index="3000">
        <VideoPreview
          class="video-preview-dialog"
          :type="extension === 'ts'?'ts':'normal'"
          :loop="true"
          :controls="true"
          :autoplay="true"
          :src="src"
          :muted="false"
        />
      </MihoyoModal>
    </div>
    <div v-else-if="type === RES_TYPE.AUDIO" class="media-box-container">
      <PzAudio
        v-if="needPreview"
        class="media-box-main media-audio"
        :src-list="[src]"
      />
      <img v-else class="media-box-main media-audio" src="https://webstatic-test.mihoyo.com/upload/static-resource/2022/01/26/7678c85edc25a91bc608a58875eed57b_1397279149244889359.jpeg">
    </div>
    <div v-else class="media-box-container">
      <i class="media-box-main el-icon-files"></i>
    </div>
    <div v-if="previewIcon" class="media-box-main-show">
      <i :class="previewIcon"></i>
    </div>
  </div>
</template>

<script>
import { RES_TYPE } from '@/constants/resource';
import VideoPreview from './video.vue';
import PzAudio from './audio.vue';

export default {
  components: {
    VideoPreview,
    PzAudio
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    src: {
      type: String,
      default: ''
    },
    needPreview: {
      type: Boolean,
      default: true
    },
    extension: {
      type: String
    },
    isBlob: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      RES_TYPE,
      showVideoDialog: false
    };
  },
  computed: {
    previewIcon() {
      if (!this.needPreview) {
        return '';
      }
      if (this.type === RES_TYPE.IMAGE) {
        return 'el-icon-zoom-in';
      }
      if ([RES_TYPE.VIDEO, RES_TYPE.AUDIO].includes(this.type)) {
        return 'el-icon-video-play';
      }
      return '';
    },
    showPreviewIcon() {
      return this.needPreview && [RES_TYPE.IMAGE, RES_TYPE.VIDEO].includes(this.type);
    }
  },
  methods: {
    openVideoDialog() {
      if (!this.needPreview) return;
      this.showVideoDialog = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.media-box {
  position: relative;
  height: 100px;
  width: 150px;
  border: 2px solid #ccc;
  border-radius: 2px;
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==")
    0 0/5px 5px;
  .media-box-container {
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 100%;
    .media-box-main {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
      &.media-audio {
        width: 100px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      &.el-icon-files {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 50px;
        font-weight: bold;
        color: #409eff;
        cursor: default;
      }
    }
  }
}
.media-box-main-show {
  pointer-events: none;
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($color: #000000, $alpha: 0.1);
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}
.media-box:hover {
  .media-box-main-show {
    display: flex;
    i {
      font-size: 40px;
      color: white;
    }
  }
}
.video-preview-dialog {
  position: relative !important;
  width: 1000px;
  height: 562px;
}
</style>
