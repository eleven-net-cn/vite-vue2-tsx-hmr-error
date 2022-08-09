<template>
  <el-form-item v-show="aligns.length" label="对齐" class="align-wrap">
    <div class="align-tools">
      <el-tooltip
        v-for="align in aligns" :key="align.desc"
        effect="dark"
        :content="align.desc"
        placement="bottom-start"
      >
        <a
          class="align-btn iconfont"
          :class="[align.icon,{active:positionType(align)}]"
          href="javascript:void(0);"
          @click="doAlign(align)"
        />
      </el-tooltip>
    </div>
  </el-form-item>
</template>

<script>
import styleConst from '@/constants/style';
import { getCssValAndUnit } from '@/utils';
import { checkPositionType } from '@/utils/handlerNodes';

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
    }
  },
  computed: {
    activeNode() {
      return this.data.activeNode;
    },
    boxStyle() {
      return this.activeNode.boxStyle;
    },
    isRelative() {
      return this.boxStyle.position === 'relative';
    },
    aligns() {
      const validAligns = (item) => {
        const dep = this.boxStyle[item.dep];
        const depMsg = getCssValAndUnit(dep);
        return !dep || (depMsg && depMsg.unit !== 'calc');
      };
      const aligns = styleConst.aligns[this.boxStyle.position] || styleConst.aligns.all;
      return aligns.filter(item => validAligns(item));
    },

  },
  methods: {
    doAlign(align) {
      const { updateNodeBoxStyle } = this.methods;
      const { boxStyle } = this;
      let formatVal;
      switch (align.name) {
      case 't':
        updateNodeBoxStyle({
          options: {
            bottom: undefined,
            top: '0rem',
          }
        });
        break;
      case 'b':
        updateNodeBoxStyle({
          options: {
            bottom: '0rem',
            top: undefined,
          }
        });
        break;
      case 'm':
        if (this.isRelative) {
          formatVal = getCssValAndUnit(boxStyle.width);
          updateNodeBoxStyle({
            options: {
              marginLeft: `calc(50% - ${formatVal.val / 2}${formatVal.unit})`,
              marginRight: undefined
            }
          });
        } else if (align.dir === 'raw') {
          formatVal = getCssValAndUnit(boxStyle.width);
          updateNodeBoxStyle({
            options: {
              left: `calc(50% - ${formatVal.val / 2}${formatVal.unit})`,
              right: undefined,
            }
          });
        } else {
          formatVal = getCssValAndUnit(boxStyle.height);
          updateNodeBoxStyle({
            options: {
              top: `calc(50% - ${formatVal.val / 2}${formatVal.unit})`,
              bottom: undefined,
            }
          });
        }
        break;
      case 'l':

        if (this.isRelative) {
          formatVal = getCssValAndUnit(boxStyle.width);
          updateNodeBoxStyle({
            options: {
              marginRight: undefined,
              marginLeft: undefined,
            }
          });
        } else {
          updateNodeBoxStyle({
            options: {
              left: '0rem',
              right: undefined,
            }
          });
        }

        break;
      case 'r':
        if (this.isRelative) {
          formatVal = getCssValAndUnit(boxStyle.width);
          this.$set(boxStyle, 'marginLeft', `calc(100% - ${formatVal.val}${formatVal.unit})`);
          this.$set(boxStyle, 'marginRight', undefined);
        } else {
          updateNodeBoxStyle({
            options: {
              right: '0rem',
              left: undefined,
            }
          });
        }
        break;
      default:
      }
    },
    // 当前的对齐方式
    positionType(align) {
      if (this.isRelative) return false;
      const curType = checkPositionType(this.activeNode.boxStyle);
      if (align.dir === 'raw') {
        return curType[1] === align.name;
      }
      return curType[0] === align.name;
    },
  }
};
</script>

<style lang="scss" scoped>
@import "@/var.scss";
.align-wrap {
  .align-tools {
    padding: 6px 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    line-height: 20px;
    .align-btn {
      margin: 0 6px;

      &:hover {
        color: $primary-color;
      }
      &.active {
        background-color: #aaa;
      }
    }
  }
}
</style>
