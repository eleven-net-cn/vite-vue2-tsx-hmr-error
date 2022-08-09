<template>
  <el-form-item label-width="53px">
    <el-tooltip slot="label" placement="top">
      <div slot="content">
        文档流：从上往下排列<br />
        浮动：可自由拖拽位置<br />
        吸附屏幕：悬浮在页面固定位置
      </div>
      <span>定位 <i class="el-icon-info" /></span>
    </el-tooltip>
    <el-radio-group v-model="position">
      <el-radio-button label="relative">
        文档流
      </el-radio-button>
      <el-radio-button label="absolute">
        浮动
      </el-radio-button>
      <el-radio-button v-if="canFixed" label="fixed">
        吸附屏幕
      </el-radio-button>
    </el-radio-group>
  </el-form-item>
</template>

<script>

export default {
  props: {
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    methods: {
      type: Object,
      default() {
        return {};
      }
    },
    envList: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    position: {
      set(newV) {
        const { id, brotherList, curIndex } = this.data;
        const { updateNodeBoxStyle, moveNodeIndex } = this.methods;
        const positionList = ['bottom', 'right', 'left', 'top'];
        const marginList = ['marginTop', 'marginLeft', 'marginRight', 'marginBottom'];
        if (newV === 'relative') {
          // 清空上下左右的位置信息
          positionList.forEach(key => {
            updateNodeBoxStyle({
              options: {
                [key]: undefined
              }
            });
          });
        } else {
          // 清空任何边距信息
          marginList.forEach(key => {
            updateNodeBoxStyle({
              options: {
                [key]: undefined
              }
            });
          });
          // 从相对定位到绝对定位重置一下定位
          if (this.envList.isRelativeBox) {
            ['left', 'top'].forEach(key => {
              updateNodeBoxStyle({
                options: {
                  [key]: '0rem'
                }
              });
            });
          }
          // 设置为position或者fixed后，将元素放到最后
          if (brotherList.length > 1 && curIndex !== (brotherList.length - 1)) {
            moveNodeIndex({ id, type: 'last' });
          }
        }
        updateNodeBoxStyle({
          options: {
            position: newV
          }
        });
      },
      get() {
        return this.boxStyle.position;
      }
    },
    canFixed() {
      // 目前把除了最外层的fixed方式都禁了
      let canFixed = false;
      const { parentNode } = this.data;
      // 全屏模式下只有根节点才可以fixed，普通模式下都可以
      if (!parentNode || parentNode.nodeCategory === 'fullpageContainer' || this.envList.isNormalPage) {
        canFixed = true;
      }
      return canFixed;
    },

  },
};
</script>

<style>
</style>
