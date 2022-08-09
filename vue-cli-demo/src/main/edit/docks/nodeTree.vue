<template>
  <div class="puzzle-tree">
    <div class="node-search-wrapper">
      <el-input
        v-model="searchVal"
        size="mini"
        placeholder="搜索节点（支持别名、类型）"
        suffix-icon="el-icon-search"
      >
      </el-input>
      <i v-show="searchVal" class="el-icon-error" @click="searchVal = ''"></i>
    </div>
    <el-tree
      :data="searchResults"
      :show-checkbox="false"
      highlight-current
      node-key="id"
      :default-expanded-keys="expandedKeys"
      :props="defaultProps"
      draggable
      :allow-drop="allowDrop"
      :allow-drag="allowDrag"
      :expand-on-click-node="false"
      @node-drag-start="handlerDragStart"
      @node-drag-over="handlerDragOver"
      @node-click="handleClick"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      @node-drag-end="handleDragEnd"
    >
      <div slot-scope="{ node }" class="puzzle-tree-node">
        <div
          :ref="activeNodeId === node.data.id ? 'active' : ''"
          class="puzzle-tree-node-wrapper"
          :class="{
            active: activeNodeId === node.data.id
          }"
        >
          <el-input
            v-if="isEdit && activeId === node.data.id"
            v-model="node.data.alias"
            v-click-outside="handleOutside"
            class="puzzle-tree-input"
            :class="{'is-active': isEdit && activeId === node.data.id}"
            placeholder="请填写组件名"
            size="mini"
            :autofocus="true"
            @keyup.enter.native="handleOutside"
            @blur="handleOutside"
          >
          </el-input>
          <div
            class="puzzle-tree-node__text"
            @dblclick="handleEdit(node)"
          >
            <span v-if="!isEdit || activeId !== node.data.id">
              {{ node.label }}
            </span>
          </div>
          <div class="puzzle-tree-node__btns">
            <div v-if="!isPageCompType" class="puzzle-tree-node__btns-wrapper">
              <el-tooltip
                :offset="10"
                content="编辑"
                :enterable="false"
                placement="top"
              >
                <i class="el-icon-edit" @click.stop="handleEdit(node)"></i>
              </el-tooltip>
              <el-tooltip
                :offset="10"
                content="复制"
                :enterable="false"
                placement="top"
              >
                <i class="el-icon-copy-document" @click.stop="handleCopy(node)"></i>
              </el-tooltip>
              <el-tooltip
                :offset="10"
                :content="node.data.enabled ? '隐藏节点' : '显示节点'"
                :enterable="false"
                placement="top"
              >
                <span @click.stop="handleView(node)">
                  <img
                    v-if="node.data.enabled"
                    src="https://uploadstatic.mihoyo.com/bh3/upload/operation/202009/view_1601008066_1471.svg"
                  >
                  <img
                    v-else
                    src="https://uploadstatic.mihoyo.com/bh3/upload/operation/202009/view_off_1601008066_3003.svg"
                  >
                </span>
              </el-tooltip>
              <!-- <el-tooltip
                v-if="getNestable(node.data.name)"
                :offset="10"
                content="添加子节点"
                :enterable="false"
                placement="top"
              >
                <i
                  class="el-icon-circle-plus"
                  @click="handleOpenDialog(node)"
                >
                </i>
              </el-tooltip> -->
              <el-tooltip
                :offset="10"
                :content="isLocked(node) ? '解锁' : '锁定'"
                :enterable="false"
                placement="top"
              >
                <i
                  :class="!isLocked(node) ? 'el-icon-unlock' : 'el-icon-lock'"
                  @click.stop="handleLock(node)"
                >
                </i>
              </el-tooltip>
            </div>

            <el-tooltip
              :offset="10"
              content="删除"
              :enterable="false"
              placement="top"
            >
              <i
                class="el-icon-delete"
                @click="handleDelete(node)"
              >
              </i>
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-tree>

    <!-- <el-dialog
      title="添加子节点"
      :visible.sync="showDialog"
      width="600px"
    >
      <el-collapse v-model="activeNames">
        <el-collapse-item
          title="基础组件"
          name="base"
        >
          <div class="puzzle-comps">
            <div
              v-for="comp in compListArray"
              :key="comp.id" class="puzzle-comp"
              @click="handleAdd(comp)"
            >
              <i :class="comp.icon"></i>
              {{ comp.label }}
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-dialog> -->
  </div>
</template>

<script>
import {
  mapState, mapGetters, mapActions
} from 'vuex';
// import * as utils from '@/utils';

export default {
  props: {
    allNodes: {
      type: Array,
      default() {
        return [];
      }
    },
    searchNodesList: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      searchVal: '',
      expandedKeys: [],
      defaultProps: {
        label: 'alias'
      },
      nodesTree: [],
      isEdit: false,
      activeId: undefined, // 正在编辑名称的节点
      // activeNames: ['base', 'biz'],
      // showDialog: false,
      parentId: undefined,
      dragingParent: null
    };
  },
  computed: {
    ...mapState([
      'compList',
      'activeNodeId',
      'nodesEditOptions',
      'nodes'
    ]),
    ...mapGetters([
      'compListArray',
      'mapProNodes',
      'isPageCompType'
    ]),
    searchResults() {
      if (!this.searchVal) {
        return this.nodesTree;
      }
      return this.searchNodesList.filter(item => item.alias.indexOf(this.searchVal) > -1
          || item.name.indexOf(this.searchVal) > -1
          || item.label.indexOf(this.searchVal) > -1);
    }
  },
  watch: {
    activeNodeId: {
      handler(newVal) {
        const isExist = !!this.expandedKeys.find(item => item === newVal);
        if (!isExist) {
          this.expandedKeys.push(newVal);
        }
        setTimeout(() => {
          if (!this.isClicked) {
            this.scrollToActiveDom();
          } else {
            this.isClicked = false;
          }
        }, 100);
      },
      immediate: true,
    },
    nodes: {
      handler() {
        this.nodesTree = this.allNodes || [];
        this.nodesTree = [...this.nodesTree];
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapActions(['updateActiveNodeId', 'removeNode', 'addNode']),
    allowDrag(node) {
      if (node.data.id === this.activeId) {
        return false;
      }
      return true;
    },
    scrollToActiveDom() {
      const { active } = this.$refs;
      if (!active) {
        return;
      }
      setTimeout(() => {
        active.scrollIntoView();
      }, 500);
    },
    isLocked(node) {
      return this.nodesEditOptions[node.data.id]?.locked;
    },
    allowDrop(draggingNode, dropNode, type) {
      const { name } = dropNode.data;
      if (type === 'inner') {
        return this.getNestable(name) && !['fullpageContainer', 'dialog'].includes(draggingNode.data.nodeCategory);
      }
      return true;
    },
    handlerDragStart(node) {
      this.dragingParent = this.mapProNodes[node.data.id].parentNode;
    },
    handlerDragOver(node, node2, e) {
      e.dataTransfer.dropEffect = 'move';
      e.preventDefault();
    },
    handleDragEnd(draggingNode, dropNode, dropType) {
      if (!dropNode || dropType === 'none') return;
      const dropNodePro = this.mapProNodes[dropNode?.data.id];
      // 如果拖拽元素在最外层，则帮忙移除
      if (!this.dragingParent) {
        this.removeNode({ id: draggingNode.data.id, parentList: this.nodes });
      }
      if (dropType === 'before' || dropType === 'after') {
        // 如果终点元素在最外一层，则帮忙append
        if (!dropNodePro.parentNode) {
          const dropNodeIndex = this.nodes.indexOf(dropNode.data);
          this.addNode({ config: draggingNode.data, index: dropType === 'before' ? dropNodeIndex : dropNodeIndex + 1 });
        }
      }
    },
    getNestable(name) {
      return this.compList[name]?.main?.declarations?.nestable;
    },
    handleOutside() {
      this.isEdit = false;
      this.activeId = undefined;
    },

    handleCopy(node) {
      this.$store.dispatch('copyNode', { node: node.data });
    },

    handleView(node) {
      this.$store.dispatch('updateNodeConfig', {
        node: node.data,
        options: {
          enabled: !node.data.enabled,
        }
      });
    },

    handleLock(node) {
      if (node.data.id === this.activeNodeId) {
        this.updateActiveNodeId('');
      }
      this.$store.commit('updateNodesEditOptionsTemporary', {
        id: node.data.id,
        options: {
          locked: this.nodesEditOptions[node.data.id]?.locked === undefined ? true : !this.nodesEditOptions[node.data.id].locked,
        }
      });
    },

    // handleOpenDialog(node) {
    //   this.parentId = node.data.id;
    //   this.showDialog = true;
    // },

    handleNodeExpand(nodeConfig) {
      const target = this.expandedKeys.find(item => item === nodeConfig.id);
      if (!target) {
        this.expandedKeys.push(nodeConfig.id);
      }
    },
    handleNodeCollapse(nodeConfig) {
      const { children, id } = nodeConfig;
      const targetIndex = this.expandedKeys.findIndex(item => item === id);
      if (targetIndex !== -1) {
        this.expandedKeys.splice(targetIndex, 1);
      }
      if (Array.isArray(children)) {
        children.forEach(c => this.handleNodeCollapse(c));
      }
    },

    handleDelete(node) {
      this.$confirm('确认删除当前节点?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const nodeId = node.data.id;
        this.$store.dispatch('removeNode', { id: nodeId });
        this.$message({
          type: 'success',
          message: '已删除!'
        });
      }).catch(() => {});
    },

    handleEdit(node) {
      this.activeId = node.data.id;
      this.isEdit = true;
    },
    handleClick(node) {
      if (node.id === this.activeNodeId) {
        return;
      }
      this.isClicked = true;
      this.updateActiveNodeId(node.id);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/var.scss";

.puzzle-tree {
  height: 100%;
  overflow: auto;

  &-node {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    cursor: move;
    position: relative;

    &-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      cursor: move;
      position: relative;

      &.active {
        border: 2px solid skyblue;
        border-radius: 6px;
      }
    }

    .el-tooltip {
      margin-left: 5px;
    }

    &__text {
      cursor: text;
    }

    &__btns {
      display: flex;

      &-wrapper {
        display: flex;
      }

      i,
      span {
        cursor: pointer;
        font-size: 16px;
        margin-left: 5px;
      }

      span {
        display: block;
        width: 16px;

        img {
          display: block;
          width: 100%;
        }
      }

      .el-icon-lock {
        font-weight: bold;
        color: $primary-color;
      }
    }
  }

  &-input {
    width: 100px;
    position: absolute;
    left: 0;
    top: 4px;
    opacity: 0;

    &.is-active {
      opacity: 1;
    }
  }

  .puzzle-comps {
    display: flex;
    flex-wrap: wrap;

    .puzzle-comp {
      width: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
      margin: 0 10px;
      margin-bottom: 10px;
      flex-direction: column;
      font-size: 12px;
      height: 200px;
      i {
        font-size: 28px;
        margin-bottom: 6px;
      }
    }
  }
}

.node-search-wrapper {
  position: relative;

  .el-icon-error {
    position: absolute;
    right: 10px;
    top: 6px;
    font-size: 16px;
    cursor: pointer;
  }
}
</style>
