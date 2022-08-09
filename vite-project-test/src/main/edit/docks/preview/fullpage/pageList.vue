<template>
  <div class="page-thumbnails" :class="{active: !collapsePageThumb}">
    <draggable
      v-model="pages"
      tag="ul"
      class="page-drag-container"
      :animation="200"
    >
      <li
        v-for="(item, index) in pages"
        :key="index"
        class="page-thumbnail"
        :class="{active: index === activePageIdx}"
        @mousedown="checkoutPage(index)"
        @contextmenu="handleContextMenu($event, index)"
      >
        <p>
          {{ index+1 }}
        </p>
      </li>
    </draggable>
    <div class="page-option">
      <i class="el-icon-circle-plus" @click="add"></i>
    </div>
    <ul
      v-if="showCtxMenu"
      v-click-outside="closeCtxMenu"
      class="pages-contenxt-menu"
      :style="ctxMenuStyle"
    >
      <li @click="clickCtxMenu('cut')">
        剪切
      </li>
      <li @click="clickCtxMenu('copy')">
        拷贝
      </li>
      <li @click="clickCtxMenu('paste')">
        粘贴
      </li>
      <li @click="clickCtxMenu('duplicate')">
        复制
      </li>
      <li class="del-page" @click="clickCtxMenu('delete')">
        删除
      </li>
    </ul>
    <i class="icon-collapse el-icon-arrow-right" @click="togglePageThumbCollapse"></i>
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapActions, mapMutations
} from 'vuex';
import _ from 'lodash';

import * as utils from '@/utils';

export default {
  components: {
  },
  data() {
    return {
      showCtxMenu: false,
      collapsePageThumb: false,
      ctxMenuPos: {
        x: 0,
        y: 0
      }
    };
  },
  computed: {
    activePage() {
      return this.fullpageNodes[this.activePageIdx];
    },
    ...mapState([
      'nodes',
      'activePageIdx',
      'platform',
      'activeNodeId'
    ]),
    ...mapGetters([
      'fullpageNodes'
    ]),
    pages: {
      get() {
        return this.fullpageNodes;
      },
      set(val) {
        let pageIndex = 0;
        const preNode = this.activePage;
        const fullpageNodesIndex = this.fullpageNodes.map(fullpageNode => this.nodes.indexOf(fullpageNode));
        this.nodes.forEach((node) => {
          if (node.nodeCategory === 'fullpageContainer') {
            this.replaceNode({
              newNode: val[pageIndex],
              parentList: this.nodes,
              index: fullpageNodesIndex[pageIndex]
            });
            pageIndex += 1;
          }
        });
        const newIndex = this.fullpageNodes.indexOf(preNode);
        if (newIndex !== -1) {
          this.changeActivePageIdx(newIndex);
        }
      }
    },
    ctxMenuStyle() {
      return {
        left: `${this.ctxMenuPos.x}px`,
        top: `${this.ctxMenuPos.y}px`
      };
    },
  },
  watch: {
    activePage(newVal) {
      if (!newVal && this.fullpageNodes.length && this.activePageIdx >= this.fullpageNodes.length) {
        this.changeActivePageIdx(this.fullpageNodes.length - 1);
      }
    },
    platform() {
      this.changeActivePageIdx(0);
    },
  },
  methods: {
    ...mapMutations(['changeActivePageIdx', 'replaceNode']),
    ...mapActions(['addFullScreenRootNode', 'updateActiveNodeId']),
    togglePageThumbCollapse() {
      this.collapsePageThumb = !this.collapsePageThumb;
    },
    closeCtxMenu() {
      this.showCtxMenu = false;
    },
    handleContextMenu(ev, pageIndex) {
      ev.preventDefault();
      this.changeActivePageIdx(pageIndex);
      this.ctxMenuPos.x = ev.layerX;
      this.ctxMenuPos.y = ev.layerY;
      this.showCtxMenu = true;
    },
    async add() {
      await this.addFullScreenRootNode();
      this.changeActivePageIdx(this.fullpageNodes.length - 1);
    },
    clickCtxMenu(actionType) {
      const originPageData = _.cloneDeep(this.activePage);
      switch (actionType) {
      case 'duplicate':
        this.$store.dispatch('addNode', {
          index: this.nodes.indexOf(this.activePage) + 1,
          config: {
            ...originPageData,
            alias: `${this.activePage.alias}副本`,
            id: utils.newId(),
            children: originPageData.children
                  && utils.traverseNodes(originPageData.children, (item) => utils.initializeConfig(item))
          }
        });
        this.showCtxMenu = false;
        break;
      case 'delete':
        const activeId = this.activePage.id;
        this.changeActivePageIdx(Math.max(0, this.nodes.indexOf(this.activePage) - 1));
        this.$store.dispatch('removeNode', { id: activeId });
        this.showCtxMenu = false;
        break;
      case 'cut':
        console.log('todo: cut');
        break;
      case 'copy':
        console.log('todo: copy');
        break;
      case 'paste':
        console.log('todo: paste');
        break;
      default:
      }
    },
    checkoutPage(newIdx) {
      setTimeout(() => {
        this.changeActivePageIdx(newIdx);
        // 等待元素渲染完成后激活元素
        this.$nextTick(() => {
          if (!this.activeNodeId) {
            this.updateActiveNodeId(this.activePage.id);
          }
        });
      }, 0);
    },
  }
};
</script>

<style lang="scss" scoped>
@import "@/var";

.page-thumbnails {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 30px;
  // height: calc(100% - 8px);
  overflow: visible;
  background: #fff;
  z-index: 1;
  transform: translateX(-100%);
  transition: all 0.3s;
  font-size: 20px;
  text-align: center;
  .icon-collapse {
    position: absolute;
    right: -16px;
    top: 0;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s;
    transform-origin: left 20px center;
  }

  &.active {
    transform: translateX(0);

    .icon-collapse {
      transform: rotate(180deg);
    }
  }
}

.page-drag-container {
  max-height: 100%;
  padding: 0 2px;
  overflow: auto;
}

.page-thumbnail {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
  color: $primary-color;
  background: $primary-bgcolor;
  cursor: pointer;

  &:hover,
  &.active {
    background: $active-bgcolor;
    color: $active-color;
  }

  &:not(:last-child) {
    margin-bottom: 10px;
  }
}

.page-option {
  width: 100%;
  padding: 10px 0;
  text-align: center;

  .el-icon-circle-plus {
    font-size: 20px;
    color: $primary-bgcolor;

    &:hover {
      color: $active-bgcolor;
    }
    cursor: pointer;
  }
}

.pages-contenxt-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 60px;
  font-size: 13px;
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(#000, 0.1);
  border: 1px solid #ddd;
  border: 1px solid rgba(#000, 0.1);
  padding: 5px 0;
  background: #fff;
  text-align: center;

  li {
    font-weight: 400;
    line-height: 1.4;
    color: #333;
    padding: 5px 15px;

    &:hover {
      background-color: #f1f1f1;
      color: #717171;
    }
  }

  .del-page {
    border-top: 1px solid #e5e5e5;
  }
}
</style>
