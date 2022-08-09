<template>
  <div class="video-canvas">
    <canvas
      ref="video-canvas"
      class="video-canvas"
      @click="playCanvasVideo"
    ></canvas>
  </div>
</template>

<script>
import JSMpeg from 'mihoyo-threejs-jsmpeg';

export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    // 循环播放
    loop: {
      type: Boolean,
      default: false
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean
    },
    isBlob: {
      type: Boolean
    }
  },
  data() {
    return {
      showPoster: true
    };
  },
  mounted() {
    const canvas = this.$refs['video-canvas'];
    this.player = new JSMpeg.Player(this.src, {
      canvas,
      // 目前没有播放按钮，非编辑环境就直接自动播放
      autoplay: this.autoplay,
      loop: this.loop,
      audio: this.muted,
      pauseWhenHidden: false,
      progressive: !this.isBlob,
      disableWebAssembly: true,
      onSourceEstablished: () => {
        this.showPoster = false;
      },
      onEnded: () => {
        this.canvasEnded = true;
      },
      onPlay: () => {
        this.$emit('play');
      },
      onPause: () => {
        this.$emit('pause');
      }
    });
    this.player?.audioOut?.unlock();
  },
  beforeDestroy() {
    if (typeof this.player?.destroy === 'function') {
      this.pause();
      setTimeout(() => {
        this.player.destroy();
      }, 200);
    }
  },
  methods: {
    play() {
      this.player?.play();
    },
    pause() {
      this.player?.pause();
    },
    playCanvasVideo() {
      if (this.canvasEnded) {
        this.player.currentTime = 0;
        this.play();
        this.canvasEnded = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.video-canvas {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
