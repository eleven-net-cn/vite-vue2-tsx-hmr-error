<template>
  <div
    class="puzzle-screen" :class="[{'locked':screenMessage.locked,'during-drag':duringDrag}]" :style="viewportStyle"
    :rootnodeid="rootNodeId"
  >
    <div class="puzzle-screen-title" :style="{fontSize:normalFontSize}">
      {{ name||`屏幕${realIndex+1}` }}
    </div>
    <!-- 页面上下溢出区 -->
    <div
      class="puzzle-screen-overflow puzzle-screen-overflow-top" :style="overflowStyleTop" overflow-area
    >
      <slot name="top" :margin="margin/2"></slot>
      <el-button
        v-for="(val,i) in buttonList" :key="i" size="mini"
        :style="{fontSize:`${margin / 5 /(platform === 'h5'?1.2:1)}px`,padding:`${margin / 10 /(platform === 'h5'?2:1)}px`}"
        type="primary"
        @click.stop="val.handler"
      >
        {{ val.text }}
      </el-button>
      <i
        v-if="canDestory" class="el-icon-close close-icon"
        @click="destroyScreen"
      ></i>
    </div>
    <div
      class="puzzle-screen-overflow puzzle-screen-overflow-bottom" :style="overflowStyleBottom" overflow-area
    >
    </div>
    <!-- 页面左右溢出区 -->
    <div
      class="puzzle-screen-overflow puzzle-screen-overflow-left" :style="overflowStyleLeft" overflow-area
    >
    </div>
    <div
      class="puzzle-screen-overflow puzzle-screen-overflow-right" :style="overflowStyleRight" overflow-area
    >
      <slot name="right" :margin="margin/2"></slot>
    </div>
    <div class="puzzle-screen-title" :style="{fontSize:normalFontSize}">
    </div>
    <div class="viewport">
      <slot></slot>
    </div>
    <div v-if="platMsg.body.fullScreen&&!platMsg.body.pcCover" class="safe-area" :style="safeArea"></div>
    <!-- <div v-if="platMsg.body.pcCover" class="safe-area" :style="scrollSafeArea"></div> -->
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions
} from 'vuex';

export default {
  props: {
    index: {
      type: [Number, String],
      default: 'auto'
    },
    name: {
      type: [String],
      default: ''
    },
    rootNodeId: {
      type: String,
      default: ''
    },
    buttonList: {
      type: Array,
      default() {
        return [];
      }
    },
    isMain: {
      type: Boolean,
      default: false
    },
    // 窗口是否能被销毁
    canDestory: {
      type: Boolean,
      default: true
    },
    closeId: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      id: Symbol('当前屏幕实例的id'),
    };
  },
  computed: {
    ...mapState([
      'baseInfo',
      'screenList',
      'duringDrag',
      'platMsg',
      'platform'
    ]),
    ...mapGetters([
      'viewport',
      'pageCompNode'
    ]),
    normalFontSize() {
      return `${Math.min(this.viewport.width, this.viewport.height) * 0.05}px`;
    },
    margin() {
      return Math.min(this.viewport.width, this.viewport.height) * 0.2;
    },
    realIndex() {
      return this.screenList.findIndex(item => this.id === item.id);
    },
    screenMessage() {
      return this.screenList[this.realIndex];
    },
    viewportStyle() {
      const { width } = this.viewport;
      const { height } = this.viewport;

      const viewportStyle = {
        width: `${width}px`,
        height: `${height}px`,
      };
      if (!this.platMsg.body.fullScreen && !this.isMain && this.platMsg.body.height) {
        const _height = this.platform === 'h5' ? width / 750 * 1668 : 1080;
        // 竖向可以放几个
        const colNum = Math.max(Math.floor(height / (_height + this.margin)), 1);
        return {
          ...viewportStyle,
          height: `${_height}px`,
          left: `${Math.floor((this.realIndex + colNum - 1) / colNum) * (width + this.margin)}px`,
          top: `${(this.realIndex + colNum - 1) % colNum * (_height + this.margin)}px`,
        };
      }
      // 宽大于高时横向排布
      if (width < height) {
        return {
          ...viewportStyle,
          left: `${this.realIndex % 3 * (width + this.margin)}px`,
          top: `${Math.floor(this.realIndex / 3) * (height + this.margin)}px`
        };
      }
      return {
        ...viewportStyle,
        left: `${Math.floor(this.realIndex / 3) * (width + this.margin)}px`,
        top: `${this.realIndex % 3 * (height + this.margin)}px`
      };
    },
    overflowStyleTop() {
      return {
        height: `${this.margin / 2}px`,
        top: `${-this.margin / 2}px`,
        fontSize: `${this.margin / 2}px`
      };
    },
    overflowStyleBottom() {
      return {
        height: `${this.margin / 2}px`,
        bottom: `${-this.margin / 2}px`
      };
    },
    overflowStyleLeft() {
      return {
        width: `${this.margin / 2}px`,
        left: `${-this.margin / 2}px`
      };
    },
    overflowStyleRight() {
      return {
        width: `${this.margin / 2}px`,
        right: `${-this.margin / 2}px`
      };
    },
    safeArea() {
      const fullPageType = this.platMsg.body.fullScreen;
      let width;
      let height;
      const borderData = '1px dashed rgba(255,0,0,0.3)';
      const borderMap = {
        colClip: {
          borderTop: borderData,
          borderBottom: borderData
        },
        rawClip: {
          borderLeft: borderData,
          borderRight: borderData
        }
      };
      if (fullPageType === 'colClip') {
        width = 100;
        height = this.platMsg.body.width / this.platMsg.body.maxRatio / this.platMsg.body.height * 100;
      } else {
        height = 100;
        width = this.platMsg.body.height * this.platMsg.body.minRatio / this.platMsg.body.width * 100;
      }
      return {
        width: `${width}%`,
        height: `${height}%`,
        ...borderMap[fullPageType]
      };
    },
  },
  created() {
    // 创建的时候根据index push当前的screen实例
    this.addScreen({
      screenData: {
        id: this.id,
        rootNodeId: this.rootNodeId
      },
      index: this.index === 'auto' ? undefined : this.index
    });
  },
  beforeDestroy() {
    this.removeScreen(this.id);
  },
  methods: {
    ...mapMutations([
      'addScreen',
      'removeScreen',
    ]),
    ...mapActions(['updateNodeInNewScreen']),
    destroyScreen() {
      this.updateNodeInNewScreen({
        type: 'remove',
        id: this.closeId || this.rootNodeId
      });
    },
  }
};
</script>
<style lang="scss">
// 去掉滚动条
.puzzle-screen {
  &::-webkit-scrollbar,
  & *::-webkit-scrollbar {
    display: none;
  }
}
</style>
<style lang="scss" scoped>
.puzzle-screen {
  position: absolute;
  background: #fff;
  line-height: 1.15;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
  cursor: default;
  pointer-events: auto;
  &.locked,
  &.locked ::v-deep * {
    pointer-events: none !important;
  }
  &.locked.during-drag {
    opacity: 0.5;
  }
  .puzzle-screen-title {
    position: absolute;
    top: -10px;
    left: 0;
    transform: translateY(-100%);
    color: #333;
  }
  .puzzle-screen-overflow {
    position: absolute;
    cursor: grab;
    text-align: right;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    overflow: scroll;
    &-left,
    &-right {
      height: 100%;
      top: 0;
      flex-direction: column;
      justify-content: flex-start;
    }
    &-top,
    &-bottom {
      overflow: visible;
      width: 100%;
      left: 0;
      justify-content: flex-end;
    }
    .close-icon {
      cursor: pointer;
    }

    &-left {
      &__pagemodule {
        width: 200px;
      }
    }
  }
  .viewport {
    position: relative;
    width: 100%;
    height: 100%;
    transform: scale(1);
    overflow: hidden;
  }
  .safe-area {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
