<template>
  <bg-audio
    ref="audio"
    class="puzzle-media-audio"
    v-bind="audioOptions"
    icon="https://webstatic.mihoyo.com/upload/static-resource/2021/07/08/5dee668caa553565cd98dcfbe77e9e0f_185283973080548871.png"
    active-icon="https://webstatic.mihoyo.com/upload/static-resource/2021/07/08/e5eb485f9503f46fb641e3c3c6edeefe_5572116030893804600.png"
    @played="onPlayed"
    @tap="handleTap"
  />
</template>

<script>
import { bgAudio } from '@me/audio';
import audioManager from './audioManager';

export default {
  name: 'PzAudio',
  components: {
    bgAudio
  },
  props: {
    srcList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      audioManage: undefined
    };
  },
  computed: {
    audioOptions() {
      return {
        cache: false,
        autoplay: false,
        loop: false,
        doPlay: false,
        src: this.srcList,
      };
    },
    audio() {
      return this.$refs.audio;
    },
  },
  created() {
    this.audioManage = audioManager.register({
      playState: false,
      pause: () => {
        this.pause();
      },
      play: () => {
        this.play();
      }
    });
  },
  beforeDestroy() {
    this.audioManage?.destroy();
  },
  methods: {
    handleTap(isplayed) {
      if (!isplayed) {
        this.play();
        return;
      }
      this.pause();
    },
    onPlayed(isplayed) {
      this.audioManage?.changeState(isplayed);
    },
    play() {
      this.audio?.play();
    },
    pause() {
      this.audio?.pause();
    }
  }
};
</script>

<style lang="scss" scoped>
.puzzle-media-audio {
  width: 100%;
  height: 100%;
  opacity: 0.9;
  cursor: pointer;
}
.puzzle-media-audio:hover {
  opacity: 1;
}
</style>
