<template>
  <div v-if="declarations">
    <TimeStateItem v-if="declarations.formType === 'time'" :declarations="declarations" :link-msg="linkMsg" />
    <NormalStateItem v-else :declarations="declarations" :link-msg="linkMsg" />
  </div>
</template>

<script>
import NormalStateItem from './normalStateItem.vue';
import TimeStateItem from './timeStateItem';

export default {
  components: {
    NormalStateItem,
    TimeStateItem
  },
  props: {
    declarations: {
      type: Object,
    },
    linkMsg: {
      type: Object,
      default() {
        return {};
      }
    },
  },
};
</script>
