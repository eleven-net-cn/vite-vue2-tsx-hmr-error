<template>
  <div class="num-unit-wrap">
    <el-input-number
      v-if="unit !== 'other'"
      :value="value"
      :precision="unit === 'rem'?0:styleConst.normalPrecise"
      :disabled="value === undefined" class="input" size="mini"
      controls-position="right"
      @change="changeVal($event,'value')"
    ></el-input-number>
    <el-input
      v-else v-model="text" placeholder=""
      class="input" size="mini"
      @change="changeVal($event,'value')"
    />
    <el-select
      :value="unit" class="unit" size="mini"
      placeholder="单位"
      @change="changeVal($event,'unit')"
    >
      <el-option
        v-for="item in unitsMsg"
        :key="item.value" :label="item.label || item.value" :value="item.value"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
import styleConst from '@/constants/style';
import { getCssValAndUnit } from '@/utils/cssUnit';

export default {
  name: 'Num',
  components: {},
  props: {
    styleAttr: {
      type: [String, Number]
    },
    // 自定义能够选择的单位
    customUnits: {
      type: [Array]
    },
    minLimit: {
      type: [Boolean, Object],
      default: false
    }
  },
  data() {
    return {
      styleConst,
      text: '',
    };
  },
  computed: {
    computedAttr() {
      if (this.unit === 'calc') return this.value;
      return this.combine(this.value, this.unit);
    },
    unitsMsg() {
      return this.customUnits || styleConst.unit;
    },
    units() {
      return this.unitsMsg.map(item => item.value);
    },
    valueMsg() {
      const value = this.styleAttr;
      // 如果value为数字0则视为默认单位
      // eslint-disable-next-line no-self-compare
      if (Number(value) === Number(value)) {
        return {
          val: 0,
          unit: this.units[0]
        };
      }
      // value为纯数字的情况下，也为无效值,并且值必须为string
      if (typeof value !== 'string' || !value) {
        return {
          val: undefined,
          unit: 'none'
        };
      }
      let itemMsg;
      // auto的时候val为undefined
      if (value === 'auto') {
        itemMsg = {
          val: undefined,
          unit: 'auto'
        };
      } else {
        itemMsg = getCssValAndUnit(value);
      }
      // 如果该值匹配不到，或者没有center模式下为calc单位的，则使用input表单进行控制
      if (!itemMsg || !this.units.includes(itemMsg.unit)) {
        return {
          val: String(value),
          unit: 'other'
        };
      }
      return itemMsg;
    },
    unit() {
      return this.valueMsg.unit;
    },
    value() {
      if (this.unit === 'rem') {
        return this.valueMsg.val * 100;
      }
      return this.valueMsg.val;
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.text = newVal;
      },
      immediate: true
    },
  },
  methods: {
    changeVal(val, type) {
      let newVal;
      if (type === 'unit') {
        const unitChangeHandlerMap = {
          auto: () => 'auto',
          none: () => undefined,
          other: () => 'calc(50% - 0.1rem)',
          rem: () => {
            if (typeof this.value === 'number') {
              return `${this.value / 100}${val}`;
            }
            return `${0}${val}`;
          },
          default: () => {
            if (typeof this.value === 'number') {
              return `${this.value}${val}`;
            }
            return `${0}${val}`;
          }
        };
        newVal = unitChangeHandlerMap[val] ? unitChangeHandlerMap[val]() : unitChangeHandlerMap.default();
      } else {
        const valueChangeHandlerMap = {
          rem: () => `${val / 100}rem`,
          other: () => val,
          default: () => `${val}${this.unit}`
        };
        newVal = valueChangeHandlerMap[this.unit] ? valueChangeHandlerMap[this.unit]() : valueChangeHandlerMap.default();
      }

      this.$emit('update:styleAttr', newVal);
    }
  },
};
</script>

<style lang="scss" scoped>
.num-unit-wrap {
  display: flex;

  .unit {
    width: 80px;
    margin-right: 10px;
  }

  .input {
    width: 70px;
    margin-right: 10px;
    flex: 1;
  }
}
</style>
