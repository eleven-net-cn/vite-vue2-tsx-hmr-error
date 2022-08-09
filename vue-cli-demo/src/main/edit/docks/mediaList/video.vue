<template>
  <component
    :is="videoPlayer"
    v-if="src"
    :autoplay="autoplay"
    :controls="controls"
    :muted="muted||undefined"
    :loop="true"
    :src="src"
    :is-blob="isBlob"
  />
</template>

<script>
import NativeVideo from './nativeVideo.vue';
import TsVideo from './tsVideo.vue';

export default {
  props: {
    src: {
      type: String
    },
    type: {
      type: String,
      default: 'normal'
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    controls: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: true
    },
    isBlob: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    videoPlayer() {
      return this.type === 'ts' ? TsVideo : NativeVideo;
    }
  }
};
</script>
