<template>
  <div
    class="edit-box"
    :class="{'relative-style':isRelative,'no-edit-style':noEditStyle}"
    :style="editBoxStyle"
    @mousewheel="cancelBoxScroll"
    @mousedown.self="mouseDown($event,'move')"
  >
    <svg
      v-show="!(activeNodePro&&activeNodePro.canNestable)"
      class="line-container"
      version="1.1" baseProfile="full"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="0" y1="0" x2="100%"
        y2="100%" :stroke="lineColor" stroke-width="1"
      />
      <line
        x1="0" y1="100%" x2="100%"
        y2="0" :stroke="lineColor" stroke-width="1"
      />
    </svg>
    <template v-if="!noEditStyle">
      <template v-for="(val,key) in boxIconsMsg">
        <div
          v-if="checkoutPointerShow(val)" :key="key"
          class="edit-icon-container"
          :class="`edit-icon-container-${key}`"
          @mousedown="mouseDown($event,key)"
        >
          <div class="edit-icon"></div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapMutations, mapActions
} from 'vuex';
// import { keys } from 'lodash';
import * as utils from '@/utils';
import { getCssValAndUnit } from '@/utils/cssUnit';
import { getParentList } from '@/utils/dom';

export default {
  data() {
    return {
      // 拖动的类型，move或者resize
      startDragResizeType: '',
      // 判断是否正在编辑
      dragedMoveEdit: false,
      // 当编辑器覆盖在上面时，能够进行滚动
      cancelBoxScrollTimer: null,
      // 设置在移动之前的状态
      preActiveBoxState: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        marginLeft: 0,
        marginTop: 0
      },
      boxIconsMsg: {
        tm: {
          // 上中的拖拽点在不能改变元素高度的情况下不能显示
          exclude: ['noResizeHeight']
        },
        ml: {
          // 中左的拖拽点在不能改变元素宽度的情况下不能显示
          exclude: ['noResizeWidth']
        },
        mr: {
          // 中右的拖拽点在不能改变元素宽度的情况下不能显示
          exclude: ['noResizeWidth']
        },
        bm: {
          // 下中的拖拽点在不能改变元素高度的情况下不能显示
          exclude: ['noResizeHeight']
        },
        tl: {
          // 左上角的拖拽点在不能改变高度，或者不能改变宽度的时候都不能显示
          exclude: ['noResizeWidth', 'noResizeHeight']
        },
        tr: {
          exclude: ['noResizeWidth', 'noResizeHeight']
        },
        bl: {
          exclude: ['noResizeWidth', 'noResizeHeight']
        },
        br: {
          exclude: ['noResizeWidth', 'noResizeHeight']
        },
      },
    };
  },
  computed: {
    ...mapState([
      'currentActiveElStyleNum',
      'canvasTransformData',
      'mouseDownPosition',
      'dragActiveBoxStyle',
      'activeNodeStateKey'
    ]),
    ...mapGetters([
      'activeNode',
      'activeNodePro',
      'viewport',
      'activeNodeProInPage',
    ]),
    // 编辑工具的样式
    editBoxStyle() {
      return {
        ...this.currentActiveElStyle,
        // 在滚轮进行滚动的时候、鼠标按下的时候、该组件不需要编辑的时候为不可被点击
        // 鼠标按下的时候不可被点击是为了在鼠标抬起的时候如果没有移动，则可以直接点击到下一层，将点击事件穿透下去
        pointerEvents: this.cancelBoxScrollTimer || this.startDragResizeType || this.noEditStyle ? 'none' : 'auto',
      };
    },
    editOptions() {
      return this.activeNodePro?.editOptions || {};
    },
    boxStyle() {
      return this.activeNode?.boxStyle || {};
    },
    noResize() {
      return this.editOptions.noResize;
    },
    noResizeHeight() {
      return this.editOptions.noResizeHeight;
    },
    noResizeWidth() {
      return this.editOptions.noResizeWidth;
    },
    noPosition() {
      return this.editOptions.noPosition;
    },
    noEditStyle() {
      return this.noResize && this.noPosition;
    },
    fixAspectRatio() {
      const fixAspectRatio = this.editOptions.fixAspectRatio;
      // 图片组件没有图片的时候可以自由变换
      const isImage = this.activeNode.name === '@puzzle/image';
      // 有图片并且选择了锁定宽高比后才可以锁定宽高比
      const imageCompFix = this.activeNode.options.src && fixAspectRatio;
      return isImage ? imageCompFix : fixAspectRatio;
    },
    isRelative() {
      return this.boxStyle.position === 'relative';
    },
    isFixed() {
      return this.boxStyle.position === 'fixed';
    },
    isAbsolute() {
      return this.boxStyle.position === 'absolute';
    },
    activeRealBoxStyle() {
      return { ...this.boxStyle, ...this.dragActiveBoxStyle };
    },
    lineColor() {
      return this.isRelative ? '#f84563' : '#458df8';
    },
    // 用于更新元素的边框大小信息
    compConfig() {
      const activeNode = this.activeNode || {};
      return {
        ...activeNode,
        activeEl: this.activeEl,
        boxStyle: this.activeRealBoxStyle,
        // 遍历到options的子节点，放入相应式监听
        options: { ...activeNode.options },
        activeNodeStateKey: this.activeNodeStateKey
      };
    },
    // 当前激活元素的样式
    currentActiveElStyle() {
      const {
        x, y, width, height
      } = this.currentActiveElStyleNum;
      return {
        left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px`
      };
    },
    activeEl() {
      return this.activeNodeProInPage?.activeEl;
    },
  },
  watch: {
    compConfig: {
      handler(newVal) {
        if (newVal.activeEl) {
          this.$nextTick(() => {
            this.resetActiveEditBoxStyle();
          });
        }
      },
    },
  },
  created() {
    this.setListener();
  },
  destroyed() {
    this.removeListener();
  },
  methods: {
    ...mapActions(['resetActiveEditBoxStyle', 'updateNodeBoxStyle']),
    ...mapMutations([
      'updateDragActiveBoxStyle',
    ]),
    // 检测拖拽点是否可以显示
    checkoutPointerShow(val) {
      const env = {
        noResizeHeight: this.noResizeHeight,
        noResizeWidth: this.noResizeWidth
      };
      // 当不能在当前环境中能找到对应的编辑属性时，才能显示
      return !val.exclude.some(key => env[key]);
    },
    setListener() {
      document.addEventListener('mouseup', this.mouseUp);
      document.addEventListener('mousemove', this.mouseMove);
    },
    removeListener() {
      document.removeEventListener('mouseup', this.mouseUp);
      document.removeEventListener('mousemove', this.mouseMove);
    },
    // 取消盒子对滚轮的影响
    cancelBoxScroll() {
      clearTimeout(this.cancelBoxScrollTimer);
      this.cancelBoxScrollTimer = setTimeout(() => {
        this.cancelBoxScrollTimer = null;
      }, 100);
    },
    mouseDown(e, key) {
      // 设置变化的类型
      this.startDragResizeType = key;
      this.preActiveBoxState = {
        ...this.currentActiveElStyleNum,
      };
    },
    // 拖拽的基本处理
    dragHandler({
      height, width, left, top, moveY, moveX
    }) {
      // 首先将元素都基于左上角定位进行样式的设定
      const boxStyle = {};
      const resizeMap = {
        tm: () => {
          // 拖动上边的线则top增加moveY
          boxStyle.top = top + moveY;
          // 拖动上边的线则height减少moveY
          boxStyle.height = height - moveY;
        },
        ml: () => {
          boxStyle.left = left + moveX;
          boxStyle.width = width - moveX;
        },
        mr: () => {
          boxStyle.width = width + moveX;
          // 如果组件有向相对右方的定位，left值设置成与当前left一样
          if (this.activeNode.boxStyle.right) {
            boxStyle.left = left;
          }
        },
        bm: () => {
          boxStyle.height = height + moveY;
          if (this.activeNode.boxStyle.bottom) {
            boxStyle.top = top;
          }
        },
        br: () => {
          boxStyle.width = width + moveX;
          boxStyle.height = height + moveY;
          if (this.activeNode.boxStyle.right) {
            boxStyle.left = left;
          }
          if (this.activeNode.boxStyle.bottom) {
            boxStyle.top = top;
          }
        },
        bl: () => {
          boxStyle.left = left + moveX;
          boxStyle.width = width - moveX;
          boxStyle.height = height + moveY;
          if (this.activeNode.boxStyle.bottom) {
            boxStyle.top = top;
          }
        },
        tr: () => {
          boxStyle.top = top + moveY;
          boxStyle.width = width + moveX;
          boxStyle.height = height - moveY;
          if (this.activeNode.boxStyle.right) {
            boxStyle.left = left;
          }
        },
        tl: () => {
          boxStyle.top = top + moveY;
          boxStyle.left = left + moveX;
          boxStyle.width = width - moveX;
          boxStyle.height = height - moveY;
        },
        move: () => {
          boxStyle.top = top + moveY;
          boxStyle.left = left + moveX;
        }
      };
      resizeMap[this.startDragResizeType]();
      return boxStyle;
    },
    // 相对定位的元素目前只允许修改宽和高
    relativeBoxFilter(boxStyle) {
      const newBoxStyle = {};
      if (this.isRelative) {
        ['width', 'height'].forEach(key => {
          if (boxStyle[key] === undefined) {
            return;
          }
          newBoxStyle[key] = boxStyle[key];
        });
        return newBoxStyle;
      }
      return boxStyle;
    },
    // 最小编辑为20px
    minLengthFilter(boxStyle) {
      boxStyle = { ...boxStyle };
      // 编辑最小的宽高目前设置为20像素
      const minLendth = 20;
      // 不符合长度规范的单位,最小为20，并重新计算left和top的单位
      ['width', 'height'].forEach(key => {
        const scaleSmaller = boxStyle[key] < this.preActiveBoxState[key];
        // 设置了某个值，并且当前的值要小于最小值时，并且当前的值为继续缩小时
        if (boxStyle[key] !== undefined && scaleSmaller && boxStyle[key] < minLendth) {
          // 如果原本的值大于等于20，则将宽度设置为最小值
          if (this.preActiveBoxState[key] >= minLendth) {
            boxStyle[key] = minLendth;
            // 如果是左上角的位移操作，则将元素设定为最小宽/高的位置
            if (key === 'width' && boxStyle.left !== undefined && boxStyle.left !== this.preActiveBoxState.left) {
              // 原本的宽度减去最小宽度
              boxStyle.left = this.preActiveBoxState.left + this.preActiveBoxState[key] - minLendth;
            }
            if (key === 'height' && boxStyle.top !== undefined && boxStyle.top !== this.preActiveBoxState.top) {
              boxStyle.top = this.preActiveBoxState.top + this.preActiveBoxState[key] - minLendth;
            }
          } else {
            // 如果小于20则不能让其继续缩小
            boxStyle[key] = this.preActiveBoxState[key];
            if (boxStyle.left !== undefined && boxStyle.left !== this.preActiveBoxState.left && (key === 'width')) {
              delete boxStyle.left;
            }
            if (boxStyle.top !== undefined && boxStyle.top !== this.preActiveBoxState.left && (key === 'height')) {
              delete boxStyle.top;
            }
          }
        }
      });
      return boxStyle;
    },
    // 自动吸附左上角功能
    attachFilter({ boxStyle, width, height }) {
      boxStyle = { ...boxStyle };
      // 小于4px,则自动吸附左上角功能
      const autoAttachMap = {
        left: 4,
        top: 4,
      };
      const boxStyleKeyList = Object.keys(boxStyle);
      if (!boxStyleKeyList.length) return;
      // 位移最小吸附单位是4px
      boxStyleKeyList.forEach((key) => {
        // 某一个值小于最小值时，进行清零吸附，并重新计算宽度
        if (autoAttachMap[key] && Math.abs(boxStyle[key]) < autoAttachMap[key]) {
          boxStyle[key] = 0;
          if ('width' in boxStyle && (key === 'left')) {
            boxStyle.width = width + this.preActiveBoxState[key];
          }
          if ('height' in boxStyle && (key === 'top')) {
            boxStyle.height = height + this.preActiveBoxState[key];
          }
        }
      });
      return boxStyle;
    },
    unitFilter({ boxStyle, width, height }) {
      // 当前画布的缩放比例
      const rate = this.canvasTransformData.scale;
      const leftOppoKey = 'right';
      const topOppoKey = 'bottom';
      const oppoData = {
        leftOppoKey,
        leftOppoVal: this.activeNode.boxStyle[leftOppoKey],
        topOppoKey,
        topOppoVal: this.activeNode.boxStyle[topOppoKey],
      };
      const boxStyleFormateUnit = {};
      // 编辑元素的父容器的内容大小，为什么使用clientWidth，因为考虑到未来不会加入padding,但会加入border
      // clientWidth不会受transform影响
      let positionWidthInScreen = this.activeEl.parentElement.clientWidth;
      let positionHeightInScreen = this.activeEl.parentElement.clientHeight;
      // 当前编辑对象的缩放后的宽高
      const curBoxHeight = (boxStyle.height ?? height);
      const curBoxWidth = (boxStyle.width ?? width);
      // 当前编辑对象的原始宽高
      const curBoxHeightInScreen = curBoxHeight / rate;
      const curBoxWidthInScreen = curBoxWidth / rate;
      Object.keys(boxStyle).forEach(key => {
        // 判定一下当前需要进行变更修改的方向，如果原本的定位是right则继续使用right定位
        const oppoKey = oppoData[`${key}OppoKey`];
        const oppoVal = this.activeNode.boxStyle[oppoKey];
        if (oppoVal) {
          boxStyle[oppoKey] = boxStyle[key];
          delete boxStyle[key];
          key = oppoKey;
        }
        // 格式化之前的元素单位
        const formateItem = getCssValAndUnit(String(this.activeNode.boxStyle[key])) || {};
        let { unit, val } = formateItem;
        const { calcUnit } = formateItem;
        let isCalc = false;
        if (unit === 'calc') {
          ({ unit, val } = getCssValAndUnit(val + calcUnit));
          isCalc = true;
        }
        // 缩放前的px大小
        const pxInScreen = boxStyle[key] / rate;
        // 相对定位的元素宽高百分比相对于父元素
        if (this.isAbsolute) {
          // 绝对定位的元素宽高百分比相对于定位不为static的元素
          const positionEl = getParentList(this.activeEl).find(el => window.getComputedStyle(el).position !== 'static');
          positionWidthInScreen = positionEl.clientWidth;
          positionHeightInScreen = positionEl.clientHeight;
        }
        // 吸附元素相对于viewport
        if (this.isFixed) {
          positionWidthInScreen = this.viewport.width;
          positionHeightInScreen = this.viewport.height;
        }
        // 父元素缩放后的大小
        const positionWidth = positionWidthInScreen * rate;
        const positionHeight = positionHeightInScreen * rate;
        // 对不同单位的处理
        const unitHandlermap = {
          '%': () => {
            // 格式化成对应单位后的值，相对与screen的宽高
            let boxStyleFormateUnitNum;
            let boxLength;
            if (['height', 'top', 'bottom'].includes(key)) {
              boxStyleFormateUnitNum = pxInScreen / positionHeightInScreen * 100;
              boxLength = curBoxHeight / positionHeight * 100;
            } else {
              boxStyleFormateUnitNum = pxInScreen / positionWidthInScreen * 100;
              boxLength = curBoxWidth / positionWidth * 100;
            }
            if (oppoVal) {
              boxStyleFormateUnitNum = 100 - boxStyleFormateUnitNum - boxLength;
            }
            if (isCalc) {
              boxStyleFormateUnit[key] = `calc(50% - ${(50 - boxStyleFormateUnitNum).toFixed(3)}%)`;
            } else {
              boxStyleFormateUnit[key] = `${boxStyleFormateUnitNum.toFixed(3)}%`;
            }
          },
          px: () => {
            if (isCalc) {
              let half;
              if (['height', 'top', 'bottom'].includes(key)) {
                half = positionHeightInScreen / 2;
              } else {
                half = positionWidthInScreen / 2;
              }
              boxStyleFormateUnit[key] = `calc(50% - ${(half - pxInScreen).toFixed(3)}px)`;
            } else {
              boxStyleFormateUnit[key] = `${pxInScreen.toFixed(3)}px`;
              if (oppoVal) {
                if (['height', 'top', 'bottom'].includes(key)) {
                  boxStyleFormateUnit[key] = `${(positionHeightInScreen - pxInScreen - curBoxHeightInScreen).toFixed(3)}px`;
                } else {
                  boxStyleFormateUnit[key] = `${(positionWidthInScreen - pxInScreen - curBoxWidthInScreen).toFixed(3)}px`;
                }
              }
            }
          },
          vw: () => {
            // 父元素的 50% 大小对应的vw单位
            let half;
            let boxLength;
            if (['height', 'top', 'bottom'].includes(key)) {
              half = positionHeightInScreen / 2 / this.viewport.width * 100;
              boxLength = curBoxHeightInScreen / this.viewport.width * 100;
            } else {
              half = positionWidthInScreen / 2 / this.viewport.width * 100;
              boxLength = curBoxWidthInScreen / this.viewport.width * 100;
            }
            const vwVal = pxInScreen / this.viewport.width * 100;
            if (isCalc) {
              boxStyleFormateUnit[key] = `calc(50% - ${(half - vwVal).toFixed(3)}vw)`;
            } else {
              boxStyleFormateUnit[key] = `${vwVal.toFixed(3)}vw`;
              if (oppoVal) {
                boxStyleFormateUnit[key] = `${(half * 2 - vwVal - boxLength).toFixed(3)}vw`;
              }
            }
          },
          vh: () => {
            // 父元素的 50% 大小对应的vh单位
            let half;
            // 元素的高或者宽的长度(对应vh值)
            let boxLength;
            if (['height', 'top', 'bottom'].includes(key)) {
              half = positionHeightInScreen / 2 / this.viewport.height * 100;
              boxLength = curBoxHeightInScreen / this.viewport.height * 100;
            } else {
              half = positionWidthInScreen / 2 / this.viewport.height * 100;
              boxLength = curBoxWidthInScreen / this.viewport.height * 100;
            }
            const vhVal = pxInScreen / this.viewport.height * 100;
            if (isCalc) {
              boxStyleFormateUnit[key] = `calc(50% - ${(half - vhVal).toFixed(3)}vh)`;
            } else {
              boxStyleFormateUnit[key] = `${vhVal.toFixed(3)}vh`;
              if (oppoVal) {
                boxStyleFormateUnit[key] = `${(half * 2 - vhVal - boxLength).toFixed(3)}vh`;
              }
            }
          },
        };
        if (unitHandlermap[unit]) {
          unitHandlermap[unit]();
        } else {
          // 外容器的一半
          let half;
          // 盒子的长度，可能是高度可能是宽度
          let boxLength;
          if (['height', 'top', 'bottom'].includes(key)) {
            half = utils.px2rem(positionHeightInScreen / 2, true);
            boxLength = utils.px2rem(curBoxHeightInScreen, true);
          } else {
            half = utils.px2rem(positionWidthInScreen / 2, true);
            boxLength = utils.px2rem(curBoxWidthInScreen, true);
          }
          if (isCalc) {
            boxStyleFormateUnit[key] = `calc(50% - ${(half - utils.px2rem(pxInScreen, true)).toFixed(3)}rem)`;
          } else {
            const remNum = utils.px2rem(pxInScreen, true);
            // 再使用pxtorem将px转化为rem
            boxStyleFormateUnit[key] = `${remNum.toFixed(3)}rem`;
            if (oppoVal) {
              boxStyleFormateUnit[key] = `${(half * 2 - remNum - boxLength).toFixed(3)}rem`;
            }
          }
        }
      });
      return boxStyleFormateUnit;
    },
    // 清除与编辑属性违背的值
    editOptionsFilter(boxStyleFormateUnit) {
      boxStyleFormateUnit = { ...boxStyleFormateUnit };
      const resizeMap = {
        width: this.noResizeWidth,
        height: this.noResizeHeight
      };
      Object.keys(resizeMap).forEach(key => {
        if (resizeMap[key]) {
          delete boxStyleFormateUnit[key];
        }
      });
      // 宽高的单位
      const positionList = ['top', 'right', 'left', 'bottom'];
      // 分别清空对不可设置大小和不可设置方位对元素的值
      if (this.noPosition) {
        positionList.forEach(key => {
          delete boxStyleFormateUnit[key];
        });
      }
      return boxStyleFormateUnit;
    },
    // 锁定宽高比，权重是最高的
    fixAspectRatioFilter({
      boxStyle, width, height, top, left, moveX, moveY
    }) {
      const type = this.startDragResizeType;
      boxStyle = { ...boxStyle };
      if (!this.fixAspectRatio || type === 'move' || width === 0 || height === 0) {
        return boxStyle;
      }
      // 如果锁定了一方的宽或者高，则不允许修改任何宽高的属性
      if (this.noResizeHeight || this.noResizeWidth) {
        delete boxStyle.width;
        delete boxStyle.height;
        return boxStyle;
      }
      // 判断基准的边
      let baseItem;
      const keyList = Object.keys(boxStyle);
      // 在本次都不需要修改宽和高的情况下，不需要使用锁定宽高
      if (!keyList.includes('width') && !keyList.includes('height')) {
        return boxStyle;
      }
      // 如果两边都存在修改，则以移动的距离为基准
      if (keyList.includes('width') && keyList.includes('height')) {
        baseItem = 'move';
      } else if (!keyList.includes('width')) {
        // 如果只修改单边数据，则已这边为基准
        baseItem = 'height';
      } else {
        baseItem = 'width';
      }
      // 之前的比例
      const preRatio = height / width;
      const baseVal = boxStyle[baseItem];
      if (baseItem === 'height') {
        const otherItem = 'width';
        // 以基准边为基准修改另一边的高度
        boxStyle[otherItem] = baseVal / preRatio;
      } else if (baseItem === 'width') {
        const otherItem = 'height';
        // 以基准边为基准修改另一边的高度
        boxStyle[otherItem] = baseVal * preRatio;
      } else {
        // 与ps一样，对角点的拖动再提供吸附效果，而是直接计算
        let a = moveY;
        const b = moveX;
        const c = preRatio;
        if (['bl', 'tr'].includes(type)) {
          a = -a;
        }
        let widthChange = -(b / c + a) / (c + 1 / c);
        if (['br', 'tr'].includes(type)) {
          widthChange = -widthChange;
        }
        if (widthChange <= 0 && (height <= 20 || width <= 20)) {
          return {};
        }
        boxStyle.width = widthChange + width;
        boxStyle.height = boxStyle.width * preRatio;
        // 并且当前的值为继续缩小时
        if (widthChange < 0) {
          if (Math.abs(boxStyle.width) > Math.abs(boxStyle.height)) {
            boxStyle.height = Math.max(boxStyle.height, 20);
            boxStyle.width = boxStyle.height / preRatio;
          } else {
            boxStyle.width = Math.max(boxStyle.width, 20);
            boxStyle.height = boxStyle.width * preRatio;
          }
        }
        if (!this.isRelative) {
          if (['tr', 'tl'].includes(type)) {
            boxStyle.top = top + height - boxStyle.height;
          }
          if (['bl', 'tl'].includes(type)) {
            boxStyle.left = left + width - boxStyle.width;
          }
        }
      }
      return boxStyle;
    },
    mouseMove(e) {
      // 并未按下鼠标或者该元素不能被改变宽高位置样式则直接取消
      if (!this.startDragResizeType || this.noEditStyle) return;
      // 鼠标按下到当前移动的距离，单位px
      const moveX = e.pageX - this.mouseDownPosition.x;
      const moveY = e.pageY - this.mouseDownPosition.y;
      // 拖拽断定优化,少于2px不算开始拖拽
      if ((Math.abs(moveY) < 2 && Math.abs(moveX) < 2) && !this.dragedMoveEdit) {
        return;
      }
      this.dragedMoveEdit = true;
      // 鼠标按下时激活组件的数据
      // 分别是元素以px为单位的数值
      const {
        height, width, left, top
      } = this.preActiveBoxState;
      let boxStyle = this.dragHandler({
        height, width, left, top, moveX, moveY
      });
      // 相对定位的元素目前只允许修改宽和高
      boxStyle = this.relativeBoxFilter(boxStyle);
      // 编辑最小的宽高目前设置为20像素
      boxStyle = this.minLengthFilter(boxStyle);
      // 自动吸附左上角
      boxStyle = this.attachFilter({ boxStyle, width, height });
      // 锁定宽高比
      boxStyle = this.fixAspectRatioFilter({
        boxStyle, width, height, moveX, moveY, top, left
      });
      if (!Object.keys(boxStyle).length) return;
      // 将所有以真实px为单位的值转化成之前单位
      let boxStyleFormateUnit = this.unitFilter({
        boxStyle, width, height, top, left
      });
      boxStyleFormateUnit = this.editOptionsFilter(boxStyleFormateUnit);

      this.updateDragActiveBoxStyle(boxStyleFormateUnit);
    },
    mouseUp(e) {
      // 如果没有拖拽过点击穿透至下一层
      if (this.startDragResizeType) {
        if (!this.dragedMoveEdit) {
          e.target.dispatchEvent(new Event('click', { bubbles: true }));
        } else {
          // 如果有编辑过，则进行样式更新，应用到node中去
          this.updateNodeBoxStyle({
            options: this.dragActiveBoxStyle
          });
          this.updateDragActiveBoxStyle({});
        }
      }
      this.dragedMoveEdit = false;
      this.startDragResizeType = '';
    },
  }
};
</script>

<style lang="scss" scoped>
.edit-box {
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  border: 1px solid #458df8;
  $iconContainerWidth: 10px;
  cursor: move;
  &.relative-style {
    cursor: pointer;
    border: 2px dashed #f84563;
  }
  &.no-edit-style {
    border: 4px dashed #458df8;
    cursor: pointer;
  }
  .line-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .edit-icon-container {
    position: absolute;
    $iconWidth: 8px;
    box-sizing: border-box;
    .edit-icon {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      box-sizing: border-box;
      border: 1px solid #458df8;
      width: $iconWidth;
      height: $iconWidth;
      background-color: #fff;
    }
    &-tl,
    &-tr,
    &-bl,
    &-br {
      width: $iconContainerWidth;
      height: $iconContainerWidth;
      z-index: 999;
    }
    &-tl {
      left: -$iconContainerWidth/2;
      top: -$iconContainerWidth/2;
      cursor: nwse-resize;
    }
    &-tr {
      top: -$iconContainerWidth/2;
      right: -$iconContainerWidth/2;
      cursor: nesw-resize;
    }
    &-bl {
      left: -$iconContainerWidth/2;
      bottom: -$iconContainerWidth/2;
      cursor: nesw-resize;
    }
    &-br {
      right: -$iconContainerWidth/2;
      bottom: -$iconContainerWidth/2;
      cursor: nwse-resize;
    }
    &-tm,
    &-ml,
    &-mr,
    &-bm {
      z-index: 998;
    }
    &-ml {
      left: -$iconContainerWidth/2;
      top: 0;
      height: 100%;
      width: $iconContainerWidth;
      cursor: ew-resize;
    }
    &-tm {
      top: -$iconContainerWidth/2;
      width: 100%;
      height: $iconContainerWidth;
      cursor: ns-resize;
    }
    &-mr {
      top: 0;
      right: -$iconContainerWidth/2;
      height: 100%;
      width: $iconContainerWidth;
      cursor: ew-resize;
    }
    &-bm {
      bottom: -$iconContainerWidth/2;
      width: 100%;
      height: $iconContainerWidth;
      cursor: ns-resize;
    }
  }
}
</style>
