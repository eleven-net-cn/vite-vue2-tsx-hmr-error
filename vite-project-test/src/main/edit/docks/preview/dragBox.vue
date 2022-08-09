<template>
  <div
    v-show="curDragElClientRect.el" :style="dragBoxStyle" class="drag-box"
    :class="containerClass"
  >
    <div v-show="curDragElClientRect.areaKey === 'top'" class="top-line outer-line"></div>
    <div v-show="curDragElClientRect.areaKey === 'bottom'" class="bottom-line outer-line"></div>
  </div>
</template>

<script>
import {
  mapMutations, mapState, mapActions, mapGetters
} from 'vuex';
import { getParentList } from '@/utils/dom';
import * as utils from '@/utils';
// import constants from '@/constants';

export default {
  data() {
    return {
      curDragMessage: {},
      // 拖拽之前的状态
      preOpacity: undefined,
      prePointerEvents: undefined,
      curDragElClientRect: {},
      dragElMsg: null,
    };
  },
  computed: {
    ...mapState(['canvasTransformData', 'platMsg', 'nodesProInPage', 'nodes', 'mouseDownPosition', 'activeNodeId']),
    ...mapGetters(['viewport', 'mapProNodes', 'viewPortRem']),
    dragBoxStyle() {
      const {
        x, y, width, height
      } = this.curDragElClientRect;
      const { offsetLeft, offsetTop } = this.canvasTransformData;
      return {
        width: `${width}px`,
        height: `${height}px`,
        left: `${x - offsetLeft}px`,
        top: `${y - offsetTop}px`
      };
    },
    isNormalPage() {
      return this.platMsg.mode === 'normal';
    },
    showContainerLine() {
      return this.curDragElClientRect.areaKey === 'innerTop' || this.curDragElClientRect.areaKey === 'innerBottom';
    },
    containerClass() {
      return { 'top-inner-line': this.curDragElClientRect.areaKey === 'innerTop', 'bottom-inner-line': this.curDragElClientRect.areaKey === 'innerBottom' };
    }
  },
  created() {
    this.setListener();
  },
  beforeDestroy() {
    this.removeListener();
  },
  methods: {
    ...mapActions(['updateActiveNodeId', 'updateNodeBoxStyle', 'addNode', 'removeNode', 'moveNodeIndex']),
    ...mapMutations(['updateDuringDrag']),
    setListener() {
      document.addEventListener('dragstart', this.dragStart);
      document.addEventListener('dragover', this.dragOver);
      document.addEventListener('dragend', this.dragEnd);
    },
    removeListener() {
      document.removeEventListener('dragstart', this.dragStart);
      document.removeEventListener('dragover', this.dragOver);
      document.addEventListener('dragend', this.dragEnd);
    },
    isCompNode(el) {
      return el.getAttribute('nodeid');
    },
    // 找到当前布局根元素
    findRootNode(el) {
      return this.curDragMessage.rootContainers.find(root => root.contains(el));
    },
    getNodeActiveEl(id) {
      return this.nodesProInPage[id]?.activeEl;
    },
    // 元素本身是否可以拖入新节点
    canAppend(el, id) {
      if (!id) return false;
      const nodePro = this.mapProNodes[id];
      // 没有不能append标识，并且能够append元素,并且不受元素类型限制
      let canAppend = !el.hasAttribute('noappend') && nodePro.canNestable;
      const canAppendList = nodePro.declarations.canAppendList;
      if (canAppendList) {
        canAppend = canAppend && canAppendList.some(item => {
          if (typeof item === 'string') {
            return this.curDragMessage.compName.endsWith(item);
          }
          return false;
        });
      }
      return canAppend;
    },
    // 子元素是否可以拖入新节点
    childCanAppend(nodePro) {
      const childId = nodePro.currentNode.children?.[0]?.id;
      const childProNode = this.mapProNodes[childId];
      const childProNodeInPage = this.nodesProInPage[childId];
      const nodesProInPage = this.nodesProInPage[nodePro.id];
      if (!childProNodeInPage || nodesProInPage.activeEl?.hasAttribute('nochildedit')) return false;
      if (this.canAppend(childProNodeInPage.activeEl, childId)) {
        return childProNode;
      }
      return this.childCanAppend(childProNode);
    },
    // 父元素是否可以拖入新节点
    parentCanAppend(el, nodePro) {
      const { parentNode } = nodePro;
      const isNormalRoot = !this.isCompNode(el.parentElement) && this.findRootNode(el).hasAttribute('rootnodeid') && (!parentNode || !this.nodesProInPage[parentNode.id].activeEl?.contains(el));
      const canBefore = !el.hasAttribute('nobefore');
      const isRelative = el.style.position === 'relative' || !el.style.position;
      return (isNormalRoot || (parentNode && this.canAppend(this.getNodeActiveEl(parentNode.id), parentNode.id))) && canBefore && isRelative;
    },
    // 寻找可以append的容器
    checkoutBoxAvailable(el) {
      // 判断当前元素是否可被放置
      if (!el || !this.curDragMessage.rootContainers.some((root) => root.contains(el))) return;
      let nodePro;
      // 一共有两种类别，一种是node本身，一种是在拖拽screen内，但不是可视化元素。
      if (this.isCompNode(el)) {
        const id = el.getAttribute('nodeid');
        nodePro = this.mapProNodes[id];
      } else {
        const rootEl = this.findRootNode(el);
        const rootNodeId = rootEl.getAttribute('rootnodeid');
        // 没有id则代表为normal模式下的main屏幕
        if (!rootNodeId) {
          return {
            el: rootEl,
            type: {
              canAppend: true,
              canbefore: false
            }
          };
        }
        nodePro = this.mapProNodes[rootNodeId];
        // eslint-disable-next-line no-param-reassign
        el = this.getNodeActiveEl(rootNodeId);
      }
      const { parentProNode } = nodePro;
      const parentId = parentProNode?.id;
      // 1、元素本身是否可以放入内容
      const canAppend = this.canAppend(el, nodePro.id);
      // 2、父元素是否可以放入内容
      const parentCanAppend = this.parentCanAppend(el, nodePro);
      // 都可以放入的情况下
      if (canAppend || parentCanAppend) {
        return {
          el,
          parentProNode,
          nodePro,
          type: {
            canAppend,
            canbefore: parentCanAppend
          }
        };
      }
      // 都不能放入的情况下寻找能够放入的子节点
      const canAppendChildNodePro = this.childCanAppend(nodePro);
      if (canAppendChildNodePro) {
        const { id } = canAppendChildNodePro;
        return {
          el: this.getNodeActiveEl(id),
          parentProNode: canAppendChildNodePro.parentProNode,
          nodePro: canAppendChildNodePro,
          type: {
            canAppend: true,
            canbefore: false
          }
        };
      }
      // 其余情况下继续向上搜寻
      return this.checkoutBoxAvailable(this.getNodeActiveEl(parentId) || el.parentElement);
    },
    dragOver(e) {
      // 如果不是本类别的拖拽，则停止代码
      if (!this.curDragMessage.compName) {
        return;
      }
      // 取消默认拖拽事件
      e.preventDefault();
      const { dragType } = this.curDragMessage;
      // 如果当前行为是添加的拖拽，则将拖拽行为设置为none，让在拖拽失败的情况下其以页面原生的形式回去
      if (dragType === 'add') {
        e.dataTransfer.dropEffect = 'none';
      } else {
        // 如果为移动，则任何情况，都不考虑原生的过渡
        e.dataTransfer.dropEffect = 'move';
        // 设置当前拖拽的位置
        this.setDragElPosition(e);
      }
      // 如果拖拽阈值没有超过40px则取消
      const moveX = e.pageX - this.mouseDownPosition.x;
      const moveY = e.pageY - this.mouseDownPosition.y;
      // 拖拽断定优化
      if ((Math.abs(moveY) < 40 && Math.abs(moveX) < 40)) {
        // 取消的同时清空拖拽信息
        this.curDragElClientRect = {};
        return;
      }
      // 判断当前拖拽的类别，如果不存在拖拽对象则清空选择
      const availableBox = this.checkoutBoxAvailable(e.target);
      if (!availableBox) {
        this.curDragElClientRect = {};
        return;
      }
      let curElRect;
      // 拿到当前元素父组件容器的宽高信息
      if (!this.curDragElClientRect.el || this.curDragElClientRect.target !== availableBox.el) {
        curElRect = availableBox.el.getBoundingClientRect();
      } else {
        curElRect = this.curDragElClientRect;
      }
      // 拿到鼠标所在当前元素的信息以及放置信息
      // 通过信息判断该drap模式下的各种状态
      // 以5px作为元素的边缘位置
      const borderAreaLength = 20;
      // 每个元素留有最少5px宽高的内容区域代表放置区在元素内部
      const mainAreaLength = 20;
      // 判断鼠标所在元素的方位
      // 首先确定内容区域，内容区域为元素宽高减去元素的边
      const mainAreaHeight = Math.min(curElRect.height, Math.max(mainAreaLength, curElRect.height - borderAreaLength * 2));
      // 计算出mainArea宽高
      const mainArea = {
        width: curElRect.width,
        height: mainAreaHeight
      };
        // 计算出真实的边缘位置长度
      const realBorderAreaY = (curElRect.height - mainAreaHeight) / 2;
      // 计算出主内容区的y轴
      mainArea.x = 0;
      mainArea.y = realBorderAreaY;
      let curAreaMap = {};
      const { canAppend, canbefore } = availableBox.type;
      if (canAppend && canbefore) {
        curAreaMap = {
          top: [undefined, mainArea.y],
          innerTop: [mainArea.y, curElRect.height / 3],
          innerBottom: [curElRect.height / 3, mainArea.y + mainArea.height],
          bottom: [mainArea.y + mainArea.height, undefined]
        };
      } else if (canAppend) {
        curAreaMap = {
          innerTop: [undefined, curElRect.height / 3],
          innerBottom: [curElRect.height / 3, undefined],
        };
      } else {
        curAreaMap = {
          top: [undefined, curElRect.height / 2],
          bottom: [curElRect.height / 2, undefined],
        };
      }
      const offsetY = e.pageY - curElRect.y;
      const areaKey = Object.keys(curAreaMap).find(key => {
        if (curAreaMap[key][0] === undefined) {
          return offsetY < curAreaMap[key][1];
        }
        if (curAreaMap[key][1] === undefined) {
          return curAreaMap[key][0] <= offsetY;
        }
        return curAreaMap[key][0] <= offsetY && offsetY < curAreaMap[key][1];
      });
      let newIndex;
      let oldIndex;
      // 拿到当前拖拽动作将要放置的list
      let dropList;
      // 当前拖拽元素的父元素list
      let dragParentList;
      // 当前拖拽需要放置的parentProNode
      let dropParentProNode;
      if (areaKey === 'innerTop' || areaKey === 'innerBottom') {
        dropParentProNode = availableBox.nodePro;
        // 当前节点下的childList
        dropList = dropParentProNode ? availableBox.nodePro.currentNode.children : this.nodes;
        if (!dropList) {
          newIndex = 0;
        } else {
          newIndex = areaKey === 'innerTop' ? 0 : dropList.length;
        }
      } else {
        dropParentProNode = availableBox.nodePro.parentProNode;
        // 拿到父节点的list
        dropList = availableBox.nodePro.parentProNode?.currentNode.children || this.nodes;
        // 拿到当前所在元素的index
        const currentIndex = dropList.findIndex(node => availableBox.nodePro.currentNode === node);
        newIndex = areaKey === 'top' ? currentIndex : currentIndex + 1;
      }
      const invalid = false;
      // 如果拖拽的节点与拖拽后的节点位置为同一个父层级
      if (this.curDragMessage.dragType === 'move') {
        // 拿到当前拖拽节点的父节点list
        dragParentList = this.curDragMessage.targetProNode.parentProNode?.currentNode.children || this.nodes;
        // 当前拖拽节点的真实node
        const dragNode = this.curDragMessage.targetProNode.currentNode;
        // 拿到当前拖拽节点在
        oldIndex = dragParentList.findIndex(node => dragNode === node);
        // 如果在同一个list下，
        if (dropList === dragParentList) {
          // 比较index，如果oldIndex在newIndex前，则新的节点位置应该-1
          if (oldIndex < newIndex) {
            newIndex -= 1;
          }
          // 其他情况下都不影响元素拖拽位移
        }
        // 如果是同一层级，并且元素不是relative，则index不变
        if (dragNode.boxStyle.position !== 'relative' && dropList === dragParentList) {
          newIndex = oldIndex;
        }
        // 如果元素的position不是relative，则将元素加入到最后去
        if (dragNode.boxStyle.position !== 'relative') {
          newIndex = dropList === dragParentList ? dropList.length - 1 : dropList.length;
        }
      }
      // 在add模式下如果是有效的拖动则取消原生拖动动画
      if (dragType === 'add') {
        e.dataTransfer.dropEffect = 'move';
      }
      this.curDragElClientRect = {
        invalid,
        // 当前拖拽容器区域的坐标信息
        width: curElRect.width,
        height: curElRect.height,
        x: curElRect.x,
        y: curElRect.y,
        // 当前拖拽盒子的信息
        curDragMessage: this.curDragMessage,
        // 当前拖拽元素放置的index
        oldIndex,
        newIndex,
        // 当前拖拽动作需要放置的list
        dropList,
        // 当前拖拽元素所在的父元素list
        dragParentList,
        dropParentProNode,
        el: availableBox.el,
        // 当前添加的状态
        areaKey,
        pageX: e.pageX,
        pageY: e.pageY
      };
    },
    async dragEnd(e) {
      // 监听到拖拽结束，如果非组件拖拽，则忽略
      if (!this.curDragMessage.compName) {
        return;
      }
      // 将拖拽记为结束
      this.updateDuringDrag(false);
      // 固定当前的拖拽信息
      const curDragMessage = this.curDragMessage;
      this.curDragMessage = {};
      e.target.removeAttribute('isdragmove');
      // 拿到当前拖拽元素的信息
      const dragElMsg = this.dragElMsg;
      this.dragElMsg = {};
      // 如果为add，则不存在el
      const dragEl = dragElMsg?.el;
      const { pageX, pageY } = this.curDragElClientRect;
      // 如果没有放置位置信息，或者当前放置是无效的，则返回被拖拽组件本身的id,如果为新加组件，则返回的元素为空
      const invalid = !this.curDragElClientRect.areaKey || this.curDragElClientRect.invalid;
      let node;
      if (invalid) {
        node = curDragMessage.targetProNode?.currentNode;
      } else {
        node = await this.dragAction(curDragMessage);
      }
      // 在add的时候，如果add失效则id为空
      const targetId = node?.id;
      // 拖拽结束后清空当前拖拽信息
      this.curDragElClientRect = {};
      // 当为新加组件，并且拖拽无效后，会返回为空的id,则不再进行流程
      if (!targetId) return;
      // 这时候，组件已经append入页面的节点，在requestAnimationFrame之后就可以拿到节点渲染在dom上的最新信息
      requestAnimationFrame(async () => {
        // 下一帧之前元素已经放置，拿到目标元素id对应的真实的dom
        const curEl = this.getNodeActiveEl(targetId);
        let parentStyle;
        const parentContainer = getParentList(curEl).find(el => {
          parentStyle = window.getComputedStyle(el);
          return parentStyle.position !== 'static';
        });
        // 父元素为flex容器，则设置成为ralative
        if (parentStyle.display.includes('flex')) {
          this.updateNodeBoxStyle({
            node,
            options: {
              position: 'relative',
              left: undefined,
              top: undefined,
              right: undefined,
              bottom: undefined
            }
          });
        }
        const notRelative = node.boxStyle.position !== 'relative';
        const isAbsolute = node.boxStyle.position === 'absolute';
        // 有效的absilute元素的拖拽可以将元素放到指定位置
        if (!invalid && isAbsolute) {
          // 拿到可以定位的父容器
          const { scale } = this.canvasTransformData;
          // 拿到父容器的scrollHeight和scrollWidth
          const { scrollTop, scrollLeft } = parentContainer;
          const { left, top } = parentContainer.getBoundingClientRect();
          const realTop = top - scrollTop * scale;
          const realLeft = left - scrollLeft * scale;
          // 鼠标相对于布局的left值
          const layoutLeft = pageX - realLeft;
          const layoutTop = pageY - realTop;
          // 拿到元素的缩放后的宽高
          const { width, height } = curEl.getBoundingClientRect();
          const positionOptions = {
            left: utils.px2rem(Math.max((layoutLeft - width / 2) / scale, 0)),
            top: utils.px2rem(Math.max((layoutTop - height / 2) / scale, 0)),
            right: undefined,
            bottom: undefined
          };
          // 如果元素占据屏幕总宽度，则left设置为0
          if (node.boxStyle.width === `${this.viewPortRem.width}rem`) {
            positionOptions.left = '0rem';
          }
          this.updateNodeBoxStyle({
            node,
            options: positionOptions
          });
        }
        await this.$nextTick();
        // 拿到将要放置的区域的兄弟节点
        const childList = [...curEl.parentElement.children].filter(el => el !== curEl);
        const curRectList = [];
        const preRectList = [];
        // 拖拽目标元素拿到放置后的拖拽元素的状态，直接过渡
        const curElRect = curEl.getBoundingClientRect();
        // 通过dragEl判断是否是新添加元素
        // 新添加的元素不需要进行拖拽物的过渡效果
        if (dragEl) {
          // 记录当前元素的透明度，并设置为0
          const preOpcity = curEl.style.opacity;
          curEl.style.opacity = 0;
          // 将模拟拖拽元素dom的定位使用transform模拟成当前真实渲染的dom的定位并进行缩放
          dragEl.style.transform = `translate(${curElRect.left - dragElMsg.preLeft}px,${curElRect.top - dragElMsg.preTop}px) scale(${dragElMsg.scale})`;
          // 将模拟元素的宽高设置成真实元素缩放前的宽高
          dragEl.style.width = `${curElRect.width / dragElMsg.scale}px`;
          dragEl.style.height = `${curElRect.height / dragElMsg.scale}px`;
          // 将元素透明过渡为真实dom程度
          dragEl.style.opacity = preOpcity;
          // 设置过渡动画
          dragEl.style.transition = 'all 200ms ease-out';
          // 在过渡动画结束后移除模拟拖拽的元素，并且将真实dom的opacity设置成为原来的样子
          const removedragElTransition = () => {
            dragEl.removeEventListener('transitionend', removedragElTransition);
            curEl.style.opacity = preOpcity;
            dragEl.remove();
          };
          dragEl.addEventListener('transitionend', removedragElTransition);
        }
        if (notRelative) {
          // 如果是absolute元素则不会影响到兄弟节点的定位，所以不需要给兄弟节点过渡
          return;
        }
        // 下面是 FLIP 过渡的应用
        // 先拿到拖拽后的状态
        childList.forEach((el, index) => {
          // 如果是兄弟元素，则记录元素放置后的状态
          curRectList[index] = el.getBoundingClientRect();
        });
        // 拿完元素的真实状态后，再将元素隐藏，拿取元素过渡动画起始位置的状态
        curEl.setAttribute('isdragmove', 'true');
        // 设置transform，拿到过渡之前的状态
        childList.forEach((el, index) => {
          if (el === curEl) return;
          // 拿到元素当前的状态,设置transform和transition
          preRectList[index] = el.getBoundingClientRect();
          el.style.transform = `translate(${preRectList[index].left - curRectList[index].left}px,${preRectList[index].top - curRectList[index].top}px)`;
        });
        // 还原所有元素的位置
        curEl.removeAttribute('isdragmove');
        // 在元素渲染出来后的下一帧开始将transform还原，开始进行过渡动画
        requestAnimationFrame(() => {
          curRectList.forEach((rect, index) => {
            const el = childList[index];
            el.style.transition = 'transform 200ms ease-in-out';
            // 移除元素的位置偏移
            el.style.transform = '';
            const removeTransition = () => {
              el.style.transition = '';
              el.removeEventListener('transitionend', removeTransition);
            };
            el.addEventListener('transitionend', removeTransition);
          });
        });
      });
    },
    // 拖拽结束后执行当前的拖拽行为
    async dragAction(curDragMessage) {
      const {
        dropList, dragParentList, newIndex, oldIndex, dropParentProNode
      } = this.curDragElClientRect;
      const dropParentId = dropParentProNode?.currentNode.id;
      const {
        dragType, compName, targetProNode, beData
      } = curDragMessage;
      let node;
      if (dragType === 'move') {
        node = targetProNode.currentNode;
        this.moveHandler({
          node, dragParentList, dropList, oldIndex, newIndex, dropParentId
        });
      } else {
        node = await this.addHandler(compName, dropParentId, beData, newIndex, noPosition);
      }
      const proNode = this.mapProNodes[node.id];
      const { noPosition, noDrag } = proNode.editOptions;
      if (!noPosition) {
        // 全屏模式下或者(不在最外层或者在最外层但元素不为容器元素)如果元素加入都改为absolute,但是不存在noPosition的时候，进行状态变更
        if ((this.platMsg.body.fullScreen || dropParentId || !proNode.canNestable) && dragType !== 'move' && node.boxStyle.position === 'relative') {
          this.updateNodeBoxStyle({
            node,
            options: {
              position: 'absolute'
            }
          });
        }
        // 全屏模式下，如果目标节点不是根节点，并且不是根容器节点，并且容器是fixed定位，则将fixed定位设置成absolute定位
        if (this.platMsg.body.fullScreen && dropParentProNode && dropParentProNode.currentNode.nodeCategory !== 'fullpageContainer' && node.boxStyle.position === 'fixed') {
          this.updateNodeBoxStyle({
            node,
            options: {
              position: 'absolute'
            }
          });
        }
      }
      // 如果元素的定位不是relative的话，则将定位放置为最高
      if (node.boxStyle.position !== 'relative') {
        if (node.boxStyle.position === 'fixed' && noPosition && noDrag && !this.platMsg.body.fullScreen) {
          this.removeNode({ parentList: dropList, id: node.id });
          this.addNode({ config: node });
        }
        // 化成absolute的时候层级放置为最高，防止被遮挡
        this.moveNodeIndex({ type: 'last', id: node.id });
      }
      return node;
    },
    // 元素变化放置位置的操作
    moveHandler({
      node, dragParentList, dropList, oldIndex, newIndex, dropParentId
    }) {
      this.removeNode({ parentList: dragParentList, index: oldIndex });
      this.addNode({ parentId: dropParentId, index: newIndex, config: node });
      // 如果拖拽过后不在同一个位置父层级位置了，并且元素是absolute的则将top和left清零
      if (dragParentList !== dropList && node.boxStyle.position === 'absolute' && !this.mapProNodes[node.id].editOptions.noPosition) {
        this.updateNodeBoxStyle({
          node,
          options: {
            left: '0rem',
            top: '0rem',
            right: undefined,
            bottom: undefined
          }
        });
      }
    },
    async addHandler(compName, dropParentId, beData, newIndex) {
      // 以下是add的逻辑
      const node = await this.addNode({
        compName,
        index: newIndex,
        parentId: dropParentId,
        beData
      });
      // 添加元素等待下一帧渲染完成后再选中
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.updateActiveNodeId(node.id);
        });
      });
      return node;
    },
    // 设置拖拽中的模拟元素位置
    setDragElPosition(e) {
      const translateX = `${e.pageX - this.dragElMsg.preX + this.dragElMsg.scaleTranslateX}px`;
      const translateY = `${e.pageY - this.dragElMsg.preY + this.dragElMsg.scaleTranslateY}px`;
      this.dragElMsg.el.style.transform = `translate(${translateX},${translateY}) scale(${this.dragElMsg.scale * this.dragElMsg.exScale})`;
    },
    // 开始拖动时，元素消失，开始兄弟节点们的过渡动画
    startBrothersTransition({ brothers, beforeTransition }) {
      // 拿到所有兄弟元素的信息
      const preRectList = [];
      brothers.forEach((el, index) => {
        // 拿到元素当前的状态
        preRectList[index] = el.getBoundingClientRect();
      });
      // 过渡动画开始之前的钩子，用于改变状态
      beforeTransition();
      brothers.forEach((el, index) => {
        const preRect = preRectList[index];
        // 拿到元素消失后的兄弟元素的状态，并设置兄弟元素的过渡效果
        const curRect = el.getBoundingClientRect();
        // 计算左右偏移了多少，上下偏移了多少，如果都没有，则不需要过渡动画
        const left = preRect.left - curRect.left;
        const top = preRect.top - curRect.top;
        if (left === top === 0) return;
        el.style.transform = `translate(${left}px,${top}px)`;
        // 下一帧渲染之前，将transform清空，开始过渡
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 设置过渡效果
            el.style.transition = 'transform 200ms ease-in-out';
            el.style.transform = '';
            const removeTransition = () => {
              // 过渡完成后移除监听以及过渡样式
              el.style.transition = '';
              el.removeEventListener('transitionend', removeTransition);
            };
            el.addEventListener('transitionend', removeTransition);
          });
        });
      });
    },
    // 新增类型的拖放开始时的动作
    dragAddStartHandler({ name, target, rootContainers }) {
      // 后台数据
      let beData = target.getAttribute('be-data');
      try {
        beData = JSON.parse(beData);
      } catch (error) {
        beData = undefined;
      }
      this.curDragMessage = {
        compName: name,
        beData,
        dragType: 'add',
        el: target,
        rootContainers
      };
    },
    // 拿到拖拽复制的dom
    getDragCopyDomMsg({ target, pageX, pageY }) {
      // 将正在拖拽的节点进行复制
      const dragEl = target.cloneNode(true);
      // 拿到画布当前的缩放
      const { scale } = this.canvasTransformData;
      // 拿到目标元素当前的大小
      const {
        width, height, left, top
      } = target.getBoundingClientRect();
      // 拿到缩放前真实像素大小
      const preRealWidth = width / scale;
      const preRealHeight = height / scale;
      // 设置最大宽高，防止真实宽高过大
      const maxWidth = this.viewport.width * scale;
      const maxHeight = this.viewport.width * scale;
      let heightScale = 1;
      let widthScale = 1;
      if (height > maxHeight) {
        heightScale = maxHeight / height;
      }
      if (width > maxWidth) {
        widthScale = maxWidth / width;
      }
      // 设置额外的缩放
      const exScale = Math.min(heightScale, widthScale, 1);
      // 将元素模拟并定位到鼠标位置
      dragEl.style.opacity = 0;
      dragEl.style.position = 'fixed';
      dragEl.style.pointerEvents = 'none';
      dragEl.style.transformOrigin = 'left top';
      dragEl.style.left = `${left}px`;
      dragEl.style.top = `${top}px`;
      dragEl.style.width = `${preRealWidth}px`;
      dragEl.style.height = `${preRealHeight}px`;
      this.dragElMsg = {
        el: dragEl,
        scale,
        // 记录拖拽开始时的相对于浏览器的位置
        preLeft: left,
        preTop: top,
        // 记录鼠标最初的位置
        preX: pageX,
        preY: pageY,
        // 因为额外缩放而要设置的默认的x轴偏移
        scaleTranslateX: (width - width * exScale) / 2,
        scaleTranslateY: (height - height * exScale) / 2,
        // 额外的缩放
        exScale
      };
    },
    dragMoveStartHandler({
      e, nodeid, target, rootContainers
    }) {
      // 延时是为了drag事件不断掉
      setTimeout(() => {
        const brothers = [...e.target.parentElement.children].filter(el => el !== e.target);
        this.startBrothersTransition({
          brothers,
          beforeTransition: () => {
            // 将元素消失
            e.target.setAttribute('isdragmove', 'true');
          }
        });
      }, 0);
      this.getDragCopyDomMsg({ target, pageX: e.pageX, pageY: e.pageY });
      const { el: dragEl } = this.dragElMsg;
      this.setDragElPosition(e);
      document.body.appendChild(dragEl);
      e.dataTransfer.setDragImage(dragEl, 0, 0);
      requestAnimationFrame(() => {
        // 设置拖动元素的opacity
        dragEl.style.opacity = 0.2;
      });
      this.curDragMessage = {
        dragType: 'move',
        compName: this.mapProNodes[nodeid].currentNode.name,
        nodeid,
        targetProNode: this.mapProNodes[nodeid],
        el: target,
        rootContainers
      };
    },
    dragStart(e) {
      const { target } = e;
      // 添加操作中的组件名
      const name = target.getAttribute('comp-name');
      // 移动操作需要的nodeid
      const nodeid = target.getAttribute('nodeid');
      // 清空当前拖拽信息
      this.curDragMessage = {};
      if (!name && !nodeid) {
        return;
      }
      // 告知全局当前正在拖拽的行为当中
      this.updateDuringDrag(true);
      // 寻找到所有rootNodeId表示可以拖放的根节点
      const rootContainers = [...document.querySelectorAll('[rootnodeid]')];
      if (this.activeNodeId) {
        // 开始拖动组件时清空当前正在编辑的组件激活状态
        this.updateActiveNodeId('');
      }
      // 如果为添加节点操作
      if (name) {
        this.dragAddStartHandler({ name, target, rootContainers });
        return;
      }
      this.dragMoveStartHandler({
        e, nodeid, target, rootContainers
      });
    },
  },

};
</script>
<style lang="scss">
// 将正在拖拽中的元素隐藏
[isdragmove] {
  display: none !important;
}
</style>
<style lang="scss" scoped>
$dragLineColor: rgb(228, 116, 230, 0.8);
$lineWidth: 4px;
$shadowWidth: 20px;
.drag-box {
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  &.top-inner-line {
    border: $lineWidth solid $dragLineColor;
    background-image: linear-gradient(
      to bottom,
      $dragLineColor 0%,
      transparent 5%
    );
  }
  &.bottom-inner-line {
    border: $lineWidth solid $dragLineColor;
    background-image: linear-gradient(
      to top,
      $dragLineColor 0%,
      transparent 5%
    );
  }
  .outer-line {
    position: absolute;
    height: $shadowWidth;
    width: 100%;
    left: 0;
    &.top-line {
      top: -$shadowWidth;
      background-image: linear-gradient(
        to top,
        $dragLineColor 0%,
        transparent 100%
      );
    }
    &.bottom-line {
      bottom: -$shadowWidth;
      background-image: linear-gradient(
        to bottom,
        $dragLineColor 0%,
        transparent 100%
      );
    }
  }
}
</style>
