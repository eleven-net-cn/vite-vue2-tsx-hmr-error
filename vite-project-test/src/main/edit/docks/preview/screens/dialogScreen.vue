<template>
  <PuzzleScreen
    class="fullpage-container" :name="node.alias" :root-node-id="id"
    :button-list="buttonList"
  >
    <EditMode :root-node-id="id" :nodes="[node]" />
  </PuzzleScreen>
</template>

<script>
import {
  mapState, mapMutations, mapActions
} from 'vuex';
import constants from '@/constants/';
import EditMode from '../editMode';
import PuzzleScreen from '../screen';

export default {
  components: {
    PuzzleScreen,
    EditMode
  },
  provide() {
    return {
      screenCategory: constants.screenCategory.DIALOG
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
  data() {
    return {
      category: 'dialog',
      // 记录当前id
      id: this.node.id,
      lockedNum: 0
    };
  },
  computed: {
    ...mapState([
      'baseInfo',
      'nodesEditOptions',
      'screenList'
    ]),
    preLockNum() {
      return this.screenList[0]?.locked || 0;
    },
    buttonList() {
      return [
        {
          text: this.nodesEditOptions[this.id]?.$initVisible ? '关闭预览' : '在主界面预览',
          handler: () => {
            const newInitVisible = !this.nodesEditOptions[this.id]?.$initVisible;
            this.updateNodesEditOptionsTemporary({
              id: this.id,
              options: {
                $initVisible: newInitVisible,
              }
            });
            if (newInitVisible) {
              this.lockedNum += 1;
              this.updateScreen({
                index: 0,
                options: {
                  locked: this.preLockNum + 1
                }
              });
            } else {
              this.lockedNum -= 1;
              this.updateScreen({
                index: 0,
                options: {
                  locked: this.preLockNum - 1
                }
              });
            }
          }
        }
      ];
    }
  },
  beforeDestroy() {
    this.updateNodeInNewScreen({
      type: 'remove',
      id: this.id
    });
    // 元素销毁（节点被移除等时候）关闭该id的预览设置
    this.updateNodesEditOptionsTemporary({
      id: this.id,
      options: {
        $initVisible: false,
      }
    });
    this.updateScreen({
      index: 0,
      options: {
        locked: this.preLockNum - this.lockedNum
      }
    });
  },
  methods: {
    ...mapMutations(['updateNodesEditOptionsTemporary', 'updateScreen']),
    ...mapActions(['updateNodeInNewScreen'])
  },
};
</script>
