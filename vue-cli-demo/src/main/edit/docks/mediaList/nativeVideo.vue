<template>
  <video
    ref="player"
    class="video-normal"
    :controls="params.controls"
    playsinline
    webkit-playsinline
    x5-playsinline
    x-webkit-airplay="allow"
    x5-video-orientation="portraint"
    x5-video-player-type="h5"
    x5-video-player-fullscreen="true"
    :muted="muted"
    :autoplay="params.autoplay"
    autobuffer
    :loop="params.loop"
    :src="src"
    @play="$emit('play')"
    @pause="$emit('pause')"
    @ended="$emit('ended')"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    src: {
      type: String
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    controls: {
      type: Boolean,
      default: true
    },
    // 循环播放
    loop: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean
    }
  },
  computed: {
    params() {
      return {
        autoplay: this.autoplay ? 'autoplay' : undefined,
        controls: this.controls ? 'controls' : undefined,
        loop: this.loop ? 'loop' : undefined
      };
    },
  },
  mounted() {
    setTimeout(() => {
      if (this.autoplay) {
        this.$refs.player?.play();
      }
    }, 0);
  },
  methods: {
    play() {
      this.$refs.player?.play();
    },
    pause() {
      this.$refs.player?.pause();
    }
  }
};
</script>

<style lang="scss" scoped>
.video-normal {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
