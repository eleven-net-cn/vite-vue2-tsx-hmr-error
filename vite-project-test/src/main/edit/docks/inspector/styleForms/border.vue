<template>
  <el-row>
    <el-form-item label="边框" label-width="30px">
      <el-tree
        :data="dataArr" :props="defaultProps" :expand-on-click-node="false"
        node-key="label"
        class="tree-node"
      >
        <div slot-scope="{ node,data:itemData }" class="custom-tree-node">
          {{ itemData.type?`${itemData.label}:`:'' }}
          <pz-select
            style="width:80px" size="mini"
            :value="itemData.border.style" @change="setBorder('style',itemData,$event)"
          >
            <pz-option
              v-for="item in borderStyle" :key="item.value" :label="item.label"
              :value="item.value"
            ></pz-option>
          </pz-select>
          <div>
            <PxNum
              :value="itemData.border.width" style="width:50px" :min="0"
              class="px-number"
              :controls="false"
              @input="setBorder('width',itemData,$event)"
            />px
          </div>
          <el-color-picker
            :value="itemData.border.color"
            size="mini"
            @change="setBorder('color',itemData,$event||defaultColor)"
          ></el-color-picker>
        </div>
      </el-tree>
    </el-form-item>
  </el-row>
</template>

<script>
import PxNum from '../styleComp/remNum.vue';
import { initialToUpperCase } from '@/utils/tools';

export default {
  components: {
    PxNum
  },
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
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      positionList: [{
        label: '左',
        type: 'left'
      }, {
        label: '上',
        type: 'top'
      }, {
        label: '右',
        type: 'right'
      }, {
        label: '下',
        type: 'bottom'
      }],
      borderStyle: [
        {
          label: '无边框',
          value: 'none',
        },
        {
          label: '实线',
          value: 'solid',
        },
        {
          label: '虚线',
          value: 'dashed',
        },
        {
          label: '双实线',
          value: 'double',
        },
        {
          label: '圆点',
          value: 'dotted',
        }
      ],
      dataArr: [{}],
      defaultColor: '#000000',
    };
  },
  computed: {
    boxStyle() {
      return this.data.activeNode.boxStyle;
    },
    border() {
      const { border = `0.01rem none ${this.defaultColor}` } = this.boxStyle;
      const borderItems = border.split(' ');
      return {
        width: borderItems[0],
        style: borderItems[1],
        color: borderItems[2]
      };
    },
    treeData() {
      return {
        label: '边框',
        border: this.border,
        children: this.positionList.map(item => {
          const border = {};
          Object.keys(this.border).forEach(key => {
            border[key] = this.getBorderItem(item.type, key);
          });
          return {
            ...item,
            border
          };
        })
      };
    },
  },
  watch: {
    // 什么jb element-tree，使用方式怎么这么恶心
    treeData: {
      immediate: true,
      handler(newVal) {
        Object.keys(newVal).forEach(key => {
          this.$set(this.dataArr[0], key, newVal[key]);
        });
      }
    }
  },
  methods: {
    getBorderItemKey(borderPosition, key) {
      return `border${initialToUpperCase(borderPosition)}${initialToUpperCase(key)}`;
    },
    getBorderItem(borderPosition, key) {
      return this.boxStyle[this.getBorderItemKey(borderPosition, key)] || this.border[key];
    },
    setBorder(key, itemData, val) {
      const options = {};
      const { border } = itemData;
      const newBorder = {};
      Object.keys(border).forEach((borderKey) => {
        // 为当前修改key则拿当前的值，否则拿默认值
        newBorder[borderKey] = borderKey === key ? val : border[borderKey];
      });
      // 有具体方位的话设置具体方位
      if (itemData.type) {
        Object.keys(newBorder).forEach(borderKey => {
          options[this.getBorderItemKey(itemData.type, borderKey)] = newBorder[borderKey];
        });
      } else {
        // 如果修改了全局的border则将对应属性的样式清空按照全局为准，比如原本设置了borderLeftStyle，这时候设置了全局的style则清空使用全局的
        Object.keys(this.boxStyle).forEach(styleKey => {
          if ((new RegExp(`^border(${this.positionList.map(item => initialToUpperCase(item.type)).reduce((previousValue, currentValue) => `${previousValue}|${currentValue}`)})${initialToUpperCase(key)}$`)).test(styleKey)) {
            options[styleKey] = '';
          }
        });
        options.border = Object.values(newBorder).reduce((previousValue, currentValue) => `${previousValue} ${currentValue}`);
      }
      this.methods.updateNodeBoxStyle({
        options
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.tree-node {
  &::v-deep {
    .is-leaf {
      display: none;
    }
    .el-tree-node__content {
      padding-left: 0 !important;
    }
  }
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
  .el-color-picker {
    height: 24px;
  }
  &::v-deep {
    .el-color-picker__trigger {
      height: 24px;
      width: 24px;
    }
    .el-input__inner {
      height: 20px;
      line-height: 20px;
      padding: 0 4px;
    }
  }
  .px-number {
    &::v-deep {
      .el-input__inner {
        padding-right: 0;
      }
    }
  }
}
</style>
