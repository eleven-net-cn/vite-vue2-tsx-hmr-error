<template>
  <div class="puzzle-preview">
    <div v-if="isPageCompType" class="module-action">
      <div class="module-action__select">
        <el-select
          v-model="module"
          width="100px" size="small" placeholder="切换模块"
          clearable
        >
          <el-option
            v-for="item in modules"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="module-action__select">
        <el-select
          v-model="status"
          size="small" placeholder="切换状态"
        >
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <tools-bar @initCanvasTransform="initCanvasTransform" @resetCanvasClientData="resetCanvasClientData"></tools-bar>

    <el-button
      v-if="!isPageCompType"
      type="primary" icon="el-icon-refresh" size="small"
      class="plat-action"
      @click="checkoutPlatType"
    >
      切换至{{ otherType }}端
    </el-button>
    <TopToolsBar />
    <pageList
      v-if="isFullScreen"
    />
    <div
      ref="canvasContainer" class="puzzle-preview-scroller"
      @mousewheel="mousewheel"
      @mousedown="startDragCanvas" @scroll.capture="scrollHandler"
    >
      <div
        :class="{ 'drop-tip': !stopCanvasMove }" class="screens-container" :style="screensContainerStyle"
        @click="puzzleClick"
      >
        <MainScreen
          :active-page="activePage"
        />
        <template v-for="(item) in activeScreenNode">
          <component
            :is="`${item.type}Screen`" :key="item.node.id"
            :node="item.node"
          />
        </template>
      </div>
      <!-- 编辑用的表现盒子 -->
      <EditBox v-show="showEditBox" />
      <!-- 拖拽用的表现盒子 -->
      <DragBox />
    </div>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions
} from 'vuex';
import Emitter from 'component-emitter';
// import msgEvtType from '@/constants/messageEventType';
import { isWindows } from '@/constants/devices';
import constants from '@/constants/';
import pageList from './fullpage/pageList';
import MainScreen from './screens/mainScreen';
import DialogScreen from './screens/dialogScreen';
import SwiperScreen from './screens/swiperScreen';
import CollapseScreen from './screens/collapseScreen';
import CustomButtonScreen from './screens/customButtonScreen';
import EditBox from './editBox/index.vue';
import DragBox from './dragBox';
import TopToolsBar from './editTools/topToolsBar.vue';

const { body } = document;
export default {
  components: {
    pageList,
    MainScreen,
    EditBox,
    DialogScreen,
    SwiperScreen,
    CollapseScreen,
    DragBox,
    TopToolsBar,
    CustomButtonScreen
  },
  data() {
    return {
      // 缩放按钮
      ctrlKey: 'ctrlKey',
      // 开始拖动画布
      startDrag: false,
      // puzzleFocus: true,
      spaceKeyDown: false,
      mouseWheelTimer: null
    };
  },
  computed: {
    ...mapState([
      'platform',
      'baseInfo',
      'platMsg',
      'nodes',
      'canvasTransformData',
      'mouseDownPosition',
      'activePageIdx',
      'lang',
      'compList',
      'modeType',
      'pageModule',
      'pageStatus'
    ]),
    ...mapGetters([
      'viewport',
      'activeNode',
      'pageConfig',
      'otherType',
      'dialogNodes',
      'activeScreenNode',
      'mapNodes',
      'fullpageNodes',
      'maxZIndexNode',
      'dfsNodes',
      'mapProNodes',
      'activeNodeProInPage',
      'isFullScreen',
      'isPageCompType',
      'pageCompNode',
      'pageComp'
    ]),
    modules() {
      const modules = this.pageComp?.main?.declarations?.modules;
      console.log(this.pageComp);
      if (!this.isPageCompType || !modules) return [];
      return modules || [];
    },
    statusList() {
      return this.modules?.find(x => x.value === this.pageModule)?.status || [];
    },
    module: {
      get() {
        return this.pageModule;
      },
      set(newVal) {
        this.updatePageModule(newVal);
        this.status = '';
      }
    },
    status: {
      get() {
        return this.pageStatus;
      },
      set(newVal) {
        this.updatePageStatus(newVal);
      }
    },
    showEditBox() {
      // 1、需要当前元素正在页面中渲染
      // 2、meta按钮按下的时候消失，因为会影响拖动画布
      // 3、预览模式的时候会影响预览
      return this.activeNodeProInPage?.activeEl && (this.modeType === 'edit' || this.activeNodeProInPage.screenCategory !== constants.screenCategory.MAIN) && !this.spaceKeyDown;
    },
    stopCanvasMove() {
      return !this.spaceKeyDown && !this.mouseWheelTimer;
    },
    // 画布的位移缩放style
    transFormData() {
      const { x, y, scale } = this.canvasTransformData;
      return `translate(${x}px,${y}px) scale(${scale})`;
    },
    activePage() {
      return this.fullpageNodes[this.activePageIdx];
    },
    screensContainerStyle() {
      return {
        transform: this.transFormData,
      };
    },
    // isRelative() {
    //   return this.activeNode.boxStyle.position === 'relative';
    // },
  },
  watch: {
    screensContainerStyle() {
      this.$nextTick(() => {
        this.resetActiveEditBoxStyle();
      });
    },
    maxZIndexNode: {
      handler() {
        if (this.lang) return;
        if (this.dfsNodes.length === 0) return;
        // 排序组件zIndex
        const sortNodes = [...this.dfsNodes].sort((a, b) => {
          const indexA = a.boxStyle.zIndex || 0;
          const indexB = b.boxStyle.zIndex || 0;
          return indexA - indexB;
        });
        let preZIndex = 0;
        const bottomNodeZIndex = sortNodes[0].boxStyle.zIndex;
        // 将最底层的元素的zindex直接不进行设置
        if (bottomNodeZIndex) {
          this.updateNodeBoxStyle({
            node: sortNodes[0],
            options: {
              zIndex: undefined
            }
          });
        }
        // 将层级之间相差2及以上的层级缩小到1
        sortNodes.forEach((node, index) => {
          if (node.nodeCategory === 'dialog') return;
          let curZIndex = Number(node.boxStyle.zIndex) || 0;
          // 如果该元素在前边所有元素的最后，则将该元素后退成之前一层
          // 该元素在页面中的位置
          const curNodeIndexInPage = this.mapProNodes[node.id].indexInPage;
          // 该元素之前的所有元素在页面的最大位置
          let preNodeMaxIndexInPage = 0;
          // 找到当前元素之前的所有元素
          const preNodeList = sortNodes.slice(0, index);
          preNodeList.forEach(pNode => {
            // 找到该元素当前在页面中的位置
            const nodeIndexInPage = this.mapProNodes[pNode.id].indexInPage;
            if (nodeIndexInPage > preNodeMaxIndexInPage) {
              preNodeMaxIndexInPage = nodeIndexInPage;
            }
          });
          // 如果元素比之前的所有节点都靠后，则它的index可以直接按照之前的为准
          if (curNodeIndexInPage >= preNodeMaxIndexInPage) {
            curZIndex = preZIndex;
            if (node.boxStyle.zIndex !== String(preZIndex)) {
              this.updateNodeBoxStyle({
                node,
                options: {
                  zIndex: preZIndex ? String(preZIndex) : undefined
                }
              });
            }
          }
          // 如果元素当前的zindex值比前面的大好几级则进行降级模式
          if (curZIndex > preZIndex && curZIndex - preZIndex >= 2) {
            curZIndex = preZIndex + 1;
            this.updateNodeBoxStyle({
              node,
              options: {
                // 任何zindex为0之后，直接取消zindex设置，取消该元素层叠作用域
                zIndex: String(curZIndex)
              }
            });
          }
          if (curZIndex === 0 && node.boxStyle.zIndex !== undefined) {
            this.updateNodeBoxStyle({
              node,
              options: {
                // 任何zindex为0之后，直接取消zindex设置，取消该元素层叠作用域
                zIndex: undefined
              }
            });
          }
          preZIndex = curZIndex;
        });
        // 重新排序后如果当前的最大zIndex大于弹窗，则将弹窗层级提升
        if (preZIndex >= 998) {
          this.dialogNodes.forEach(node => {
            this.updateNodeOptions({
              node,
              options: {
                zIndex: preZIndex + 1
              }
            });
          });
        }
      }
    },
    platform: {
      async handler() {
        await this.$nextTick();
        this.initCanvasTransform();
      },
      immediate: true
    },
  },
  beforeCreate() {
    window.PuzzleAdminEmitter = new Emitter();
  },
  created() {
    this.setListener();
    this.$nextTick(() => {
      this.updateCanvasContainerEl(this.$refs.canvasContainer);
    });
  },
  beforeDestroy() {
    this.removeListener();
  },
  methods: {
    ...mapMutations([
      'resetCanvasClientData',
      'setCanvasTranslate',
      'updateCanvasContainerEl',
      'updateMouseDownPosition',
      'updatePageModule',
      'updatePageStatus'
    ]),
    ...mapActions([
      'updateScaleNum',
      'resetActiveEditBoxStyle',
      'updateActiveNodeId',
      'updateNodeBoxStyle',
      'updateNodeOptions'
    ]),
    // scrollIntoView(el) {
    // },
    checkoutPlatType() {
      const newV = this.otherType;
      if (!this.pageConfig[this.otherType]?.enable) {
        this.$confirm(`此操作将激活${this.otherType}端页面，是否继续（可以在【页面设置】->【高级选项】中取消激活）`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('changePlatform', newV);
        }).catch(() => {});
      } else {
        this.$emit('changePlatform', newV);
      }
    },
    toggleSpaceKeyDown(e) {
      const { target } = e;
      const { tagName } = target;
      if (target.isContentEditable || (tagName === 'INPUT' && !['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit'].includes(target.type)) || tagName === 'SELECT' || tagName === 'TEXTAREA') {
        // form 表单或者input的则跳过
        return;
      }
      if ((e.code === 'Space') && e.type === 'keydown') {
        this.spaceKeyDown = true;
        e.preventDefault();
      } else {
        this.spaceKeyDown = false;
      }
    },
    scrollHandler() {
      this.resetActiveEditBoxStyle();
    },

    // 初始化画布的缩放，让元素处于正中央
    initCanvasTransform() {
      // 画布上左右留80px，下留20px;
      this.resetCanvasClientData();
      const XPadding = 180;
      const maxHeight = this.canvasTransformData.clientHeight - 100;
      const maxWidth = this.canvasTransformData.clientWidth - XPadding;
      const puzzleHeight = this.viewport.height;
      const puzzleWidth = this.viewport.width;
      let heightScale = 1;
      let widthScale = 1;
      if (puzzleHeight > maxHeight) {
        heightScale = maxHeight / puzzleHeight;
      }
      if (puzzleWidth > maxWidth) {
        widthScale = maxWidth / puzzleWidth;
      }
      // 拿到画布当前需要缩放的值,画布缩放最小为1
      const scale = Math.min(heightScale, widthScale, 1);
      // 拿到画布当前真实的宽度
      const scaledWidth = scale * puzzleWidth;
      const scaledHeight = scale * puzzleHeight;
      let x = (this.canvasTransformData.clientWidth - scaledWidth) / 2;
      let y = 0;
      // 减去中心缩小所导致的上部offset
      // 横屏的情况下上下居中,滚屏模式向右移动一点距离
      if (puzzleHeight < puzzleWidth) {
        y = (this.canvasTransformData.clientHeight - scaledHeight) / 2 - 70;
        if (this.isFullScreen) {
          x += 10;
        }
      } else {
        y = 80;
      }
      // 先位移，再缩放
      this.setCanvasTranslate({ x, y });
      // 缩放点为画布的左上角
      this.updateScaleNum({ scale, origin: { x: 0, y: 0 } });
    },
    setListener() {
      body.addEventListener('keydown', this.toggleSpaceKeyDown);
      body.addEventListener('keyup', this.toggleSpaceKeyDown);
      body.addEventListener('mouseup', this.stopDragCanvas);
      body.addEventListener('mousemove', this.setDragNewPosition);
      body.addEventListener('mousedown', this.setPrePosition);
    },
    removeListener() {
      body.removeEventListener('keydown', this.toggleSpaceKeyDown);
      body.removeEventListener('keyup', this.toggleSpaceKeyDown);
      body.removeEventListener('mouseup', this.stopDragCanvas);
      body.removeEventListener('mousemove', this.setDragNewPosition);
      body.removeEventListener('mousedown', this.setPrePosition);
    },
    // 滚轮滚动事件
    mousewheel(e) {
      // 只有在鼠标处处于内容区并且内容区有焦点的时候才禁止这个事件
      if (!this.isDragArea(e.target) && (this.stopCanvasMove) && !(e[this.ctrlKey] || e.code === 'Space')) {
        return;
      }
      clearTimeout(this.mouseWheelTimer);
      this.mouseWheelTimer = setTimeout(() => {
        this.mouseWheelTimer = null;
      }, 300);
      // command键或者ctrl键存在时进行缩放
      if (e[this.ctrlKey]) {
        const scaled = this.canvasTransformData.scale - e.deltaY / (isWindows ? 700 : 100);
        if (scaled > 0.1 || e.deltaY < 0) {
          this.updateScaleNum({ scale: scaled, publicOrigin: { x: e.pageX, y: e.pageY } });
        }
      } else {
        this.canvasTransformData.x -= e.deltaX;
        this.canvasTransformData.y -= e.deltaY;
      }
      e.preventDefault();
    },
    // 点击画布内容才能触发取消锁定画布
    puzzleClick(e) {
      // this.focusPuzzle();
      const id = e.target.getAttribute('nodeid');
      const noActive = e.target.getAttribute('noActive');
      if (id && !noActive) {
        if (this.activeNode?.id === id) return;
        setTimeout(() => {
          this.updateActiveNodeId(id);
        }, 0);
      } else {
        setTimeout(() => {
          this.updateActiveNodeId('');
        }, 0);
      }
    },
    // focusPuzzle() {
    //   this.puzzleFocus = true;
    // },
    // blurPuzzle() {
    //   this.puzzleFocus = false;
    // },
    // 判断是否是画布拖拽区
    isDragArea(el) {
      return el === this.$refs.canvasContainer || el.hasAttribute('overflow-area');
    },
    setPrePosition(e) {
      this.updateMouseDownPosition(e && {
        x: e.pageX,
        y: e.pageY
      });
    },
    startDragCanvas(e) {
      // 点击内容空白区也能取消焦点
      if (this.isDragArea(e.target) || e.target === this.$refs?.editMode?.$el) {
        // 在表单修改之后再元素失焦
        setTimeout(() => {
          this.updateActiveNodeId('');
        }, 0);
      }
      // 在画布区生效，在内容区或者内容区没有焦点时候生效
      if ((!this.stopCanvasMove || this.isDragArea(e.target)) && e.button === 0) {
        this.startDrag = true;
      }
    },
    // 进行画布的拖动
    setDragNewPosition(e) {
      if (this.startDrag) {
        clearTimeout(this.mouseWheelTimer);
        this.mouseWheelTimer = setTimeout(() => {
          this.mouseWheelTimer = null;
        }, 300);
        this.canvasTransformData.x += e.pageX - this.mouseDownPosition.x;
        this.canvasTransformData.y += e.pageY - this.mouseDownPosition.y;
        e.preventDefault();
        this.setPrePosition(e);
        e.stopPropagation();
      }
    },
    stopDragCanvas() {
      this.startDrag = false;
    },
  }
};
</script>
<style lang="scss" scoped>
.plat-action {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
}

.module-action {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 1;

  &__select {
    margin-bottom: 5px;

    .el-select {
      width: 140px;
    }
  }
}

.puzzle-preview {
  flex: 1;
  height: 100%;
  overflow: auto;
  background-color: #f3f3f3;
  position: relative;
  z-index: 0;
  overflow: hidden;
  user-select: none;
  &-scroller {
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: grab;
    .screens-container {
      width: 100%;
      height: 100%;
      position: absolute;
      transform-origin: left top;
      pointer-events: none;
    }
    .drop-tip > .puzzle-screen {
      &::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        transform: translateZ(10px);
        opacity: 0.1;
        background: rgba($color: #000000, $alpha: 0.4)
          url("~@images/move-icon.png") no-repeat center center/100px 100px;
        cursor: grab;
      }
    }
  }
}
</style>
