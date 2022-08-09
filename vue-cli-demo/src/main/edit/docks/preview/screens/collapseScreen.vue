<template>
  <PuzzleScreen
    class="fullpage-container" :name="curContentNode.alias"
    :root-node-id="curContentNode.id"
    :close-id="collapseNode.id"
    :button-list="buttonList"
  >
    <!-- 用于居中 -->
    <div class="flex-screen">
      <!-- 用于模拟title容器 -->
      <div class="collapse-container" :class="{disabled}" :style="{...collapseNode.boxStyle,...outerStyle}">
        <div class="collapse-title-container" :style="titleStyle">
          <rndNode
            :key="curTitleNode.id"
            :root-node-id="node.id"
            :config="curTitleNode"
          ></rndNode>
        </div>
        <div class="collapse-container-container" :style="contentStyle">
          <rndNode
            :key="curContentNode.id"
            :root-node-id="node.id"
            :config="curContentNode"
          ></rndNode>
        </div>
      </div>
    </div>
    <template #right="{margin}">
      <draggable
        v-model="brother"
        class="collapse-item-container"
        :animation="200"
      >
        <div
          v-for="(item,index) in brother" :key="index" class="collapse-item"
          :class="[{active:swiperIndex === index}]"
          :style="{height:`${margin*2}px`,width:`${margin}px`,marginBottom:`${margin/4}px`,fontSize:`${margin/2}px`}"
          @click.stop
          @mousedown="selectCollapse(index)"
        >
          {{ index+1 }}
        </div>
      </draggable>
    </template>
  </PuzzleScreen>
</template>

<script>
import {
  mapState, mapMutations, mapActions, mapGetters
} from 'vuex';
import constants from '@/constants/';
import { positionStyle } from '@/constants/style';
import RndNode from '@/components/rndNode';
import * as utils from '@/utils';
import PuzzleScreen from '../screen';

export default {
  components: {
    PuzzleScreen,
    RndNode
  },
  provide() {
    return {
      screenCategory: constants.screenCategory.COLLAPSE
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
    const _positionStyle = {};
    Object.keys(positionStyle).forEach(key => {
      _positionStyle[key] = undefined;
    });
    return {
      resetPositionStyle: _positionStyle,
      swiperIndex: 0,
      // 外容器样式，高度都是自定义的，只要设定宽度就行
      outerStyle: {
        width: 0
      }
    };
  },
  computed: {
    ...mapState([
      'baseInfo',
      'nodesEditOptions',
      'screenList',
      'canvasTransformData'
    ]),
    ...mapGetters(['mapProNodes', 'activeNodeProInPage']),
    collapseNode() {
      return {
        ...this.node,
        boxStyle: {
          ...this.node.boxStyle,
          position: 'relative',
          ...this.resetPositionStyle,
        }
      };
    },
    brother: {
      get() {
        const validItems = [];
        for (let i = 0; i < this.collapseNode.children.length; i += 2) {
          const title = this.collapseNode.children[i];
          const content = this.collapseNode.children[i + 1];
          validItems.push({
            title,
            content,
          });
        }
        return validItems;
      },
      set(newVal) {
        const preNodeId = this.curTitleNode.id;
        this.updateNodeConfig({
          node: this.node,
          options: {
            children: newVal.map(item => [item.title, item.content]).flat()
          }
        });
        const newIndex = this.mapProNodes[preNodeId]?.index;
        if (newIndex !== -1) {
          this.checkoutSwiper(newIndex / 2);
        }
      }
    },
    // 拿到所有有效的节点
    validChildren() {
      return this.brother.filter((item) => !this.checkItemDisabled(item));
    },
    curTitleNode() {
      return this.brother[this.swiperIndex].title || {};
    },
    curContentNode() {
      return this.brother[this.swiperIndex].content || {};
    },
    titleStyle() {
      const style = { height: `${this.node.options.titleHeight / 100}rem`, marginBottom: `${this.node.options.titleMargin / 100}rem` };
      const proNode = this.mapProNodes[this.node.id];
      if (proNode.editOptions.showEditOptions) {
        style.backgroundColor = proNode.declarations.defaultEditOptions?.editTitleColor;
      }
      return style;
    },
    contentStyle() {
      const style = {};
      const proNode = this.mapProNodes[this.node.id];
      if (proNode.editOptions.showEditOptions) {
        style.backgroundColor = proNode.declarations.defaultEditOptions?.editContentColor;
      }
      return style;
    },
    // 判断当前item无效
    disabled() {
      return this.checkItemDisabled({
        title: this.curTitleNode,
        content: this.curContentNode
      });
    },
    buttonList() {
      return [
        {
          text: '删除该页',
          handler: async () => {
            if (this.brother.length <= 1) return;
            let newIndex;
            if (this.swiperIndex === this.brother.length - 1) {
              newIndex = this.swiperIndex - 1;
            } else {
              newIndex = this.swiperIndex;
            }
            const { curTitleNode, curContentNode } = this;
            this.removeNode({ id: curTitleNode.id });
            this.removeNode({ id: curContentNode.id });
            this.checkoutSwiper(newIndex);
          }
        },
        {
          text: '复制该页',
          handler: async () => {
            const { curTitleNode, curContentNode } = this;
            this.copyNode({ node: curTitleNode, indexOffset: 1 });
            this.copyNode({ node: curContentNode, indexOffset: 2 });
            this.checkoutSwiper(this.swiperIndex + 1);
          }
        },
        {
          text: '添加页',
          handler: async () => {
            await this.addCollapseRootNode(this.collapseNode.id);
            this.checkoutSwiper(this.brother.length - 1);
          }
        },
      ];
    }
  },
  watch: {
    'collapseNode.boxStyle': {
      handler(boxStyle, preVal) {
        if (preVal && (boxStyle.width === preVal.width && boxStyle.height === preVal.height)) return;
        this.resetOuterStyle(boxStyle);
      },
      immediate: true
    },
  },
  beforeDestroy() {
    this.removeScreen();
  },
  methods: {
    ...mapActions(['removeNode', 'addCollapseRootNode', 'updateNodeConfig', 'updateNodeInNewScreen', 'copyNode']),
    ...mapMutations(['updateNodesEditOptionsTemporary']),
    removeScreen() {
      this.updateNodeInNewScreen({
        type: 'remove',
        id: this.node.id
      });
    },
    resetOuterStyle(boxStyle) {
      this.outerStyle.width = boxStyle.width;
      requestAnimationFrame(() => {
        if (this.activeNodeProInPage.id === this.collapseNode.id) {
          const el = this.activeNodeProInPage?.activeEl;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          this.outerStyle.width = utils.px2rem(rect.width / this.canvasTransformData.scale);
        }
      });
    },
    checkItemDisabled(item) {
      return this.checkNodeDisabled(item.title) || this.checkNodeDisabled(item.content);
    },
    checkNodeDisabled(node) {
      return node.disabled || !node.enabled;
    },
    findValidIndex(index) {
      let curIndex = index;
      for (let i = 0; i < this.brother.length; i++) {
        const item = this.brother[curIndex];
        if (!this.checkItemDisabled(item)) {
          break;
        }
        curIndex = index + 1;
        if (curIndex >= this.brother.length) {
          curIndex = 0;
        }
      }
      const realIndex = this.validChildren.indexOf(this.brother[curIndex]);
      return realIndex === -1 ? 0 : realIndex;
    },
    selectCollapse(index) {
      setTimeout(() => {
        this.checkoutSwiper(index);
      }, 0);
    },
    checkoutSwiper(index) {
      if (index === this.swiperIndex) return;
      this.swiperIndex = index;
      this.updateNodesEditOptionsTemporary({
        id: this.collapseNode.id,
        options: {
          $initialSlide: this.findValidIndex(index) + 1,
        }
      });
    }
  },
};
</script>
<style lang="scss" scoped>
.fullpage-container {
  .flex-screen {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: scroll;
    .collapse-container {
      pointer-events: auto;
      margin: auto;
      cursor: pointer;
      &.disabled::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        background-color: rgba($color: #000000, $alpha: 0.4);
        pointer-events: none;
      }
      .collapse-title-container {
        position: relative;
      }
    }
  }
  .collapse-item-container {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    .collapse-item {
      pointer-events: auto;
      flex: none;
      background-color: #d4dfec;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &.active {
        background-color: #409eff;
      }
      &:hover {
        background-color: #409eff;
      }
    }
  }
}
</style>
