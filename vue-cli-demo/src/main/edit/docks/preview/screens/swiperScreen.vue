<template>
  <PuzzleScreen
    class="fullpage-container" :name="curNode.alias"
    :root-node-id="curNode.id"
    :close-id="swiperNode.id"
    :button-list="buttonList"
  >
    <!-- 用于居中swiper -->
    <div class="flex-screen">
      <!-- 用于模拟swiper容器 -->
      <div class="swiper-container" :class="{disabled}" :style="{...swiperNode.boxStyle,...outerStyle,...customStyle}">
        <rndNode
          :key="curNode.id"
          :root-node-id="node.id"
          :config="curNode"
        ></rndNode>
      </div>
    </div>
    <template #right="{margin}">
      <draggable
        v-model="brother"
        class="swiper-item-container"
        :animation="200"
      >
        <div
          v-for="(item,index) in brother" :key="item.id" class="swiper-item"
          :class="[{active:swiperIndex === index}]"
          :style="{height:`${margin*2}px`,width:`${margin}px`,marginBottom:`${margin/4}px`,fontSize:`${margin/2}px`}"
          @click.stop
          @mousedown="selectSwiper(index)"
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
      screenCategory: constants.screenCategory.SWIPER
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
      category: 'swiper',
      resetPositionStyle: _positionStyle,
      swiperIndex: 0,
      outerStyle: {
        width: 0,
        height: 0
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
    swiperNode() {
      return {
        ...this.node,
        boxStyle: {
          ...this.node.boxStyle,
          position: 'relative',
          ...this.resetPositionStyle,
        }
      };
    },
    customStyle() {
      const customStyle = {};
      ['height', 'width'].forEach(key => {
        const customLength = this.node.options[key];
        if (customLength) {
          customStyle[key] = `${customLength / 100}rem`;
        }
      });
      return customStyle;
    },
    brother: {
      get() {
        return this.swiperNode.children;
      },
      set(newVal) {
        const preNodeId = this.curNode.id;
        this.updateNodeConfig({
          node: this.node,
          options: {
            children: [...newVal]
          }
        });
        const newIndex = this.mapProNodes[preNodeId]?.index;
        if (newIndex !== -1) {
          this.checkoutSwiper(newIndex);
        }
      }
    },
    // 拿到所有有效的节点
    validChildren() {
      return this.brother.filter((item) => !this.checkDisabled(item));
    },
    curNode() {
      return this.brother[this.swiperIndex] || {};
    },
    disabled() {
      return this.checkDisabled(this.curNode);
    },
    buttonList() {
      return [
        {
          text: '删除该页',
          handler: async () => {
            if (this.brother.length === 1) return;
            let newIndex;
            if (this.swiperIndex === this.brother.length - 1) {
              newIndex = this.swiperIndex - 1;
            } else {
              newIndex = this.swiperIndex;
            }
            this.removeNode({ id: this.curNode.id });
            this.checkoutSwiper(newIndex);
          }
        },
        {
          text: '复制该页',
          handler: async () => {
            this.copyNode({ node: this.curNode });
            this.checkoutSwiper(this.swiperIndex + 1);
          }
        },
        {
          text: '添加页',
          handler: async () => {
            await this.addSwiperRootNode(this.swiperNode.id);
            this.checkoutSwiper(this.swiperNode.children.length - 1);
          }
        }
      ];
    }
  },
  watch: {
    'swiperNode.boxStyle': {
      handler(boxStyle, preVal) {
        if (preVal && (boxStyle.width === preVal.width && boxStyle.height === preVal.height)) return;
        this.resetOuterStyle(boxStyle);
      },
      immediate: true
    },
    'swiperNode.options.slidesToShow': function () {
      this.resetOuterStyle(this.swiperNode.boxStyle);
    }
  },
  beforeDestroy() {
    this.removeScreen();
  },
  methods: {
    ...mapActions(['removeNode', 'updateActiveNodeId', 'addSwiperRootNode', 'updateNodeConfig', 'updateNodeInNewScreen', 'copyNode']),
    ...mapMutations(['updateNodesEditOptionsTemporary']),
    removeScreen() {
      this.updateNodeInNewScreen({
        type: 'remove',
        id: this.node.id
      });
    },
    resetOuterStyle(boxStyle) {
      ['width', 'height'].forEach((key) => {
        this.outerStyle[key] = boxStyle[key];
        requestAnimationFrame(() => {
          if (this.activeNodeProInPage.id === this.swiperNode.id) {
            const el = this.activeNodeProInPage?.activeEl;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const scale = key === 'height' ? 1 : (this.swiperNode.options.slidesToShow || 1);
            this.outerStyle[key] = utils.px2rem(rect[key] / this.canvasTransformData.scale / scale);
          }
        });
      });
    },
    checkDisabled(node) {
      return node.disabled || !node.enabled;
    },
    findValidIndex(index) {
      let curIndex = index;
      for (let i = 0; i < this.brother.length; i++) {
        const node = this.brother[curIndex];
        if (!this.checkDisabled(node)) {
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
    selectSwiper(index) {
      setTimeout(() => {
        this.checkoutSwiper(index);
        this.$nextTick(() => {
          this.updateActiveNodeId(this.curNode.id);
        });
      }, 0);
    },
    checkoutSwiper(index) {
      if (index === this.swiperIndex) return;
      this.swiperIndex = index;
      this.updateNodesEditOptionsTemporary({
        id: this.swiperNode.id,
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
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    .swiper-container {
      pointer-events: auto;
      background-color: #ccc;
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
    }
  }
  .swiper-item-container {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    .swiper-item {
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
