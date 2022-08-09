<template>
  <div>
    <Fade :value="value" @updateStyles="e=>{$emit('updateStyles',e)}" />
    <Slide :value="value" @updateStyles="e=>{$emit('updateStyles',e)}" />
  </div>
</template>

<script>
import Fade from './fade.vue';
import Slide from './slide.vue';

export default {
  components: {
    Fade,
    Slide
  },
  props: {
    value: {
      type: Object,
      required: true,
      default() {
        return {};
      }
    }
  },
  data() {
    return {};
  },
};
</script>
