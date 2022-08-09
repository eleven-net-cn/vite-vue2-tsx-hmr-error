<template>
  <div class="pc-preview-fullscreen">
    <img :src="require('@images/close.png')" class="close-btn" @click="$emit('close')">
    <PreviewIframe bridge-name="preview-fullScreen" :fullscreen="true" @onLoad="onLoad"></PreviewIframe>
    <img v-if="!iframeLoaded" :src="require('@images/loading.png')" class="loading">
  </div>
</template>

<script>
import PreviewIframe from '../previewIframe';

export default {
  components: {
    PreviewIframe
  },
  data() {
    return {
      iframeLoaded: false
    };
  },
  methods: {
    onLoad() {
      this.iframeLoaded = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.pc-preview-fullscreen {
  position: absolute;
  width: 100vw;
  height: 100vh;
  .close-btn {
    position: absolute;
    right: 20px;
    top: 20px;
    width: 50px;
    height: 50px;
    cursor: pointer;
  }
  @keyframes loadingcomponentrotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .loading {
    height: 120px;
    width: 120px;
    position: absolute;
    left: calc(50% - 60px);
    top: calc(50% - 60px);
    animation: loadingcomponentrotate 1s linear infinite;
  }
}
</style>
