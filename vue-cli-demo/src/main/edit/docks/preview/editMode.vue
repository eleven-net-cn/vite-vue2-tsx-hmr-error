<template>
  <div
    class="edit-mode"
  >
    <rndNode
      v-for="(node, key) in nodes"
      :key="node.id"
      :custom-edit-options="customEditOptions"
      :root-node-id="rootNodeId"
      :config="nodes[key]"
    ></rndNode>
  </div>
</template>

<script>
import rndNode from '@/components/rndNode';

export default {
  components: {
    rndNode,
  },
  props: {
    nodes: {
      type: Array,
      default() {
        return [];
      }
    },
    customEditOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    rootNodeId: {
      type: String,
      default: ''
    }
  },
};
</script>
