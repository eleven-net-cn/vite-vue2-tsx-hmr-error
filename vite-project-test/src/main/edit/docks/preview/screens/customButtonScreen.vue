<template>
  <PuzzleScreen
    class="custon-button-container" :name="curNode.alias"
    :root-node-id="curNode.id"
    :close-id="node.id"
  >
    <div class="flex-screen">
      <rndNode
        :root-node-id="node.id"
        :config="curNode"
      ></rndNode>
    </div>
  </PuzzleScreen>
</template>

<script>
import {
  mapActions
} from 'vuex';
import constants from '@/constants/';
import RndNode from '@/components/rndNode';
import PuzzleScreen from '../screen';

export default {
  components: {
    PuzzleScreen,
    RndNode
  },
  provide() {
    return {
      screenCategory: constants.screenCategory.CUSTOM_BUTTON
    };
  },
  props: {
    node: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    curNode() {
      return this.node.children[0];
    },
  },
  beforeDestroy() {
    this.removeScreen();
  },
  methods: {
    ...mapActions(['updateNodeInNewScreen']),
    removeScreen() {
      this.updateNodeInNewScreen({
        type: 'remove',
        id: this.node.id
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.custon-button-container {
  .flex-screen {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
}
</style>
